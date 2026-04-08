from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from django.core.mail import send_mail
from .models import Job, Application, UserProfile
import json
import os


# ==================== AUTHENTICATION VIEWS ====================

# REGISTER a new user
@csrf_exempt
def register_user(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        full_name = data.get("full_name", "")
        role = data.get("role", "job_seeker")  # job_seeker or recruiter

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already registered"}, status=400)

        # Create new user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=full_name.split()[0] if full_name else "",
            last_name=full_name.split()[-1] if full_name and len(full_name.split()) > 1 else ""
        )

        # Store role in user profile (using last_name temporarily or create profile)
        user.save()

        # Auto login after registration
        login(request, user)

        return JsonResponse({
            "message": "Account created successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": f"{user.first_name} {user.last_name}".strip(),
                "role": role
            }
        })


# LOGIN user
@csrf_exempt
def login_user(request):
    if request.method == "POST":
        data = json.loads(request.body)

        username = data.get("username")
        password = data.get("password")

        # Authenticate user
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "full_name": f"{user.first_name} {user.last_name}".strip()
                }
            })
        else:
            return JsonResponse({"error": "Invalid username or password"}, status=401)


# LOGOUT user
@csrf_exempt
def logout_user(request):
    logout(request)
    return JsonResponse({"message": "Logged out successfully"})


# GET current user
def get_current_user(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "full_name": f"{request.user.first_name} {request.user.last_name}".strip()
            }
        })
    else:
        return JsonResponse({"authenticated": False}, status=401)


# ==================== JOB VIEWS ====================

# GET all jobs (public access)
def job_list(request):
    jobs = list(Job.objects.values())
    return JsonResponse(jobs, safe=False)


# CREATE a new job (requires authentication)
@csrf_exempt
def create_job(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if request.method == "POST":
        data = json.loads(request.body)

        job = Job.objects.create(
            title=data.get("title"),
            company=data.get("company"),
            location=data.get("location"),
            job_type=data.get("job_type"),
            description=data.get("description"),
            posted_by=request.user  # Store who posted the job
        )

        return JsonResponse({"message": "Job created successfully", "job_id": job.id})


# APPLY for a job (requires authentication)
@csrf_exempt
def apply_job(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required. Please login to apply."}, status=401)

    if request.method == "POST":
        data = json.loads(request.body)

        job_id = data.get("job_id")

        # Check if job exists
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return JsonResponse({"error": "Job not found"}, status=404)

        # Check if already applied
        if Application.objects.filter(job=job, applicant_email=request.user.email).exists():
            return JsonResponse({"error": "You have already applied to this job"}, status=400)

        application = Application.objects.create(
            job=job,
            applicant_name=request.user.get_full_name() or request.user.username,
            applicant_email=request.user.email,
            user=request.user  # Link to authenticated user
        )

        # Send email notification to applicant
        try:
            send_mail(
                subject=f'Application Submitted - {job.title} at {job.company}',
                message=f'''Dear {request.user.get_full_name() or request.user.username},

Thank you for applying to the {job.title} position at {job.company}.

Your application has been successfully submitted. Here are the details:

Job Title: {job.title}
Company: {job.company}
Location: {job.location}
Job Type: {job.job_type}

We will notify you once the recruiter reviews your application.

Best of luck!
- HireNest Team
''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email send failed: {e}")

        # Send notification to job poster (if different from applicant)
        if job.posted_by and job.posted_by.email != request.user.email:
            try:
                send_mail(
                    subject=f'New Application for {job.title}',
                    message=f'''Hello,

You have received a new application for your job posting:

Job: {job.title} at {job.company}
Applicant: {request.user.get_full_name() or request.user.username}
Email: {request.user.email}

Login to HireNest to review this application.

- HireNest Team
''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[job.posted_by.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Email to poster failed: {e}")

        return JsonResponse({"message": "Application submitted successfully", "application_id": application.id})


# GET all applications for current user
def application_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    # Get applications for the logged-in user
    applications = list(
        Application.objects.filter(user=request.user).values(
            "id",
            "job__id",
            "job__title",
            "job__company",
            "job__location",
            "job__job_type",
            "applicant_name",
            "applicant_email",
            "applied_at"
        )
    )

    return JsonResponse(applications, safe=False)


# GET applications for a specific job (for recruiters)
@csrf_exempt
def get_job_applications(request, job_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    applications = list(
        Application.objects.filter(job_id=job_id).values(
            "id",
            "applicant_name",
            "applicant_email",
            "applied_at"
        )
    )

    return JsonResponse(applications, safe=False)


# ==================== USER PROFILE & RESUME VIEWS ====================

# GET or UPDATE user profile
@csrf_exempt
def user_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if request.method == "GET":
        try:
            profile = UserProfile.objects.get(user=request.user)
            return JsonResponse({
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                    "full_name": f"{request.user.first_name} {request.user.last_name}".strip()
                },
                "profile": {
                    "mobile": profile.mobile,
                    "role": profile.role,
                    "bio": profile.bio,
                    "skills": profile.skills,
                    "resume_uploaded_at": profile.resume_uploaded_at.isoformat() if profile.resume_uploaded_at else None,
                    "has_resume": bool(profile.resume)
                }
            })
        except UserProfile.DoesNotExist:
            # Create profile if doesn't exist
            profile = UserProfile.objects.create(user=request.user)
            return JsonResponse({
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                    "full_name": f"{request.user.first_name} {request.user.last_name}".strip()
                },
                "profile": {
                    "mobile": "",
                    "role": "job_seeker",
                    "bio": "",
                    "skills": "",
                    "resume_uploaded_at": None,
                    "has_resume": False
                }
            })

    elif request.method == "PUT":
        data = json.loads(request.body)
        profile, created = UserProfile.objects.get_or_create(user=request.user)

        if "mobile" in data:
            profile.mobile = data["mobile"]
        if "role" in data:
            profile.role = data["role"]
        if "bio" in data:
            profile.bio = data["bio"]
        if "skills" in data:
            profile.skills = data["skills"]

        profile.save()

        return JsonResponse({
            "message": "Profile updated successfully",
            "profile": {
                "mobile": profile.mobile,
                "role": profile.role,
                "bio": profile.bio,
                "skills": profile.skills
            }
        })


# UPLOAD resume
@csrf_exempt
def upload_resume(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if request.method == "POST":
        if "resume" not in request.FILES:
            return JsonResponse({"error": "No resume file provided"}, status=400)

        resume_file = request.FILES["resume"]

        # Validate file type
        allowed_types = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if resume_file.content_type not in allowed_types:
            return JsonResponse({"error": "Only PDF and DOC/DOCX files are allowed"}, status=400)

        # Save file
        file_path = f"resumes/user_{request.user.id}/{resume_file.name}"

        # Delete old resume if exists
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        if profile.resume:
            profile.resume.delete()

        # Save new resume
        profile.resume = file_path
        profile.resume_uploaded_at = __import__('datetime').datetime.now()
        profile.save()

        return JsonResponse({
            "message": "Resume uploaded successfully",
            "file_name": resume_file.name,
            "uploaded_at": profile.resume_uploaded_at.isoformat()
        })


# DELETE resume
@csrf_exempt
def delete_resume(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    try:
        profile = UserProfile.objects.get(user=request.user)
        if profile.resume:
            profile.resume.delete()
            profile.resume = None
            profile.resume_uploaded_at = None
            profile.save()
        return JsonResponse({"message": "Resume deleted successfully"})
    except UserProfile.DoesNotExist:
        return JsonResponse({"error": "Profile not found"}, status=404)

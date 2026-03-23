from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Job, Application
import json


# GET all jobs
def job_list(request):
    jobs = list(Job.objects.values())
    return JsonResponse(jobs, safe=False)


# CREATE a new job
@csrf_exempt
def create_job(request):

    if request.method == "POST":

        data = json.loads(request.body)

        job = Job.objects.create(
            title=data.get("title"),
            company=data.get("company"),
            location=data.get("location"),
            job_type=data.get("job_type"),
            description=data.get("description")
        )

        return JsonResponse({"message": "Job created successfully"})


# APPLY for a job
@csrf_exempt
def apply_job(request):

    if request.method == "POST":

        data = json.loads(request.body)

        job = Job.objects.get(id=data.get("job_id"))

        application = Application.objects.create(
            job=job,
            applicant_name=data.get("name"),
            applicant_email=data.get("email")
        )

        return JsonResponse({"message": "Application submitted"})


# GET all applications
def application_list(request):

    applications = list(
        Application.objects.values(
            "id",
            "job__title",
            "job__company",
            "applicant_name",
            "applicant_email",
            "applied_at"
        )
    )

    return JsonResponse(applications, safe=False)
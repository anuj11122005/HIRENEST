import os
from django.db import models
from django.contrib.auth.models import User


def resume_upload_path(instance, filename):
    return os.path.join('resumes', f'user_{instance.user.id}', filename)


class Job(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    job_type = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='posted_jobs')

    def __str__(self):
        return self.title


class Application(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='applications')
    applicant_name = models.CharField(max_length=200)
    applicant_email = models.EmailField()
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.applicant_name} - {self.job.title}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    mobile = models.CharField(max_length=15, blank=True)
    role = models.CharField(max_length=50, default='job_seeker')  # job_seeker or recruiter
    resume = models.FileField(upload_to=resume_upload_path, null=True, blank=True)
    resume_uploaded_at = models.DateTimeField(null=True, blank=True)
    bio = models.TextField(blank=True)
    skills = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
from django.urls import path
from .views import job_list, create_job, apply_job, application_list

urlpatterns = [
    path('jobs/', job_list),
    path('jobs/create/', create_job),
    path('apply/', apply_job),
    path('applications/', application_list),
]
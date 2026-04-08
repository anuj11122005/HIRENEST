from django.urls import path
from .views import (
    job_list, create_job, apply_job, application_list,
    register_user, login_user, logout_user, get_current_user,
    get_job_applications, user_profile, upload_resume, delete_resume
)

urlpatterns = [
    # Authentication
    path('auth/register/', register_user),
    path('auth/login/', login_user),
    path('auth/logout/', logout_user),
    path('auth/me/', get_current_user),

    # Jobs
    path('jobs/', job_list),
    path('jobs/create/', create_job),
    path('jobs/<int:job_id>/applications/', get_job_applications),

    # Applications
    path('apply/', apply_job),
    path('applications/', application_list),

    # User Profile & Resume
    path('profile/', user_profile),
    path('profile/upload-resume/', upload_resume),
    path('profile/delete-resume/', delete_resume),
]
from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.my_profile, name='my_profile'),
    path('picture/', views.upload_profile_picture, name='upload_profile_picture'),
    path('picture/<str:username>/', views.get_profile_picture, name='get_profile_picture'),
    path('<str:username>/', views.get_profile_by_username, name='profile_by_username'),
]

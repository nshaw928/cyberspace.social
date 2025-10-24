from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):
    # Basic Auth Fields
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)  # Ensure username uniqueness
    USERNAME_FIELD = 'email'  # Set email as the unique identifier for authentication
    REQUIRED_FIELDS = ['username']  # No additional fields required for authentication

    # Date Tracking Fields
    date_joined = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
    
class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)  # Image upload field for profile picture
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(max_length=255, blank=True)
    link = models.URLField(max_length=255, blank=True)

    def __str__(self):
        return self.user.username
    

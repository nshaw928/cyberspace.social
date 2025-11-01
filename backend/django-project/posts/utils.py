from datetime import timedelta
from django.utils import timezone
from .models import Post


def can_user_post(user):
    """
    Check if user can create a new post (rate limiting: 1 post per 5 minutes).
    """
    five_minutes_ago = timezone.now() - timedelta(minutes=5)
    recent_posts = Post.objects.filter(user=user, created_at__gte=five_minutes_ago).count()
    
    return recent_posts == 0


def get_user_post_count(user):
    """
    Get the number of posts a user has created.
    """
    return Post.objects.filter(user=user).count()

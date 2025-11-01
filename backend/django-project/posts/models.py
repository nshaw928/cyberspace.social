from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    image_path = models.CharField(max_length=500)
    caption = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]
        db_table = 'posts'

    def __str__(self):
        return f"Post by {self.user.username} at {self.created_at}"

    def clean(self):
        # Validate max 1000 posts per user
        if not self.pk:  # Only check on creation
            user_post_count = Post.objects.filter(user=self.user).count()
            if user_post_count >= 1000:
                raise ValidationError("Maximum 1000 posts per user reached")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'user']),
        ]
        db_table = 'comments'

    def __str__(self):
        return f"Comment by {self.user.username} on post {self.post.id}"

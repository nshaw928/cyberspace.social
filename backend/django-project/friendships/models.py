from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Friendship(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
    ]
    
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships_initiated')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships_received')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_requests_sent')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user1', 'user2']
        indexes = [
            models.Index(fields=['user1', 'user2', 'status']),
        ]
        db_table = 'friendships'
    
    def __str__(self):
        return f"{self.user1.username} <-> {self.user2.username} ({self.status})"
    
    def clean(self):
        # Ensure user1 and user2 are different
        if self.user1 == self.user2:
            raise ValidationError("Cannot be friends with yourself")
        
        # Ensure user1.id < user2.id for consistency (normalize friendship)
        if self.user1.id > self.user2.id:
            self.user1, self.user2 = self.user2, self.user1
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

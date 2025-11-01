from django.db.models import Q
from .models import Friendship


def normalize_friendship(user1, user2):
    """
    Ensure user1.id < user2.id for consistent friendship lookups.
    """
    if user1.id > user2.id:
        return user2, user1
    return user1, user2


def get_friendship_status(user1, user2):
    """
    Get the friendship status between two users.
    Returns: 'accepted', 'pending', or None
    """
    u1, u2 = normalize_friendship(user1, user2)
    
    try:
        friendship = Friendship.objects.get(user1=u1, user2=u2)
        return friendship.status
    except Friendship.DoesNotExist:
        return None


def are_friends(user1, user2):
    """
    Check if two users are friends (accepted friendship).
    """
    return get_friendship_status(user1, user2) == 'accepted'


def get_friend_count(user):
    """
    Get the number of accepted friendships for a user.
    """
    return Friendship.objects.filter(
        Q(user1=user) | Q(user2=user),
        status='accepted'
    ).count()


def can_add_friend(user):
    """
    Check if user can add more friends (max 5000).
    """
    return get_friend_count(user) < 5000

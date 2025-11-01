from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Friendship
from .serializers import FriendshipSerializer, FriendRequestSerializer, FriendSerializer
from .utils import normalize_friendship, are_friends, can_add_friend, get_friend_count


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    """
    Get all accepted friends for the current user.
    """
    friendships = Friendship.objects.filter(
        Q(user1=request.user) | Q(user2=request.user),
        status='accepted'
    ).select_related('user1', 'user2', 'user1__profile', 'user2__profile')
    
    serializer = FriendshipSerializer(friendships, many=True, context={'request': request})
    return Response({
        'friends': serializer.data,
        'count': len(serializer.data)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friend_requests(request):
    """
    Get all pending friend requests for the current user.
    Only returns requests sent TO you (not requests you sent).
    """
    # Get friendships where current user is involved and status is pending
    # Exclude requests where current user is the requester (those are sent requests)
    requests = Friendship.objects.filter(
        Q(user1=request.user) | Q(user2=request.user),
        status='pending'
    ).exclude(requester=request.user).select_related('requester', 'requester__profile')
    
    serializer = FriendRequestSerializer(requests, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sent_requests(request):
    """
    Get all pending friend requests SENT by the current user.
    """
    requests = Friendship.objects.filter(
        requester=request.user,
        status='pending'
    ).select_related('user1', 'user2', 'user1__profile', 'user2__profile')
    
    serializer = FriendshipSerializer(requests, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    """
    Send a friend request to another user.
    """
    username = request.data.get('username', '').strip()
    
    if not username:
        return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        target_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Can't friend yourself
    if target_user == request.user:
        return Response({'error': 'Cannot send friend request to yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check friend limit
    if not can_add_friend(request.user):
        return Response({'error': 'Friend limit reached (max 5000)'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not can_add_friend(target_user):
        return Response({'error': 'Target user has reached friend limit'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Normalize users
    u1, u2 = normalize_friendship(request.user, target_user)
    
    # Check if friendship already exists
    existing = Friendship.objects.filter(user1=u1, user2=u2).first()
    if existing:
        if existing.status == 'accepted':
            return Response({'error': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Friend request already pending'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create friendship request
    friendship = Friendship.objects.create(
        user1=u1,
        user2=u2,
        status='pending',
        requester=request.user
    )
    
    serializer = FriendshipSerializer(friendship, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request, friendship_id):
    """
    Accept a pending friend request.
    """
    friendship = get_object_or_404(Friendship, id=friendship_id)
    
    # Verify user is the recipient of the request (not the requester)
    if friendship.requester == request.user:
        return Response({'error': 'Cannot accept your own friend request'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify user is part of the friendship
    if friendship.user1 != request.user and friendship.user2 != request.user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    # Verify friendship is pending
    if friendship.status != 'pending':
        return Response({'error': 'Friend request is not pending'}, status=status.HTTP_400_BAD_REQUEST)
    
    friendship.status = 'accepted'
    friendship.save()
    
    serializer = FriendshipSerializer(friendship, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def decline_friend_request(request, friendship_id):
    """
    Decline a pending friend request.
    """
    friendship = get_object_or_404(Friendship, id=friendship_id)
    
    # Verify user is the recipient of the request (not the requester)
    if friendship.requester == request.user:
        return Response({'error': 'Cannot decline your own friend request'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify user is part of the friendship
    if friendship.user1 != request.user and friendship.user2 != request.user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    # Verify friendship is pending
    if friendship.status != 'pending':
        return Response({'error': 'Friend request is not pending'}, status=status.HTTP_400_BAD_REQUEST)
    
    friendship.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_friend_request(request, friendship_id):
    """
    Cancel a pending friend request that YOU sent.
    """
    friendship = get_object_or_404(Friendship, id=friendship_id)
    
    # Verify user is the requester
    if friendship.requester != request.user:
        return Response({'error': 'Can only cancel requests you sent'}, status=status.HTTP_403_FORBIDDEN)
    
    # Verify friendship is pending
    if friendship.status != 'pending':
        return Response({'error': 'Friend request is not pending'}, status=status.HTTP_400_BAD_REQUEST)
    
    friendship.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_friend(request, friendship_id):
    """
    Remove an accepted friendship.
    """
    friendship = get_object_or_404(Friendship, id=friendship_id)
    
    # Verify user is part of the friendship
    if friendship.user1 != request.user and friendship.user2 != request.user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    friendship.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

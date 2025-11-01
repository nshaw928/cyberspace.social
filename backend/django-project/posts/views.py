from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Post, Comment
from .serializers import PostSerializer, PostCreateSerializer, CommentSerializer
from .permissions import IsPostOwnerOrReadOnly, IsCommentOwnerOrPostOwner
from .utils import can_user_post
from friendships.models import Friendship


class FeedPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit'
    max_page_size = 50


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_feed(request):
    """
    Get paginated feed of posts from friends (mutual friendships only).
    """
    # Get all friends (accepted friendships)
    friendships = Friendship.objects.filter(
        Q(user1=request.user) | Q(user2=request.user),
        status='accepted'
    )
    
    # Extract friend user IDs
    friend_ids = set()
    for friendship in friendships:
        if friendship.user1 == request.user:
            friend_ids.add(friendship.user2.id)
        else:
            friend_ids.add(friendship.user1.id)
    
    # Get posts from friends, ordered by most recent
    posts = Post.objects.filter(user__id__in=friend_ids).select_related('user', 'user__profile').order_by('-created_at')
    
    # Paginate
    paginator = FeedPagination()
    paginated_posts = paginator.paginate_queryset(posts, request)
    
    serializer = PostSerializer(paginated_posts, many=True, context={'request': request})
    
    # Return custom response format
    has_more = paginator.page.has_next() if paginated_posts else False
    
    return Response({
        'posts': serializer.data,
        'hasMore': has_more
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_post(request, post_id):
    """
    Get a single post by ID.
    """
    post = get_object_or_404(Post, id=post_id)
    serializer = PostSerializer(post, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    """
    Create a new post with image upload.
    """
    # Check rate limiting
    if not can_user_post(request.user):
        return Response(
            {'error': 'You can only post once every 5 minutes'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    serializer = PostCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        post = serializer.save()
        response_serializer = PostSerializer(post, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsPostOwnerOrReadOnly])
def update_post(request, post_id):
    """
    Update post caption only (images cannot be changed).
    """
    post = get_object_or_404(Post, id=post_id)
    
    # Check permission
    if post.user != request.user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    # Only allow caption updates
    caption = request.data.get('caption', '')
    if len(caption) > 255:
        return Response({'error': 'Caption too long (max 255 characters)'}, status=status.HTTP_400_BAD_REQUEST)
    
    post.caption = caption
    post.save()
    
    serializer = PostSerializer(post, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsPostOwnerOrReadOnly])
def delete_post(request, post_id):
    """
    Delete a post (only by post owner).
    """
    post = get_object_or_404(Post, id=post_id)
    
    # Check permission
    if post.user != request.user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    # Delete image file
    import os
    from django.conf import settings
    
    image_path = os.path.join(settings.MEDIA_ROOT, post.image_path)
    if os.path.exists(image_path):
        os.remove(image_path)
    
    post.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_posts(request):
    """
    Get all posts by the current authenticated user.
    """
    posts = Post.objects.filter(user=request.user).select_related('user', 'user__profile').order_by('-created_at')
    
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_posts(request, username):
    """
    Get all posts by a specific user.
    """
    user = get_object_or_404(User, username=username)
    posts = Post.objects.filter(user=user).select_related('user', 'user__profile')
    
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)


# Comment views

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_post_comments(request, post_id):
    """
    Get comments for a post (filtered by visibility rules).
    """
    post = get_object_or_404(Post, id=post_id)
    
    # Filter comments based on visibility rules
    if post.user == request.user:
        # Post owner sees all comments
        comments = post.comments.all()
    else:
        # Others only see their own comments
        comments = post.comments.filter(user=request.user)
    
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, post_id):
    """
    Create a comment on a post.
    """
    post = get_object_or_404(Post, id=post_id)
    
    comment_text = request.data.get('text', '').strip()
    if not comment_text:
        return Response({'error': 'Comment text is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    comment = Comment.objects.create(
        post=post,
        user=request.user,
        comment_text=comment_text
    )
    
    serializer = CommentSerializer(comment)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsCommentOwnerOrPostOwner])
def delete_comment(request, comment_id):
    """
    Delete a comment (by comment owner or post owner).
    """
    comment = get_object_or_404(Comment, id=comment_id)
    
    # Check permission
    if comment.user != request.user and comment.post.user != request.user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    comment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

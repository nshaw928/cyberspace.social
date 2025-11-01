from rest_framework import serializers
from .models import Post, Comment
from profiles.serializers import ProfileSerializer


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    display_name = serializers.CharField(source='user.profile.display_name', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'username', 'display_name', 'comment_text', 'created_at']
        read_only_fields = ['id', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    display_name = serializers.CharField(source='user.profile.display_name', read_only=True)
    profile_picture_base64 = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'username', 'display_name', 'profile_picture_base64', 'image_path', 'caption', 'created_at', 'updated_at', 'comments']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_profile_picture_base64(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.profile_picture:
            import base64
            return base64.b64encode(obj.user.profile.profile_picture).decode('utf-8')
        return None

    def get_comments(self, obj):
        request = self.context.get('request')
        if not request:
            return []
        
        # Filter comments based on visibility rules
        # User can see: their own comments + all comments if they own the post
        if obj.user == request.user:
            # Post owner sees all comments
            comments = obj.comments.all()
        else:
            # Others only see their own comments
            comments = obj.comments.filter(user=request.user)
        
        return CommentSerializer(comments, many=True).data


class PostCreateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True)
    
    class Meta:
        model = Post
        fields = ['image', 'caption']

    def validate_image(self, value):
        # Max 2MB
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("Image file too large ( > 2MB )")
        return value

    def create(self, validated_data):
        import os
        from django.conf import settings
        from django.utils import timezone
        
        image = validated_data.pop('image')
        user = self.context['request'].user
        
        # Create media directory if it doesn't exist
        media_root = settings.MEDIA_ROOT
        if not os.path.exists(media_root):
            os.makedirs(media_root)
        
        # Generate unique filename
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{user.id}_{timestamp}.jpg"
        filepath = os.path.join(media_root, filename)
        
        # Save image to filesystem
        with open(filepath, 'wb+') as destination:
            for chunk in image.chunks():
                destination.write(chunk)
        
        # Create post with relative path
        post = Post.objects.create(
            user=user,
            image_path=filename,
            caption=validated_data.get('caption', ''),
        )
        
        return post

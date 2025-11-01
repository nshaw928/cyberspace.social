from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Friendship


class FriendSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    display_name = serializers.CharField(source='profile.display_name', read_only=True)
    profile_picture_base64 = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'profile_picture_base64']
    
    def get_profile_picture_base64(self, obj):
        if hasattr(obj, 'profile') and obj.profile.profile_picture:
            import base64
            return base64.b64encode(obj.profile.profile_picture).decode('utf-8')
        return None


class FriendshipSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    
    class Meta:
        model = Friendship
        fields = ['id', 'friend', 'status', 'requester_username', 'created_at']
    
    def get_friend(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        
        # Determine which user is the friend (not the request user)
        friend = obj.user2 if obj.user1 == request.user else obj.user1
        return FriendSerializer(friend).data


class FriendRequestSerializer(serializers.ModelSerializer):
    requester = FriendSerializer(read_only=True)
    
    class Meta:
        model = Friendship
        fields = ['id', 'requester', 'created_at']

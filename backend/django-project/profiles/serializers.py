from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
import base64


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email')
    profile_picture_base64 = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['username', 'display_name', 'bio', 'link', 'email', 'profile_picture_base64', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_profile_picture_base64(self, obj):
        if obj.profile_picture:
            return base64.b64encode(obj.profile_picture).decode('utf-8')
        return None

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        
        # Update user fields
        if 'email' in user_data:
            instance.user.email = user_data['email']
            instance.user.save()
        
        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class ProfilePictureSerializer(serializers.Serializer):
    image = serializers.ImageField()

    def validate_image(self, value):
        # Max 500KB
        if value.size > 500 * 1024:
            raise serializers.ValidationError("Image file too large ( > 500KB )")
        return value

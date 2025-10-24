from rest_framework import serializers
from django.contrib.auth.models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate(self, data):
            # Check if the email already exists
            if User.objects.filter(email=data['email']).exists():
                raise serializers.ValidationError({"email": "This email is already registered."})
            
            # Optionally, check if the username is already taken
            if User.objects.filter(username=data['username']).exists():
                raise serializers.ValidationError({"username": "This username is already taken."})
            
            return data

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
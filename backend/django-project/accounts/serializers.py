from rest_framework import serializers
from django.contrib.auth.models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['email', 'password']

def create(self, validated_data):
        user = User(
            email = validated_data['email']
        ) # Create new user model
        user.set_password(validated_data['password'])
        user.save() # Save user to database
        return user
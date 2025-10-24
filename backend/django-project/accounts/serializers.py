from rest_framework import serializers
from django.contrib.auth.models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, data):
        user = User(
            username = data['username'],
            email = data['email']
        ) # Create new user model
        user.set_password(data['password'])
        user.save() # Save user to database
        return user
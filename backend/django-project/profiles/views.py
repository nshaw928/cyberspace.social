from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Profile
from .serializers import ProfileSerializer, ProfilePictureSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile_by_username(request, username):
    user = get_object_or_404(User, username=username)
    profile = get_object_or_404(Profile, user=user)
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    profile = get_object_or_404(Profile, user=request.user)
    
    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    profile = get_object_or_404(Profile, user=request.user)
    serializer = ProfilePictureSerializer(data=request.data)
    
    if serializer.is_valid():
        image_file = serializer.validated_data['image']
        profile.profile_picture = image_file.read()
        profile.save()
        return Response({'success': True})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile_picture(request, username):
    user = get_object_or_404(User, username=username)
    profile = get_object_or_404(Profile, user=user)
    
    if profile.profile_picture:
        from django.http import HttpResponse
        return HttpResponse(profile.profile_picture, content_type='image/jpeg')
    
    return Response({'error': 'No profile picture'}, status=status.HTTP_404_NOT_FOUND)

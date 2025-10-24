from django.urls import path

from .views import CustomTokenObtainPairView, CustomRefreshToken

urlpatterns = [
    path('token', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', CustomRefreshToken.as_view(), name='token_refresh'),
]
from django.urls import path

from .views import get_notes, logout, is_authenticated, register, CustomTokenObtainPairView, CustomRefreshToken

urlpatterns = [
    path('token', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', CustomRefreshToken.as_view(), name='token_refresh'),
    path('notes', get_notes),
    path('logout', logout),
    path('authenicated', is_authenticated),
]
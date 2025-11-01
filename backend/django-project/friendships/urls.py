from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_friends, name='get_friends'),
    path('requests/', views.get_friend_requests, name='get_friend_requests'),
    path('sent/', views.get_sent_requests, name='get_sent_requests'),
    path('request/', views.send_friend_request, name='send_friend_request'),
    path('accept/<int:friendship_id>/', views.accept_friend_request, name='accept_friend_request'),
    path('decline/<int:friendship_id>/', views.decline_friend_request, name='decline_friend_request'),
    path('cancel/<int:friendship_id>/', views.cancel_friend_request, name='cancel_friend_request'),
    path('<int:friendship_id>/', views.remove_friend, name='remove_friend'),
]

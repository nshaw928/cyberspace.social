from django.urls import path
from . import views

urlpatterns = [
    # Post endpoints
    path('feed/', views.get_feed, name='post_feed'),
    path('', views.create_post, name='create_post'),
    path('me/', views.get_my_posts, name='my_posts'),
    path('<int:post_id>/', views.get_post, name='get_post'),
    path('<int:post_id>/update/', views.update_post, name='update_post'),
    path('<int:post_id>/delete/', views.delete_post, name='delete_post'),
    path('user/<str:username>/', views.get_user_posts, name='user_posts'),
    
    # Comment endpoints
    path('<int:post_id>/comments/', views.get_post_comments, name='get_post_comments'),
    path('<int:post_id>/comments/create/', views.create_comment, name='create_comment'),
    path('comments/<int:comment_id>/delete/', views.delete_comment, name='delete_comment'),
]

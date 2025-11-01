from django.contrib import admin
from .models import Post, Comment


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'caption', 'created_at')
    search_fields = ('user__username', 'caption')
    list_filter = ('created_at',)
    ordering = ('-created_at',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'comment_text', 'created_at')
    search_fields = ('user__username', 'comment_text')
    list_filter = ('created_at',)
    ordering = ('-created_at',)

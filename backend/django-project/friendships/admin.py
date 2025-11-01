from django.contrib import admin
from .models import Friendship


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('id', 'user1', 'user2', 'status', 'requester', 'created_at')
    search_fields = ('user1__username', 'user2__username')
    list_filter = ('status', 'created_at')
    ordering = ('-created_at',)

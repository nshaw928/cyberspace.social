from rest_framework import permissions


class IsPostOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a post to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the post
        return obj.user == request.user


class IsCommentOwnerOrPostOwner(permissions.BasePermission):
    """
    Custom permission to allow comment deletion by comment owner or post owner.
    """
    def has_object_permission(self, request, view, obj):
        # Allow comment owner to delete their comment
        if obj.user == request.user:
            return True
        
        # Allow post owner to delete any comment on their post
        if obj.post.user == request.user:
            return True
        
        return False

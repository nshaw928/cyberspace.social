"""
Health check endpoint for monitoring and load balancers
"""
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """
    Health check endpoint that verifies:
    - Application is running
    - Database connection is working
    """
    try:
        # Check database connection
        connection.ensure_connection()
        
        return JsonResponse({
            "status": "healthy",
            "database": "connected",
            "application": "running"
        })
    except Exception as e:
        return JsonResponse({
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }, status=500)

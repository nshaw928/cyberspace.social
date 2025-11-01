#!/bin/bash

echo "========================================="
echo "Cyberspace Social - Database Migrations"
echo "========================================="
echo ""

# Make migrations for all apps
echo "Creating migrations..."
python manage.py makemigrations profiles
python manage.py makemigrations posts
python manage.py makemigrations friendships

echo ""
echo "Applying migrations..."
python manage.py migrate

echo ""
echo "✅ Migrations complete!"
echo ""
echo "To create a superuser, run:"
echo "python manage.py createsuperuser"

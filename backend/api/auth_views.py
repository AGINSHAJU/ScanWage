from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from .models import Employee

# Placeholder Client ID - user must replace this
GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user is not None:
        tokens = get_tokens_for_user(user)
        role = 'Admin' if user.is_superuser else 'Employee'
        if hasattr(user, 'employee_profile'):
            role = user.employee_profile.role
            
        return Response({
            'tokens': tokens,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': role
            }
        })
    else:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login_view(request):
    token = request.data.get('token')
    
    # DEV MODE: If token is 'dev_mode', simulate a user
    if token == 'dev_mode':
        email = "devuser@example.com"
        name = "Dev User"
    else:
        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
            email = idinfo['email']
            name = idinfo.get('name', 'Google User')
        except ValueError:
            return Response({"detail": "Invalid Google token"}, status=status.HTTP_401_UNAUTHORIZED)

    user, created = User.objects.get_or_create(username=email, defaults={'email': email})
    if created:
        user.set_unusable_password()
        user.save()
        Employee.objects.create(
            user=user,
            employee_id=f"EMP-{user.id}",
            name=name,
            role='Employee',
            status='Active'
        )
        
    tokens = get_tokens_for_user(user)
    role = 'Admin' if user.is_superuser else 'Employee'
    if hasattr(user, 'employee_profile'):
        role = user.employee_profile.role
        
    return Response({
        'tokens': tokens,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role
        }
    })

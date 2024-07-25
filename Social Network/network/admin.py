from django.contrib import admin
from .models import User, Posto, Follow
from django.contrib.auth.admin import UserAdmin

# Register your models here.

admin.site.register(User)
admin.site.register(Posto)
admin.site.register(Follow)

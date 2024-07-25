
from django.urls import path

from . import views

APP_NAME = "network"

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts", views.compose, name='compose'),
    path("posts/<int:post_id>", views.one_post, name="one_post"),
    path("posts/<str:profile>", views.posts, name="posts"),
    path("followers/<str:profile>", views.followers, name="followers"),
    path("checkRecord/<str:profile>", views.checkRecord, name="checkRecord"),
]

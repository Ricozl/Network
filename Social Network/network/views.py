import json

import requests
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import User, Posto, Follow


def index(request):
    return render(request, "network/index.html")


@login_required
def compose(request):
    # add new post
    if request.method == "POST":
        data = json.loads(request.body)
        content = data.get("content", "")
        # if content is blank, reject
        if content == "":
            return JsonResponse({
                "Error": "No content found"
            }, status=400)

        post = Posto(
            poster=request.user,
            content=content,
        )
        # save new post
        post.save()

        return JsonResponse({"message": "Successful Update."}, status=200)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)


def posts(request, profile):
    if profile == "all_posts":
        # get all posts by all posters
        posts = Posto.objects.all()
    elif profile == "following":
        # determine who user is following and get their posts to display
        reqUsernm = request.user.username
        try:
            usernm = User.objects.get(username__exact=reqUsernm)
        except User.DoesNotExist:
            return JsonResponse({"Error": "User not found"})
        followedNms = Follow.objects.filter(
            follower=usernm, is_active=True).values_list('followed')
        posts = Posto.objects.filter(poster__id__in=followedNms)
    else:
        # get posts posted by chosen username
        try:
            list = User.objects.get(username__exact=profile)
        except User.DoesNotExist:
            return JsonResponse({"Error": "User not found"})
        posts = Posto.objects.filter(poster__exact=list.id)

    return JsonResponse([post.serialize() for post in posts], safe=False)


def one_post(request, post_id):
    # update a specific post in database (likes, content)
    # query for requested post
    try:
        post = Posto.objects.get(pk=post_id)
    except Posto.DoesNotExist:
        return JsonResponse({"Error": "post not found"}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("content"):
            post.content = data.get("content")
        else:
            post.likes = data.get("likes")
        post.save()
    return JsonResponse(post.serialize(), safe=False)


def followers(request, profile):
    # determine if "follow" and "unfollow" buttons should be displayed
    if request.user.username:
        showButtons = 'true'
    else:
        showButtons = 'false'
    if (profile == request.user.username):
        showButtons = 'false'

    # get number of followers and followed by
    try:
        profileId = User.objects.get(username__exact=profile)
    except User.DoesNotExist:
        return JsonResponse({"Error": "User not found."})
    followsNo = Follow.objects.filter(
        follower=profileId, is_active=True).count()
    followedByNo = Follow.objects.filter(
        followed=profileId, is_active=True).count()
    return JsonResponse({"followsNo": followsNo, "followedByNo": followedByNo, "showButtons": showButtons})


@login_required
def checkRecord(request, profile):
    # check if record exists. if not, create new one
    newRecord = False
    activity = ""
    # if follower and followed are the same, return error message
    if (profile == request.user.username):
        # cannot follow yourself
        return JsonResponse({"error": "Error. Cannot follow yourself."}, status=401)
    # query for requested profile to follow
    try:
        userToBefollowed = User.objects.get(username__exact=profile)
    except User.DoesNotExist:
        # requested profile to follow does not exist
        return JsonResponse({"Error": "Error. User not found."}, status=404)
    # query for follower's record
    follower = request.user.username
    try:
        folName = User.objects.get(username__exact=follower)
    except User.DoesNotExist:
        # follower's record not found
        return JsonResponse({"Error": "Error. Follower not found."}, status=404)

    # find out if follow record already exists. If not, create it
    try:
        follow = Follow.objects.get(
            follower__exact=folName, followed__exact=userToBefollowed)
    except Follow.DoesNotExist:
        # record not found so create record
        newRecord = True
        activity = False
        follow = Follow(follower=folName,
                        followed=userToBefollowed, is_active=False)
        follow.save()
        return JsonResponse({"newRecord": newRecord, "activity": activity})

    if request.method == "PUT":
        data = json.loads(request.body)
        follow.is_active = data["is_active"]
        activity = follow.is_active
        follow.save()
        return JsonResponse(follow.serialize(), safe=False)
    activity = follow.is_active
    return JsonResponse({"newRecord": newRecord, "activity": activity})


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

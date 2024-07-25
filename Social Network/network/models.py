from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    numFollowers = models.IntegerField(default=0, null=True, blank=True)


class Posto(models.Model):
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name='p_user')
    content = models.CharField(max_length=512, blank=False)
    postDate = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0, null=True, blank=True)

    class Meta:
        ordering = ['-postDate']

    def serialize(self):
        return {
            "id": self.id,
            "poster": self.poster.username,
            "content": self.content,
            "postDate": self.postDate.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes
        }

    def __str__(self):
        return "On {}, Poster: {} wrote Content: {}, Likes: {}".format(self.postDate, self.poster.username, self.content, self.likes)

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='f_user')
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_name')
    is_active = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "follower": self.follower.username,
            "followed": self.followed.username,
            "is_active": self.is_active
        }

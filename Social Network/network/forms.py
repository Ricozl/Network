from django import forms
from .models import User, Posto

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = '__all__'

class PostForm(forms.ModelForm):
    content = forms.CharField(
        widget=forms.widgets.Textarea(
            attrs={
                "placeholder": "Post Something...",
                "class": "textarea is-success is-medium",
            }
        ),
        label="",
    )
    class Meta:
        model = Posto
        fields = ('poster', 'content')

# Generated by Django 4.1.5 on 2023-01-24 00:00

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_user_numfollowers_alter_user_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='numFollowers',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
        migrations.CreateModel(
            name='Posts',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.CharField(blank=True, max_length=512)),
                ('postDate', models.DateTimeField(auto_now_add=True)),
                ('likes', models.IntegerField(blank=True, default=0, null=True)),
                ('poster', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='p_user', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-postDate'],
            },
        ),
        migrations.CreateModel(
            name='Follow',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=False)),
                ('followed', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='follow_name', to=settings.AUTH_USER_MODEL)),
                ('follower', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='f_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

from django.db import models as m
from django.contrib.auth.models import User


class Photo(m.Model):
    '''
    Represents a single photo in any number of sizes.
    '''
    id = m.CharField(max_length=32, primary_key=True)
    user = m.ForeignKey(User)


class PhotoSize(m.Model):
    '''
    Stores a path to the image file along with its Flickr-defined suffix.
    '''
    SIZE_SUFFIXES = [
        ('s', 'Small square'),
        ('q', 'Large square'),
        ('t', 'Thumbnail'),
        ('m', 'Small (240)'),
        ('n', 'Small (320)'),
        ('z', 'Medium (640)'),
        ('c', 'Medium (800)'),
        ('b', 'Large (1024)'),
        ('h', 'Large (1600)'),
        ('k', 'Large (2048)'),
        ('o', 'Original')]

    photo = m.ForeignKey(Photo, related_name='sizes')
    suffix = m.CharField(max_length=1, choices=SIZE_SUFFIXES)
    image = m.ImageField(upload_to='images')

import requests
import urllib
import logging
from collections import namedtuple

from django.conf import settings
from django.core.files import File

from .models import Photo, PhotoSize

logger = logging.getLogger(__name__)


img_size = namedtuple('img_size', ['url', 'height', 'width'])

SIZES = {s[0]: img_size('url_' + s[0], 'height_' + s[0], 'width_' + s[0]) for s in PhotoSize.SIZE_SUFFIXES}


def get_photo_data(url):
    try:
        r = urllib.urlretrieve(url)
        f = File(open(r[0]))
        return f
    except:
        logger.error('Could not get %s' % url)
        return None


def download_photo(user, result):
    p = Photo(id=result['id'], user=user)
    p.save()
    for suffix, size in SIZES.items():
        if all(k in result for k in size):
            image = get_photo_data(result[size.url])
            if image:
                PhotoSize(
                    photo=p,
                    suffix=suffix,
                    image=image
                ).save()


def run_search(query, page):
    params = {
        'method': settings.FLICKR_SEARCH_METHOD,
        'format': settings.FLICKR_SEARCH_FORMAT,
        'api_key': settings.FLICKR_API_KEY,
        'text': query,
        'page': page,
        'extras': settings.FLICKR_EXTRA_KEYS,
        'nojsoncallback': 1
    }
    rsp = requests.get(settings.FLICKR_URL, params=params)
    if rsp.status_code == requests.codes.ok:
        return rsp.json()
    else:
        rsp.raise_for_status()

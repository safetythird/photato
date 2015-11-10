from django.shortcuts import render
from django.http import JsonResponse

from .flickr_api import download_photo, run_search


def search_page(request):
    '''
    Display the search page.
    '''
    username = not request.user.is_anonymous() and request.user.username or ''
    return render(request, 'index.html', {'username': username})


def api_search(request):
    '''
    Proxy Flickr API requests through the server so that we don't have to send
    secrets to the client.
    '''
    query = request.GET.get('query')
    if not query:
        return JsonResponse({'error': 'query required'})
    page = request.GET.get('page', 1)
    result = run_search(query, page)
    return JsonResponse(result)


def save_photo(request):
    '''
    Takes a JSON-formatted search result from the Flickr Search API, fetches the
    photo in multiple sizes from the Flickr API and saves them.
    '''
    if not request.user.is_authenticated():
        rsp = JsonResponse({'error': 'Login required'})
        rsp.status_code = 401
        return rsp
    search_result = request.POST
    download_photo(request.user, search_result)
    return JsonResponse({'saved': True})

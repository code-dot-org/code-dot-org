import requests
import urllib.parse
import importlib

# Patch requests to proxy all request through the code.org xhr endpoint.
# This is necessary to only allow requests to an allow-list of domains.

# TODO: Patch all requests methods and add requests as a dependency in pyproject.toml.
# Once we've patched all the methods and curriculum wants to expose requests to users,
# call reload_requests_and_patch from setup_pythonlab. See linked ticket for more information.
# https://codedotorg.atlassian.net/browse/CT-537

def get_proxy_path(host, url, channel_id):
    return f"{host}/xhr?u={urllib.parse.quote(url, safe='/:')}&c={urllib.parse.quote(channel_id, safe='/:')}"


def reload_requests_and_patch(host, channel_id):
    # We need to reload requests in case we have already patched it.
    # If we already patched it we would end up duplicating the proxied url every time
    # we patched again, as we wrap the given url with the proxied url.
    importlib.reload(requests)
    patch_requests(host, channel_id)

# Exposed for testing. We don't want to reload requests in a test
# because we need to mock requests.get in order to avoid trying to send a
# real get request.
def patch_requests(host, channel_id):
    _old_get = requests.get

    def get(url, params=None, **kwargs):
        url = get_proxy_path(host, url, channel_id)
        return _old_get(url, params, **kwargs)

    requests.get = get

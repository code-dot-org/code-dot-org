from unittest import mock, TestCase
import requests

from pythonlab_setup.patch_requests import get_proxy_path, patch_requests

class TestPatchRequests(TestCase):
    def test_get_proxy_path(self):
        host = "http://localhost:8000"
        url = "http://example.com/api/data"
        channel_id = "channel123"
        expected = "http://localhost:8000/xhr?u=http://example.com/api/data&c=channel123"
        self.assertEqual(get_proxy_path(host, url, channel_id), expected)

    @mock.patch('requests.get')
    def test_patch_requests(self, mock_get):
        host = "http://localhost:8000"
        channel_id = "channel123"
        patch_requests(host, channel_id)

        test_url = "http://example.com/api/data"
        requests.get(test_url)  # This should now call the patched function

        # Verify requests.get was called correctly
        expected_url = "http://localhost:8000/xhr?u=http://example.com/api/data&c=channel123"
        mock_get.assert_called_once_with(expected_url, None)

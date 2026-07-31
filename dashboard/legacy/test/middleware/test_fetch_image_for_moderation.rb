require_relative 'middleware_test_helper' # Must be required first to establish load paths
require 'mocha/mini_test'
require 'webmock/minitest'
require_relative '../../middleware/files_api'

# Focused unit tests for FilesApi#fetch_image_for_moderation. These intentionally
# avoid FilesApiTestBase/channel setup and exercise the helper directly with
# IPSocket + WebMock stubs.
class FetchImageForModerationTest < Minitest::Test
  def setup
    @api = FilesApi.new!
    @public_ip = '203.0.113.10'
  end

  def teardown
    WebMock.reset!
  end

  def test_rejects_loopback_host
    IPSocket.expects(:getaddress).with('127.0.0.1').returns('127.0.0.1')

    error = assert_raises(SecurityError) do
      @api.fetch_image_for_moderation('https://127.0.0.1/image.png')
    end
    assert_equal 'Image URL host is not allowed.', error.message
  end

  def test_rejects_private_host
    IPSocket.expects(:getaddress).with('internal.example').returns('10.0.0.5')

    error = assert_raises(SecurityError) do
      @api.fetch_image_for_moderation('https://internal.example/image.png')
    end
    assert_equal 'Image URL host is not allowed.', error.message
  end

  def test_follows_redirect_to_image
    IPSocket.stubs(:getaddress).with('images.example.com').returns(@public_ip)
    IPSocket.stubs(:getaddress).with('cdn.example.com').returns('203.0.113.11')

    stub_request(:get, 'https://images.example.com/start.png').
      to_return(status: 302, headers: {'Location' => 'https://cdn.example.com/final.png'})
    stub_request(:get, 'https://cdn.example.com/final.png').
      to_return(status: 200, body: 'png-bytes', headers: {'Content-Type' => 'image/png'})

    body, content_type = @api.fetch_image_for_moderation('https://images.example.com/start.png')
    assert_equal 'png-bytes', body
    assert_equal 'image/png', content_type
  end

  def test_rejects_when_redirect_limit_exceeded
    IPSocket.stubs(:getaddress).with('images.example.com').returns(@public_ip)

    stub_request(:get, 'https://images.example.com/loop.png').
      to_return(status: 302, headers: {'Location' => 'https://images.example.com/loop.png'})

    assert_raises(URI::InvalidURIError) do
      @api.fetch_image_for_moderation('https://images.example.com/loop.png', 0)
    end
  end

  def test_rejects_unsupported_content_type
    IPSocket.stubs(:getaddress).with('images.example.com').returns(@public_ip)

    stub_request(:get, 'https://images.example.com/unsafe.bmp').
      to_return(status: 200, body: 'bmp-bytes', headers: {'Content-Type' => 'image/bmp'})

    assert_raises(AzureAiContentSafety::UnsupportedContentType) do
      @api.fetch_image_for_moderation('https://images.example.com/unsafe.bmp')
    end
  end

  def test_rejects_oversized_content_length
    IPSocket.stubs(:getaddress).with('images.example.com').returns(@public_ip)
    @api.stubs(:max_file_size).returns(10)

    stub_request(:get, 'https://images.example.com/huge.png').
      to_return(
        status: 200,
        body: 'x' * 50,
        headers: {
          'Content-Type' => 'image/png',
          'Content-Length' => '50'
        }
      )

    error = assert_raises(StandardError) do
      @api.fetch_image_for_moderation('https://images.example.com/huge.png')
    end
    assert_equal 'Image URL content exceeds maximum file size.', error.message
  end

  def test_rejects_oversized_streamed_body_without_content_length
    IPSocket.stubs(:getaddress).with('images.example.com').returns(@public_ip)
    @api.stubs(:max_file_size).returns(10)

    stub_request(:get, 'https://images.example.com/huge.png').
      to_return(status: 200, body: 'x' * 50, headers: {'Content-Type' => 'image/png'})

    error = assert_raises(StandardError) do
      @api.fetch_image_for_moderation('https://images.example.com/huge.png')
    end
    assert_equal 'Image URL content exceeds maximum file size.', error.message
  end

  def test_returns_body_and_content_type_on_success
    IPSocket.stubs(:getaddress).with('images.example.com').returns(@public_ip)

    stub_request(:get, 'https://images.example.com/safe.png').
      to_return(status: 200, body: 'png-bytes', headers: {'Content-Type' => 'image/png'})

    body, content_type = @api.fetch_image_for_moderation('https://images.example.com/safe.png')
    assert_equal 'png-bytes', body
    assert_equal 'image/png', content_type
  end
end

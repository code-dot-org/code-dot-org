require_relative '../test_helper'
require 'cdo/lighthouse'
require 'webrick'

class LighthouseTest < Minitest::Test
  PORT = 8000

  def ensure_lighthouse
    skip 'Lighthouse not installed' unless system('which lighthouse >/dev/null 2>&1')
  end

  # Run a temporary WEBrick server around provided block.
  def with_server(proc)
    null = WEBrick::Log.new(File::Constants::NULL)
    server = WEBrick::HTTPServer.new Port: PORT, Logger: null, AccessLog: null
    server.mount_proc('/', proc)
    thread = Thread.new do
      server.start
    ensure server.shutdown
    end
    yield
  ensure
    thread.kill
  end

  def test_lighthouse
    skip
    ensure_lighthouse
    _, json = with_server(->(_, resp) {resp.body = 'Hello World!'}) do
      Lighthouse.test("http://localhost:#{PORT}/")
    end
    result = JSON.parse(json)
    assert_equal 1, result.dig('categories', 'performance', 'score')
  end

  def test_lighthouse_errors
    skip
    ensure_lighthouse
    mount = lambda do |req, resp|
      if req.path == '/'
        resp.content_type = 'text/html'
        resp.body = '<html><body><img src="/error1"/><img src="/error2"/></body></html>'
      else
        resp.status = 404
        resp.body = 'Not Found'
      end
    end
    with_server(mount) do
      assert_raises(Lighthouse::ConsoleError) do
        Lighthouse.test("http://localhost:#{PORT}/")
      end
      assert_raises(Lighthouse::Error) do
        Lighthouse.test("http://localhost:#{PORT}/error")
      end
    end
  end
end

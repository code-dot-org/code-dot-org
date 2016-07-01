require_relative 'test_helper'
require 'cdo/rack/upgrade_insecure_requests'

class HtmlParsingTest < Minitest::Test
  include Rack::Test::Methods

  def build_rack_mock_session
    @session ||= Rack::MockSession.new(app)
  end

  # LibXML bug (?): <span> in head gets (correctly) moved to body element,
  # (incorrectly) removing the body class attribute in the process.
  def app
    html_parsing_app = lambda do |env|
      @request_env = env
      head_span_html = <<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Blockly</title>
<span>&nbsp;</span>
</head>
<body class="readonly embed-block">
<img src="http://google.com" />
</body>
</html>
HTML
      [200, {'Content-Type' => 'text/html'}, [head_span_html]]
    end
    Rack::Builder.app do
      use Rack::UpgradeInsecureRequests
      run html_parsing_app
    end
  end

  def setup
    build_rack_mock_session
  end

  # Ensure html parsing is identical in http and https environments,
  # but that HTTPS-upgrade only occurs in https environment.
  def test_parse_http_and_https
    get '/'
    # Note: this assertion should not imply that this particular behavior is desired,
    # only that the behavior is identical over HTTP and HTTPS.
    assert_match(/\<body\>/, last_response.body)
    assert_match(/src="http:\/\/google.com"/, last_response.body)

    header 'X-Forwarded-Proto', 'https'
    get '/'
    assert_match(/\<body\>/, last_response.body)
    assert_match(/src="\/\/google.com"/, last_response.body)
  end
end

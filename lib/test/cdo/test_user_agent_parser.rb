require_relative '../test_helper'

require 'cdo/user_agent_parser'

describe Cdo::UserAgentParser do
  let(:webview) do
    'Mozilla/5.0 (Linux; Android 11; KFRAPWI Build/RS8338.3358N; wv) AppleWebKit/537.36 ' \
      '(KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.181 Safari/537.36'
  end

  it 'reads mobile app with browser details' do
    agent = Cdo::UserAgentParser.parse("#{webview} CodeAIMobileApp/1.0.0 (com.amazon.venezia)")

    _(agent.app).must_equal(
      Cdo::UserAgentParser::App.new('CodeAIMobileApp', '1.0.0', 'com.amazon.venezia')
    )
    _(agent.family).must_equal 'Chrome Mobile WebView'
    _(agent.os.family).must_equal 'Android'
  end

  it 'adds mobile app to hash of user agent' do
    _(Cdo::UserAgentParser.parse("#{webview} CodeAIMobileApp/1.0.0 (com.amazon.venezia)").to_h).must_equal(
      UserAgentParser.parse(webview).to_h.merge(
        app: {name: 'CodeAIMobileApp', version: '1.0.0', install_source: 'com.amazon.venezia'}
      )
    )
  end

  it 'reads app without install source' do
    app = Cdo::UserAgentParser.parse("#{webview} CodeAIMobileApp/1.0.0").to_h[:app]

    _(app[:version]).must_equal '1.0.0'
    _(app[:install_source]).must_be_nil
  end

  it 'reads pre-release version' do
    version = Cdo::UserAgentParser.parse("#{webview} CodeAIMobileApp/1.1.0-beta.2 (com.android.vending)").to_h.dig(:app, :version)

    _(version).must_equal '1.1.0-beta.2'
  end

  it 'reads app in iOS web view' do
    ios_webview = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 ' \
      '(KHTML, like Gecko) Mobile/15E148'
    app = Cdo::UserAgentParser.parse("#{ios_webview} CodeAIMobileApp/1.0.0 (eu.example-store.marketplace)").to_h[:app]

    _(app[:version]).must_equal '1.0.0'
    _(app[:install_source]).must_equal 'eu.example-store.marketplace'
  end

  it 'reads no mobile app for other app name' do
    _(Cdo::UserAgentParser.parse("#{webview} CodeAIOtherApp/1.0.0 (com.amazon.venezia)").app).must_be_nil
  end

  it 'reads no mobile app for browser' do
    agent = Cdo::UserAgentParser.parse(webview)

    _(agent.app).must_be_nil
    _(agent.to_h).must_include :app
    _(agent.to_h[:app]).must_be_nil
  end

  it 'reads no mobile app without user agent' do
    _(Cdo::UserAgentParser.parse(nil).app).must_be_nil
  end

  it 'reads app alone with parse_app' do
    parser = Cdo::UserAgentParser.new

    _(parser.parse_app("#{webview} CodeAIMobileApp/1.0.0 (com.amazon.venezia)")).must_equal(
      Cdo::UserAgentParser::App.new('CodeAIMobileApp', '1.0.0', 'com.amazon.venezia')
    )
    _(parser.parse_app(webview)).must_be_nil
  end

  it 'leaves UserAgentParser unchanged' do
    agent = UserAgentParser.parse("#{webview} CodeAIMobileApp/1.0.0")

    _(agent).wont_respond_to :app
    _(agent.to_h).wont_include :app
  end
end

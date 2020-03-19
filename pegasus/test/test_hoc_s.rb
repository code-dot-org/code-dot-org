require 'action_view'

require_relative './test_helper'
require_relative '../router'

# Override the Pegasus document root for testing fixtures.
class TestDocuments < Documents
  configure do
    set :views, File.join(__dir__, 'fixtures/sites')
  end
end

class HocI18nTest < Minitest::Test
  include Rack::Test::Methods

  def app
    @app ||= TestDocuments.new
  end

  def test_basic_functionality
    resp = get('/hoc_s/basic_functionality')
    assert_equal 200, resp.status
    assert_match "<h1>HOUR of CODE</h1>", resp.body
  end

  def test_html_escaped
    HOC_I18N['en']['test'] = "string with <strong>embedded html</strong>"
    resp = get('/hoc_s/generic')
    assert_equal 200, resp.status
    assert_match "<h1>string with &lt;strong&gt;embedded html&lt;/strong&gt;</h1>", resp.body
  end

  def test_interpolation
    HOC_I18N['en']['test'] = "%{first}"
    resp = get('/hoc_s/interpolation')
    assert_equal 200, resp.status
    assert_match "<h1>primary</h1>", resp.body

    HOC_I18N['en']['test'] = "%{first} %{second}"
    resp = get('/hoc_s/interpolation')
    assert_equal 200, resp.status
    assert_match "<h1>primary secondary</h1>", resp.body

    HOC_I18N['en']['test'] = "%{first} %{second} %{first} again"
    resp = get('/hoc_s/interpolation')
    assert_equal 200, resp.status
    assert_match "<h1>primary secondary primary again</h1>", resp.body
  end

  def test_markdown
    HOC_I18N['en']['test'] = "string with **some** _basic_ formatting"
    resp = get('/hoc_s/markdown')
    assert_equal 200, resp.status
    assert_match "<h1><p>string with <strong>some</strong> <em>basic</em> formatting</p>\n</h1>", resp.body

    HOC_I18N['en']['test'] = "string with <strong>embedded html</strong>"
    resp = get('/hoc_s/markdown')
    assert_equal 200, resp.status
    assert_match "<h1><p>string with &lt;strong&gt;embedded html&lt;/strong&gt;</p>\n</h1>", resp.body
  end

  def test_interpolated_markdown
    HOC_I18N['en']['test'] = "string with an [interpolated link](%{url})"
    resp = get('/hoc_s/interpolated_markdown')
    assert_equal 200, resp.status
    assert_match "<h1><p>string with an <a href=\"http://test.com\">interpolated link</a></p>\n</h1>", resp.body
  end

  def test_inline_markdown
    HOC_I18N['en']['test'] = "basic string"
    resp = get('/hoc_s/inline_markdown')
    assert_equal 200, resp.status
    assert_match "<h1>basic string</h1>", resp.body

    HOC_I18N['en']['test'] = "string with\n\n- some\n- block\n\nmarkdown"
    resp = get('/hoc_s/inline_markdown')
    assert_equal 200, resp.status
    assert_match "<h1>string withsome\nblock\nmarkdown</h1>", resp.body

    HOC_I18N['en']['test'] = "string with <strong>embedded html</strong>"
    resp = get('/hoc_s/inline_markdown')
    assert_equal 200, resp.status
    assert_match "<h1>string with embedded html</h1>", resp.body
  end
end

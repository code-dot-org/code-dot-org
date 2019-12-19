require_relative './test_helper'
require_relative '../router'

# Override the Pegasus document root for testing fixtures.
class TestDocuments < Documents
  configure do
    set :views, File.join(__dir__, 'fixtures/sites')
  end
end

class I18nTest < Minitest::Test
  include Rack::Test::Methods

  def app
    @app ||= TestDocuments.new
  end

  def test_i18n_t_escapes_html
    unescaped = "<p>This is a string with <strong>raw</strong> <em>html</em></p>"
    escaped = CGI.escapeHTML unescaped
    I18n.backend.store_translations I18n.locale, {html: unescaped}
    path = '/test_i18n_t_html'
    resp = get(path)
    assert_equal 200, resp.status, path
    refute_match unescaped, resp.body
    assert_match escaped, resp.body
  end

  def test_hoc_s_escapes_html
    unescaped = "<p>This is a string with <strong>raw</strong> <em>html</em></p>"
    escaped = CGI.escapeHTML unescaped
    HOC_I18N['en']['html'] = unescaped
    path = '/test_hoc_s_html'
    resp = get(path)
    assert_equal 200, resp.status, path
    refute_match unescaped, resp.body
    assert_match escaped, resp.body
  end
end

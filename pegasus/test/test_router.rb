require_relative './test_helper'
require_relative '../router'

# Override the Pegasus document root for testing fixtures.
class TestDocuments < Documents
  configure do
    set :views, File.join(__dir__, 'fixtures/sites')
  end
end

# Tests the Pegasus CMS (router.rb / Documents) Sinatra application logic.
class RouterTest < Minitest::Test
  include Rack::Test::Methods

  def app
    @app ||= TestDocuments.new
  end

  def test_div_brackets
    path = '/div_brackets'
    resp = get(path)
    assert_equal 200, resp.status, path
    assert_match "<div class='class'>", resp.body
    assert_match "<div id='id'>", resp.body
  end

  def test_syntax_error
    err = assert_raises(RuntimeError) do
      get('/syntax_error_header')
    end
    assert_match /expected Hash, not String.*YAML parse error/m, err.message
    assert_equal app.helpers.content_dir('code.org/public/syntax_error_header.md'), err.backtrace.first
  end

  def test_erb_error_body
    err = assert_raises(RuntimeError) do
      get('/erb_error_body')
    end
    file, line = err.backtrace.first.split(':')
    assert_equal file, app.helpers.content_dir('code.org/public/erb_error_body.md')
    assert_equal 8, line.to_i
  end

  def test_haml_error
    err = assert_raises(Haml::Error) do
      get('/haml_error')
    end
    file, line = err.backtrace.first.split(':')
    assert_equal file, app.helpers.content_dir('code.org/public/haml_error.haml')
    assert_equal 10, line.to_i
  end

  def test_view
    assert_equal 200, get('/test_view').status
  end

  def test_index
    assert_match 'Test folder/index', get('/folder').body
  end

  def test_splat
    assert_match 'splat-test', get('/folder/splat-test').body
  end

  def test_not_found
    assert_equal 404, get('/not_found').status
  end

  def test_all_documents
    assert_includes app.helpers.all_documents, {site: 'code.org', uri: '/div_brackets'}
  end

  def test_localized_markdown
    env 'cdo.locale', 'fr-FR'
    path = '/test_md'
    resp = get(path)
    assert_equal 200, resp.status, path
    assert_match "Bonjour", resp.body
  end

  def test_localized_markdown_fallback
    env 'cdo.locale', 'es-ES'
    path = '/test_md'
    resp = get(path)
    assert_equal 200, resp.status, path
    assert_match "Hello", resp.body
  end
end

require 'action_view'

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
    err = assert_raises(ActionView::Template::Error) do
      get('/erb_error_body')
    end
    assert_equal app.helpers.content_dir('code.org/public/erb_error_body.md.erb'), err.backtrace.first
  end

  def test_haml_error
    err = assert_raises(ActionView::Template::Error) do
      get('/haml_error')
    end
    assert_equal app.helpers.content_dir('code.org/public/haml_error.haml'), err.backtrace.first
  end

  def test_markdown_partial
    path = '/test_md_partials'
    resp = get(path)
    assert_equal 200, resp.status, path
    assert_match "<h1>Markdown With Partials</h1>", resp.body
    assert_match "<h2>Partial Content</h2>", resp.body
  end

  def test_markdown_partial_only_templates
    path = '/test_md_partial_only_templates'
    resp = get(path)
    assert_equal 200, resp.status, path
    assert_match "<h1>Partials protect against directory transversal</h1>", resp.body
    refute_match "<h3>Hello</h3>", resp.body
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

  def test_404_for_long_url
    assert_equal 404, get('/%EF%BC%89%EF%BC%9ACode.org%E6%98%AF%E4%B8%80%E4%B8%AA%E9%9D%9E%E8%90%A5%E5%88%A9%E7%BB%84%E7%BB%87%EF%BC%8C%E8%87%B4%E5%8A%9B%E4%BA%8E%E6%8E%A8%E5%B9%BF%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6%E6%95%99%E8%82%B2%E3%80%82%E4%BB%96%E4%BB%AC%E6%8F%90%E4%BE%9B%E4%BA%86%E4%B8%80%E7%B3%BB%E5%88%97%E5%85%8D%E8%B4%B9%E7%9A%84%E7%BC%96%E7%A8%8B%E8%AF%BE%E7%A8%8B%E5%92%8C%E6%95%99%E5%AD%A6%E8%B5%84%E6%BA%90%EF%BC%8C%E5%8C%85%E6%8B%AC%E9%80%82%E5%90%88%E5%AD%A9%E5%AD%90%E7%9A%84%E7%BC%96%E7%A8%8B%E8%AF%BE%E7%A8%8B%E3%80%82Code.org%E7%9A%84%E8%AF%BE%E7%A8%8B%E6%B6%B5%E7%9B%96%E4%BA%86%E4%BB%8E%E5%9F%BA%E7%A1%80%E7%9A%84%E7%BC%96%E7%A8%8B%E6%A6%82%E5%BF%B5%E5%88%B0%E9%AB%98%E7%BA%A7%E7%9A%84%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6%E7%9F%A5%E8%AF%86%EF%BC%8C%E9%80%82%E5%90%88%E5%AD%A9%E5%AD%90%E4%BB%AC%E4%BB%8E%E5%B0%8F%E5%AD%A6%E5%88%B0%E9%AB%98%E4%B8%AD%E7%9A%84%E4%B8%8D%E5%90%8C%E5%B9%B4%E9%BE%84%E6%AE%B5%E3%80%82').status
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

  def test_no_erb_in_yaml
    skip unless CDO.has_pegasus_content
    # This test exists for mostly historic reasons; it used to be the case that
    # the YAML headers in pegasus documents would be parsed first as ERB before
    # being parsed as YAML.
    #
    # In addition to being somewhat confusing, this also led to a security risk
    # once we started allowing translators to translate entire files.
    #
    # This tests exists just to enforce that we don't revert back to the old
    # functionality.
    resp = get('/test_no_erb_in_yaml')
    refute_match "<title>1,2,3</title>", resp.body
    assert_match "<title>&lt;%= (1..3).to_a.join(&#39;,&#39;).inspect %&gt;</title>", resp.body
  end

  def test_parsing_yaml_header
    fixture_path = File.join(__dir__, 'fixtures/sites/code.org/public/div_brackets.md')

    yaml_header, content, lines_count = app.helpers.parse_yaml_header(fixture_path)

    assert_equal({'x' => 'y'}, yaml_header)
    assert_equal("### HELLO\n\n[class]\n\n[#id]\n\nTesting div-brackets.\n\n[/#id]\n\n[/class]\n", content)
    assert_equal(6, lines_count)
  end
end

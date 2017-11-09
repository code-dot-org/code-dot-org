require 'rack/test'
require 'minitest/autorun'

class I18nHocRoutesTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  def test_hoc_pages_for_all_locales
    header 'Host', 'hourofcode.com'
    languages = DB[:cdo_languages].select(:unique_language_s).where(supported_hoc_b: 1)
    subpages = load_hoc_subpages

    languages.collect {|x| x[:unique_language_s]}.each do |lang|
      # Tests the homepage
      assert_successful_get("/us/#{lang}")

      # Tests all other hoc subpages
      subpages.each {|path| assert_successful_get("/us/#{lang}/#{path}")}
    end
  end

  def assert_successful_get(path)
    resp = get(path)
    assert_equal 200, resp.status, path
  rescue Psych::SyntaxError => e
    flunk "Caught Psych::SyntaxError when parsing YML for #{path}: #{e}. It's likely that a .yml translation file for this language received a formatting error."
  rescue SyntaxError => e
    flunk "Caught SyntaxError for #{path}: #{e}. It's likely that a translation incorrectly edited some templating syntax."
  rescue NameError => e
    flunk "Caught NameError for #{path}: #{e}. It's likely that a translation translated a template method name."
  rescue RuntimeError => e
    flunk "Caught RuntimeError for #{path}: #{e}. It's likely that a translation modified a .md header to introduce an invalid value"
  end

  def load_hoc_subpages
    Dir.glob(pegasus_dir('sites.v3/hourofcode.com/public/', '**/*.md')).map do |path|
      path[/public(.*)\.md/, 1]
    end
  end
end

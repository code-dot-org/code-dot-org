require_relative './test_helper'
require 'rack/test'
require 'minitest/autorun'

class I18nHocRoutesTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  def test_hoc_partner_pages
    CDO.partners.each do |partner|
      header 'Host', "#{partner}.code.org"
      resp = get('/')
      assert_equal 200, resp.status, "#{partner}/"
    end
  end

  def assert_successful_get(path)
    resp = get(path)
    assert_equal 200, resp.status, path
  rescue Psych::SyntaxError => exception
    flunk "Caught Psych::SyntaxError when parsing YML for #{path}: #{exception}. It's likely that a .yml translation file for this language received a formatting error."
  rescue SyntaxError => exception
    flunk "Caught SyntaxError for #{path}: #{exception}. It's likely that a translation incorrectly edited some templating syntax."
  rescue NameError => exception
    flunk "Caught NameError for #{path}: #{exception}. It's likely that a translation translated a template method name."
  rescue RuntimeError => exception
    flunk "Caught RuntimeError for #{path}: #{exception}. It's likely that a translation modified a .md header to introduce an invalid value"
  end

  def load_hoc_subpages
    Dir.glob(pegasus_dir('sites.v3/hourofcode.com/public/', '**/*.md')).map do |path|
      path[/public(.*)\.md/, 1]
    end
  end

  def load_all_hoc_translations
    files = Dir[pegasus_dir('sites.v3/hourofcode.com/i18n/*.yml')]
    I18n.backend.load_translations files
  end
end

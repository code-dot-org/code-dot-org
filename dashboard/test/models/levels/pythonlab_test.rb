require 'test_helper'

class PythonlabTest < ActiveSupport::TestCase
  test 'theater is an available mini app' do
    values = Pythonlab.mini_apps.map(&:last)
    assert_includes values, 'theater'
    assert_includes values, 'neighborhood'
  end

  test 'theater level does not require a serialized maze' do
    level = Pythonlab.new(name: 'theater level', mini_app: 'theater')
    # parse_maze raises only for a neighborhood level with no maze.
    assert_nothing_raised do
      level.send(:parse_maze)
    end
  end

  test 'neighborhood level still requires a serialized maze' do
    level = Pythonlab.new(name: 'neighborhood level', mini_app: 'neighborhood')
    assert_raises ArgumentError do
      level.send(:parse_maze)
    end
  end

  test 'a stray serialized maze is stripped from a theater level' do
    level = Pythonlab.new(name: 'theater level', mini_app: 'theater')
    level.properties['serialized_maze'] = [[{'tileType' => 1}]]
    level.send(:clean_up_mini_app_settings)
    assert_nil level.properties['serialized_maze']
  end

  test 'each mini app has its own default api version' do
    theater = Pythonlab.new(name: 'theater level', mini_app: 'theater')
    neighborhood = Pythonlab.new(name: 'neighborhood level', mini_app: 'neighborhood')
    assert_equal 'functional', theater.api_version_or_default
    assert_equal 'object_oriented', neighborhood.api_version_or_default
  end

  test 'a level with no mini app has no default api version' do
    level = Pythonlab.new(name: 'plain level')
    assert_nil level.api_version_or_default
  end

  test 'a stored api version overrides the default' do
    level = Pythonlab.new(name: 'theater level', mini_app: 'theater', api_version: 'object_oriented')
    assert_equal 'object_oriented', level.api_version_or_default
  end

  test 'a stray api version is stripped from a level with no mini app' do
    level = Pythonlab.new(name: 'plain level', api_version: 'functional')
    level.send(:clean_up_mini_app_settings)
    assert_nil level.properties['api_version']
  end
end

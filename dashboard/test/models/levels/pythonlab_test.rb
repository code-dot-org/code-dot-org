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
end

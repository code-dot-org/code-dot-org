require_relative 'test_helper'
require_relative '../../lib/cdo/help_header'
require 'active_support/i18n'

class HelpHeaderTest < Minitest::Test
  def assert_includes_id(items, id)
    assert items.find {|e| e[:id] == id}
  end

  def test_hamburger_content_script_level
    contents = HelpHeader.get_help_contents({level: nil, script_level: Level.new, user_type: nil, language: "en", request: nil})
    assert_includes_id contents, "report-bug"
  end

  def test_hamburger_content_level
    contents = HelpHeader.get_help_contents({level: Level.new, script_level: nil, user_type: nil, language: "en", request: nil})
    assert_includes_id contents, "report-bug"
  end

  def test_hamburger_content_gamelab_project_level
    contents = HelpHeader.get_help_contents({level: LevelGameLab.new, script_level: nil, user_type: nil, language: "en"})
    assert_includes_id contents, "gamelab-docs"
    assert_includes_id contents, "gamelab-tutorials"
  end

  def test_hamburger_content_applab_project_level
    contents = HelpHeader.get_help_contents({level: LevelAppLab.new, script_level: nil, user_type: nil, language: "en"})
    assert_includes_id contents, "applab-docs"
    assert_includes_id contents, "applab-tutorials"
  end
end

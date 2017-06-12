require_relative '../../lib/cdo/hamburger'
require 'minitest/autorun'

class I18n
  def self.t(key)
    key
  end
end

class CDO
  def self.code_org_url(path)
    path
  end

  def self.studio_url(path)
    path
  end
end

class Level
  def report_bug_url(request)
    "yo"
  end

  def try(property)
    false
  end
end

class LevelAppLab
  def report_bug_url(request)
    "yo"
  end

  def try(property)
    property == :is_project_level
  end
end

class LevelGameLab
  def report_bug_url(request)
    "yo"
  end

  def try(property)
    property == :is_project_level
  end

  def game
    "GameLab"
  end
end

class Game
  def self.gamelab
    "GameLab"
  end

  def self.applab
    "AppLab"
  end
end

class HamburgerTest < Minitest::Test
  # Visibility CSS class tests.

  def test_level_teacher_en
    visibility = Hamburger.get_visibility({level: true, user_type: "teacher", language: "en"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::SHOW_ALWAYS
    assert visibility[:show_student_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_signed_out_options] == Hamburger::HIDE_ALWAYS
    assert visibility[:show_pegasus_options]    == Hamburger::SHOW_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  def test_level_teacher_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: "teacher", language: "fr"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::SHOW_ALWAYS
    assert visibility[:show_student_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_signed_out_options] == Hamburger::HIDE_ALWAYS
    assert visibility[:show_pegasus_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  def test_level_student_en
    visibility = Hamburger.get_visibility({level: true, user_type: "student", language: "en"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_student_options]    == Hamburger::SHOW_ALWAYS
    assert visibility[:show_signed_out_options] == Hamburger::HIDE_ALWAYS
    assert visibility[:show_pegasus_options]    == Hamburger::SHOW_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  def test_level_student_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: "student", language: "fr"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_student_options]    == Hamburger::SHOW_ALWAYS
    assert visibility[:show_signed_out_options] == Hamburger::HIDE_ALWAYS
    assert visibility[:show_pegasus_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  def test_level_nobody_en
    visibility = Hamburger.get_visibility({level: true, user_type: nil, language: "en"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_student_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_signed_out_options] == Hamburger::SHOW_ALWAYS
    assert visibility[:show_pegasus_options]    == Hamburger::SHOW_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  def test_level_nobody_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: nil, language: "fr"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_student_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_signed_out_options] == Hamburger::SHOW_ALWAYS
    assert visibility[:show_pegasus_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  def test_nonlevel_teacher_en
    visibility = Hamburger.get_visibility({level: false, user_type: "teacher", language: "en"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::SHOW_MOBILE
    assert visibility[:show_student_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_signed_out_options] == Hamburger::HIDE_ALWAYS
    assert visibility[:show_pegasus_options]    == Hamburger::SHOW_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  def test_nonlevel_teacher_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: "teacher", language: "fr"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::SHOW_MOBILE
    assert visibility[:show_student_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_signed_out_options] == Hamburger::HIDE_ALWAYS
    assert visibility[:show_pegasus_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  def test_nonlevel_student_en
    visibility = Hamburger.get_visibility({level: false, user_type: "student", language: "en"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_student_options]    == Hamburger::SHOW_MOBILE
    assert visibility[:show_signed_out_options] == Hamburger::HIDE_ALWAYS
    assert visibility[:show_pegasus_options]    == Hamburger::SHOW_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  def test_nonlevel_student_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: "student", language: "fr"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_student_options]    == Hamburger::SHOW_MOBILE
    assert visibility[:show_signed_out_options] == Hamburger::HIDE_ALWAYS
    assert visibility[:show_pegasus_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  def test_nonlevel_nobody_en
    visibility = Hamburger.get_visibility({level: false, user_type: nil, language: "en"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_MOBILE
    assert visibility[:show_teacher_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_student_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_signed_out_options] == Hamburger::SHOW_MOBILE
    assert visibility[:show_pegasus_options]    == Hamburger::SHOW_MOBILE
    assert visibility[:show_help_options]       == Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_nobody_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: nil, language: "fr"})

    assert visibility[:hamburger_class]         == Hamburger::SHOW_ALWAYS
    assert visibility[:show_teacher_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_student_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_signed_out_options] == Hamburger::SHOW_MOBILE
    assert visibility[:show_pegasus_options]    == Hamburger::HIDE_ALWAYS
    assert visibility[:show_help_options]       == Hamburger::SHOW_ALWAYS
  end

  # Hamburger content tests.

  def test_hamburger_content_teacher
    contents = Hamburger.get_contents({level: nil, script_level: nil, user_type: "teacher", language: "en"})
    assert !contents.empty?
  end

  def test_hamburger_content_student
    contents = Hamburger.get_contents({level: nil, script_level: nil, user_type: "student", language: "en"})
    assert !contents.empty?
  end

  def test_hamburger_content_nobody
    contents = Hamburger.get_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert !contents.empty?
  end

  def test_hamburger_content_script_level
    contents = Hamburger.get_contents({level: nil, script_level: Level.new, user_type: nil, language: "en", request: nil})
    assert !contents.empty?
  end

  def test_hamburger_content_level
    contents = Hamburger.get_contents({level: Level.new, script_level: nil, user_type: nil, language: "en", request: nil})
    assert !contents.empty?
  end

  def test_hamburger_content_nolevel
    contents = Hamburger.get_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert !contents.empty?
  end

  def test_hamburger_content_gamelab_project_level
    contents = Hamburger.get_contents({level: LevelGameLab.new, script_level: nil, user_type: nil, language: "en"})
    assert !contents.empty?
  end

  def test_hamburger_content_applab_project_level
    contents = Hamburger.get_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert !contents.empty?
  end

  def test_hamburger_content_expandable
    contents = Hamburger.get_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert !contents.empty?
  end

  # Header content tests.

  def test_header_content_teacher_en
    contents = Hamburger.get_header_contents("teacher", "en")
    assert !contents.empty?
  end

  def test_header_content_teacher_nonen
    contents = Hamburger.get_header_contents("teacher", "fr")
    assert !contents.empty?
  end

  def test_header_content_student_en
    contents = Hamburger.get_header_contents("student", "en")
    assert !contents.empty?
  end

  def test_header_content_student_nonen
    contents = Hamburger.get_header_contents("student", "fr")
    assert !contents.empty?
  end

  def test_header_content_nobody_en
    contents = Hamburger.get_header_contents(nil, "en")
    assert !contents.empty?
  end

  def test_header_content_nobody_nonen
    contents = Hamburger.get_header_contents(nil, "fr")
    assert !contents.empty?
  end
end

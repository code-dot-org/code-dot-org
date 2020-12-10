require_relative 'test_helper'
require_relative '../../lib/cdo/hamburger'
require 'active_support/i18n'

class HamburgerTest < Minitest::Test
  def assert_includes_id(items, id)
    assert items.find {|e| e[:id] == id}
  end

  # Visibility CSS class tests.

  def test_level_teacher_en
    visibility = Hamburger.get_visibility({level: true, user_type: "teacher", language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_signed_out_options],  Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_level_teacher_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: "teacher", language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_signed_out_options],  Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_level_student_en
    visibility = Hamburger.get_visibility({level: true, user_type: "student", language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_signed_out_options],  Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_level_student_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: "student", language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_signed_out_options],  Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_level_nobody_en
    visibility = Hamburger.get_visibility({level: true, user_type: nil, language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_signed_out_options],  Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_level_nobody_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: nil, language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_signed_out_options],  Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_teacher_en
    visibility = Hamburger.get_visibility({level: false, user_type: "teacher", language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_signed_out_options],  Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_teacher_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: "teacher", language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_teacher_options],     Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_signed_out_options],  Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_student_en
    visibility = Hamburger.get_visibility({level: false, user_type: "student", language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_signed_out_options],  Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_student_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: "student", language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_signed_out_options],  Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_nobody_en
    visibility = Hamburger.get_visibility({level: false, user_type: nil, language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_signed_out_options],  Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_nobody_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: nil, language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_signed_out_options],  Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_pegasus_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  # Hamburger content tests.

  def test_hamburger_content_student
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: "student", language: "en"})
    assert_includes_id contents[:entries], "hamburger-student-projects"
  end

  def test_hamburger_content_nobody
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert_includes_id contents[:entries], "hamburger-signed-out-projects"
  end

  def test_hamburger_content_nolevel
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert_includes_id contents[:entries], "learn"
  end

  def test_hamburger_content_nolevel
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert_includes_id contents[:entries], "report-bug"
  end

  def test_hamburger_content_expandable_en
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert contents[:entries].find {|e| e[:type] == "expander"}
  end

  def test_hamburger_content_noexpandable_nonen
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "fr"})
    # 'legal_entries' is an allowable section in non-english.
    refute contents[:entries].find {|e| e[:type] == "expander" && e[:id] != "legal_entries"}
  end

  # Header content tests.

  def test_header_content_student
    contents = Hamburger.get_header_contents({user_type: "student", language: "en"})
    assert_includes_id contents, "header-student-projects"
  end

  def test_header_content_nobody_en
    contents = Hamburger.get_header_contents({user_type: nil, language: "en"})
    assert_includes_id contents, "header-en-about"
  end

  def test_header_content_nobody_nonen
    contents = Hamburger.get_header_contents({user_type: nil, language: "fr"})
    assert_includes_id contents, "header-non-en-projects"
  end
end

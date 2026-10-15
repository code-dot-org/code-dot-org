require_relative 'test_helper'
require_relative '../../lib/cdo/hamburger'
require 'active_support/i18n'

class HamburgerTest < Minitest::Test
  def assert_includes_id(items, id)
    assert(items.find {|e| e[:id] == id})
  end

  # Visibility CSS class tests.

  def test_level_teacher_en
    visibility = Hamburger.get_visibility({level: true, user_type: "teacher", language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_level_teacher_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: "teacher", language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_level_student_en
    visibility = Hamburger.get_visibility({level: true, user_type: "student", language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_level_student_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: "student", language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_level_nobody_en
    visibility = Hamburger.get_visibility({level: true, user_type: nil, language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_SMALL_DESKTOP
  end

  def test_level_nobody_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: nil, language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_SMALL_DESKTOP
  end

  def test_nonlevel_teacher_en
    visibility = Hamburger.get_visibility({level: false, user_type: "teacher", language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_teacher_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: "teacher", language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_student_en
    visibility = Hamburger.get_visibility({level: false, user_type: "student", language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_student_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: "student", language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::SHOW_MOBILE
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_ALWAYS
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_MOBILE
  end

  def test_nonlevel_nobody_en
    visibility = Hamburger.get_visibility({level: false, user_type: nil, language: "en"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_SMALL_DESKTOP
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_SMALL_DESKTOP
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_SMALL_DESKTOP
  end

  def test_nonlevel_nobody_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: nil, language: "fr"})

    assert_equal visibility[:hamburger_class],          Hamburger::SHOW_SMALL_DESKTOP
    assert_equal visibility[:show_teacher_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_student_options],     Hamburger::HIDE_ALWAYS
    assert_equal visibility[:show_pegasus_options],     Hamburger::SHOW_SMALL_DESKTOP
    assert_equal visibility[:show_help_options],        Hamburger::SHOW_SMALL_DESKTOP
  end

  # Hamburger content tests.

  def test_hamburger_content_student
    # Test that the header links also appear in the hamburger menu
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: "student", language: "en"})
    assert_includes_id contents[:entries], "hamburger-header-student-projects"
  end

  def test_hamburger_content_nobody
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert_includes_id contents[:entries], "learn"
  end

  def test_hamburger_content_nolevel
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert_includes_id contents[:entries], "learn"
    assert_includes_id contents[:entries], "report-bug"
  end

  def test_hamburger_content_expandable_en
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "en"})
    assert(contents[:entries].find {|e| e[:type] == "expander"})
  end

  def test_hamburger_content_nobody_marketing_nav
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "en", marketing_nav: true})[:entries]
    assert_includes_id contents, "hamburger-header-teachers"
    assert_includes_id contents, "legal_entries"
    refute(contents.find {|e| e[:id] == "learn"})
  end

  def test_hamburger_content_nobody_without_marketing_nav_unchanged
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "en"})[:entries]
    assert_includes_id contents, "learn"
    assert_includes_id contents, "about_entries"
  end

  def test_hamburger_content_noexpandable_nonen
    contents = Hamburger.get_hamburger_contents({level: nil, script_level: nil, user_type: nil, language: "fr"})
    # 'legal_entries' is an allowable section in non-english.
    assert(contents[:entries].find {|e| e[:type] == "expander" && e[:id] != "legal_entries"})
  end

  # Header content tests.

  def test_header_content_student
    contents = Hamburger.get_header_contents({user_type: "student", language: "en"})
    assert_includes_id contents, "header-student-projects"
  end

  def test_header_content_nobody_en
    contents = Hamburger.get_header_contents({user_type: nil, language: "en"})
    assert_includes_id contents, "header-about"
  end

  def test_header_content_nobody_nonen
    contents = Hamburger.get_header_contents({user_type: nil, language: "fr"})
    assert_includes_id contents, "header-districts"
  end

  def test_header_content_nobody_marketing_nav
    contents = Hamburger.get_header_contents({user_type: nil, language: "en", marketing_nav: true})
    assert_includes_id contents, "header-teachers"
    assert_includes_id contents, "header-advocacy"
    refute(contents.find {|e| e[:id] == "header-learn" || e[:id] == "header-teach"})
  end

  def test_header_content_nobody_marketing_nav_advocacy_url
    contents = Hamburger.get_header_contents({user_type: nil, language: "en", marketing_nav: true})
    advocacy = contents.find {|e| e[:id] == "header-advocacy"}
    assert_equal "https://advocacy.code.org", advocacy[:url]
  end

  def test_header_content_nobody_marketing_nav_domain_url
    contents = Hamburger.get_header_contents({user_type: nil, language: "en", marketing_nav: true})
    districts = contents.find {|e| e[:id] == "header-districts"}
    assert_equal CDO.code_org_url("/districts"), districts[:url]
  end

  def test_header_content_nobody_without_marketing_nav
    contents = Hamburger.get_header_contents({user_type: nil, language: "en"})
    assert(contents.find {|e| e[:id] == "header-learn" || e[:id] == "header-teach"})
  end

  def test_header_content_nobody_marketing_nav_region_without_signed_out_marketing_falls_back
    # "ar" has no header.top.signed_out_marketing, so marketing_nav should fall back to its signed_out list.
    contents = Hamburger.get_header_contents({user_type: nil, language: "en", marketing_nav: true, ge_region: "ar"})
    assert_includes_id contents, "header-about"
    refute(contents.find {|e| e[:id] == "header-teachers"})
  end
end

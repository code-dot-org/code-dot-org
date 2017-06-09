require_relative '../../lib/cdo/hamburger'
require 'minitest/autorun'

class HamburgerTest < Minitest::Test
  def test_level_teacher_en
    visibility = Hamburger.get_visibility({level: true, user_type: "teacher", language: "en"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "show-always"
    assert visibility[:show_student_options]    == "hide-always"
    assert visibility[:show_signed_out_options] == "hide-always"
    assert visibility[:show_pegasus_options]    == "show-always"
    assert visibility[:show_help_options]       == "show-always"
  end

  def test_level_teacher_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: "teacher", language: "fr"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "show-always"
    assert visibility[:show_student_options]    == "hide-always"
    assert visibility[:show_signed_out_options] == "hide-always"
    assert visibility[:show_pegasus_options]    == "hide-always"
    assert visibility[:show_help_options]       == "show-always"
  end

  def test_level_student_en
    visibility = Hamburger.get_visibility({level: true, user_type: "student", language: "en"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "hide-always"
    assert visibility[:show_student_options]    == "show-always"
    assert visibility[:show_signed_out_options] == "hide-always"
    assert visibility[:show_pegasus_options]    == "show-always"
    assert visibility[:show_help_options]       == "show-always"
  end

  def test_level_student_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: "student", language: "fr"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "hide-always"
    assert visibility[:show_student_options]    == "show-always"
    assert visibility[:show_signed_out_options] == "hide-always"
    assert visibility[:show_pegasus_options]    == "hide-always"
    assert visibility[:show_help_options]       == "show-always"
  end

  def test_level_nobody_en
    visibility = Hamburger.get_visibility({level: true, user_type: nil, language: "en"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "hide-always"
    assert visibility[:show_student_options]    == "hide-always"
    assert visibility[:show_signed_out_options] == "show-always"
    assert visibility[:show_pegasus_options]    == "show-always"
    assert visibility[:show_help_options]       == "show-always"
  end

  def test_level_nobody_nonen
    visibility = Hamburger.get_visibility({level: true, user_type: nil, language: "fr"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "hide-always"
    assert visibility[:show_student_options]    == "hide-always"
    assert visibility[:show_signed_out_options] == "show-always"
    assert visibility[:show_pegasus_options]    == "hide-always"
    assert visibility[:show_help_options]       == "show-always"
  end

  def test_nonlevel_teacher_en
    visibility = Hamburger.get_visibility({level: false, user_type: "teacher", language: "en"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "show-mobile"
    assert visibility[:show_student_options]    == "hide-always"
    assert visibility[:show_signed_out_options] == "hide-always"
    assert visibility[:show_pegasus_options]    == "show-always"
    assert visibility[:show_help_options]       == "show-always"
  end

  def test_nonlevel_teacher_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: "teacher", language: "fr"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "show-mobile"
    assert visibility[:show_student_options]    == "hide-always"
    assert visibility[:show_signed_out_options] == "hide-always"
    assert visibility[:show_pegasus_options]    == "hide-always"
    assert visibility[:show_help_options]       == "show-always"
  end

  def test_nonlevel_student_en
    visibility = Hamburger.get_visibility({level: false, user_type: "student", language: "en"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "hide-always"
    assert visibility[:show_student_options]    == "show-mobile"
    assert visibility[:show_signed_out_options] == "hide-always"
    assert visibility[:show_pegasus_options]    == "show-always"
    assert visibility[:show_help_options]       == "show-always"
  end

  def test_nonlevel_student_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: "student", language: "fr"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "hide-always"
    assert visibility[:show_student_options]    == "show-mobile"
    assert visibility[:show_signed_out_options] == "hide-always"
    assert visibility[:show_pegasus_options]    == "hide-always"
    assert visibility[:show_help_options]       == "show-always"
  end

  def test_nonlevel_nobody_en
    visibility = Hamburger.get_visibility({level: false, user_type: nil, language: "en"})

    assert visibility[:hamburger_class]         == "show-mobile"
    assert visibility[:show_teacher_options]    == "hide-always"
    assert visibility[:show_student_options]    == "hide-always"
    assert visibility[:show_signed_out_options] == "show-mobile"
    assert visibility[:show_pegasus_options]    == "show-mobile"
    assert visibility[:show_help_options]       == "show-mobile"
  end

  def test_nonlevel_nobody_nonen
    visibility = Hamburger.get_visibility({level: false, user_type: nil, language: "fr"})

    assert visibility[:hamburger_class]         == "show-always"
    assert visibility[:show_teacher_options]    == "hide-always"
    assert visibility[:show_student_options]    == "hide-always"
    assert visibility[:show_signed_out_options] == "show-mobile"
    assert visibility[:show_pegasus_options]    == "hide-always"
    assert visibility[:show_help_options]       == "show-always"
  end
end

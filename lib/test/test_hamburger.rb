require_relative '../../lib/cdo/hamburger'
require 'minitest/autorun'

class HamburgerTest < Minitest::Test
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
end

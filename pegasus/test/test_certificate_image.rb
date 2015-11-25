require_relative '../../lib/cdo/graphics/certificate_image'
require 'minitest/autorun'

class CertificateImageTest < Minitest::Test
  def test_special_template_courses
    assert(prefilled_title_course?('mc'))
    assert(prefilled_title_course?('hourofcode'))
    assert(prefilled_title_course?('starwars'))
    assert(prefilled_title_course?('frozen'))
    assert(prefilled_title_course?('flappy'))
  end

  def test_course_templates
    assert_equal('MC_Hour_Of_Code_Certificate.jpg', cert_template_for_course('mc'))
    assert_equal('20hours_certificate.jpg', cert_template_for_course('20hours'))
    assert_equal('20hours_certificate.jpg', cert_template_for_course('20-hour'))
    assert_equal('hour_of_code_certificate.jpg', cert_template_for_course('frozen'))
    assert_equal('hour_of_code_certificate.jpg', cert_template_for_course('starwars'))
    assert_equal('hour_of_code_certificate.jpg', cert_template_for_course('flappy'))
    assert_equal('blank_certificate.png', cert_template_for_course('course1'))
    assert_equal('blank_certificate.png', cert_template_for_course('course2'))
    assert_equal('blank_certificate.png', cert_template_for_course('course3'))
    assert_equal('blank_certificate.png', cert_template_for_course('course4'))
  end

  def test_course_names
    assert_equal('Course 1', cert_display_name_for_course('course1'))
    assert_equal('Course 2', cert_display_name_for_course('course2'))
    assert_equal('Course 3', cert_display_name_for_course('course3'))
    assert_equal('Course 4', cert_display_name_for_course('course4'))
  end
end

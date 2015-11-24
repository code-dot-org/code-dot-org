require_relative '../../lib/cdo/graphics/certificate_image'
require 'minitest/autorun'

class CertificateImageTest < Minitest::Test
  def test_special_template_courses
    assert(prefilled_title_course?('mc'))
    assert(prefilled_title_course?('hourofcode'))
    assert(prefilled_title_course?('starwars'))
    assert(prefilled_title_course?('frozen'))
  end

  def test_course_templates
    assert_equal('MC_Hour_Of_Code_Certificate.jpg', prefilled_title_course_template('mc'))
    assert_equal('20hours_certificate.jpg', prefilled_title_course_template('20hours'))
    assert_equal('20hours_certificate.jpg', prefilled_title_course_template('20-hour'))
    assert_equal('hour_of_code_certificate.jpg', prefilled_title_course_template('frozen'))
  end
end

require_relative '../../lib/cdo/graphics/certificate_image'
require_relative 'fixtures/mock_pegasus'
require 'minitest/autorun'

class CertificateImageTest < Minitest::Test
  def test_special_template_courses
    assert prefilled_title_course?('Hour of Code') # 2013
    assert prefilled_title_course?('hourofcode') # 2014
    assert prefilled_title_course?('flappy')
    assert prefilled_title_course?('frozen')
    assert prefilled_title_course?('starwars')
    assert prefilled_title_course?('mc')
    assert prefilled_title_course?('20-hour')
    assert !prefilled_title_course?('course1')
    assert !prefilled_title_course?('course2')
    assert !prefilled_title_course?('course3')
    assert !prefilled_title_course?('course4')
  end

  def test_course_templates
    assert_equal 'MC_Hour_Of_Code_Certificate.jpg', certificate_template_for('mc')
    assert_equal '20hours_certificate.jpg', certificate_template_for('20-hour')
    assert_equal '20hours_certificate.jpg', certificate_template_for('20-hour')
    assert_equal 'hour_of_code_certificate.jpg', certificate_template_for('frozen')
    assert_equal 'hour_of_code_certificate.jpg', certificate_template_for('starwars')
    assert_equal 'hour_of_code_certificate.jpg', certificate_template_for('flappy')
    assert_equal 'hour_of_code_certificate.jpg', certificate_template_for('playlab')
    assert_equal 'blank_certificate.png', certificate_template_for('course1')
    assert_equal 'blank_certificate.png', certificate_template_for('course2')
    assert_equal 'blank_certificate.png', certificate_template_for('course3')
    assert_equal 'blank_certificate.png', certificate_template_for('course4')
  end

  def test_course_fallback_titles
    assert_equal 'Course 1', fallback_course_title_for('course1')
    assert_equal 'Course 2', fallback_course_title_for('course2')
    assert_equal 'Course 3', fallback_course_title_for('course3')
    assert_equal 'Course 4', fallback_course_title_for('course4')
  end

  def test_image_generation
    mc_certificate_image = create_course_certificate_image('Robot Tester', 'mc')
    assert_image mc_certificate_image, 1754, 1235, 'JPEG'
    hoc_certificate_image = create_course_certificate_image('Robot Tester', 'flappy')
    assert_image hoc_certificate_image, 1754, 1235, 'JPEG'
    unspecified_course_image = create_course_certificate_image('Robot Tester', nil)
    assert_image unspecified_course_image, 1754, 1235, 'JPEG'
    blank_named_certificate_image = create_course_certificate_image('Robot Tester', 'course1', nil, 'Course 1')
    assert_image blank_named_certificate_image, 1754, 1240, 'PNG'
    twenty_hour_certificate_image = create_course_certificate_image('Robot Tester', '20-hour')
    assert_image twenty_hour_certificate_image, 1754, 1240, 'JPEG'

    # Entered name "à Test Namé" on /congrats/course1
    # JS btoa(JSON.stringified(config)) becomes:
    #   "eyJuYW1lIjoi4CBUZXN0IE5hbekiLCJjb3Vyc2UiOiJDb3Vyc2UgMSJ9"
    # Ruby JSON.parse(Base64.urlsafe_decode64(encoded_config) becomes:
    #   { name: "à Test Namé", course: "Course 1"}
    #   ^ but the name is encoded in ISO-8859-1. This used to throw when gsub
    #     would get called on the string with a regex. Now we call
    #     force_8859_to_utf8 on the string, and the chars now render OK.
    iso_8859_name = 'An ISO-8859 Tester \xE0' # Includes an à in ISO-8859-1
    twenty_hour_certificate_image = create_course_certificate_image(iso_8859_name, '20-hour')
    assert_image twenty_hour_certificate_image, 1754, 1240, 'JPEG'
  end

  private

  def assert_image(image, width, height, format)
    info_line = image.inspect
    assert info_line.match(/#{format}/)
    assert info_line.match(/#{width}x/)
    assert info_line.match(/x#{height}/)
    image && image.destroy!
  end
end

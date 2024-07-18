require 'test_helper'

class CertificateImageTest < ActiveSupport::TestCase
  def test_special_template_courses
    assert CertificateImage.prefilled_title_course?('hourofcode') # 2014
    assert CertificateImage.prefilled_title_course?('flappy')
    assert CertificateImage.prefilled_title_course?('frozen')
    assert CertificateImage.prefilled_title_course?('starwars')
    assert CertificateImage.prefilled_title_course?('mc')
    assert CertificateImage.prefilled_title_course?('20-hour')
    assert CertificateImage.prefilled_title_course?('accelerated')
    assert CertificateImage.prefilled_title_course?('mee')
    assert CertificateImage.prefilled_title_course?('mee_empathy')
    assert CertificateImage.prefilled_title_course?('mee_timecraft')
    assert CertificateImage.prefilled_title_course?('mee_estate')
    refute CertificateImage.prefilled_title_course?('course1')
    refute CertificateImage.prefilled_title_course?('course2')
    refute CertificateImage.prefilled_title_course?('course3')
    refute CertificateImage.prefilled_title_course?('course4')
  end

  def test_course_templates
    assert_equal 'MC_Hour_Of_Code_Certificate.png', CertificateImage.certificate_template_for('mc')
    assert_equal '20hours_certificate.jpg', CertificateImage.certificate_template_for('20-hour')
    assert_equal '20hours_certificate.jpg', CertificateImage.certificate_template_for('accelerated')
    assert_equal 'hour_of_code_certificate.jpg', CertificateImage.certificate_template_for('frozen')
    assert_equal 'hour_of_code_certificate.jpg', CertificateImage.certificate_template_for('starwars')
    assert_equal 'hour_of_code_certificate.jpg', CertificateImage.certificate_template_for('flappy')
    assert_equal 'hour_of_code_certificate.jpg', CertificateImage.certificate_template_for('playlab')
    assert_equal 'blank_certificate.png', CertificateImage.certificate_template_for('course1')
    assert_equal 'blank_certificate.png', CertificateImage.certificate_template_for('course2')
    assert_equal 'blank_certificate.png', CertificateImage.certificate_template_for('course3')
    assert_equal 'blank_certificate.png', CertificateImage.certificate_template_for('course4')
  end

  def test_pl_course_template
    course_version = create :course_version, :with_unit
    course_version.content_root.update!(instructor_audience: 'facilitator', participant_audience: 'teacher')
    assert_equal 'self_paced_pl_certificate.png', CertificateImage.certificate_template_for(course_version.name)
  end

  def test_image_generation
    mc_certificate_image = CertificateImage.create_course_certificate_image('Robot Tester', 'mc')
    assert_image mc_certificate_image, 1754, 1235, 'PNG'
    hoc_certificate_image = CertificateImage.create_course_certificate_image('Robot Tester', 'flappy')
    assert_image hoc_certificate_image, 1754, 1235, 'JPEG'
    hoc_certificate_image_with_ampersand = CertificateImage.create_course_certificate_image('Jeffrey & Peter', 'flappy')
    assert_image hoc_certificate_image_with_ampersand, 1754, 1235, 'JPEG'
    hoc_certificate_image_with_angle_bracket = CertificateImage.create_course_certificate_image('amii <3', 'flappy')
    assert_image hoc_certificate_image_with_angle_bracket, 1754, 1235, 'JPEG'
    hoc_certificate_image_with_imagemagick_special_chars = CertificateImage.create_course_certificate_image('@\n%', 'flappy')
    assert_image hoc_certificate_image_with_imagemagick_special_chars, 1754, 1235, 'JPEG'
    hoc_certificate_image_with_empty_name = CertificateImage.create_course_certificate_image('', 'flappy')
    assert_image hoc_certificate_image_with_empty_name, 1754, 1235, 'JPEG'
    hoc_certificate_image_with_just_whitespace = CertificateImage.create_course_certificate_image(" \n\t", 'flappy')
    assert_image hoc_certificate_image_with_just_whitespace, 1754, 1235, 'JPEG'
    hoc_certificate_image_with_too_long_name = CertificateImage.create_course_certificate_image("y????????????r?????????????????????wgt??????ygrcr?????????fy?????????hc?????????rc???f?????????c????????????r6trsb??????????????????yb?????????tg???????????????????????????hf?????????????????????????????????????????????????????????b???v????????????????????????b???jy?????????????????????TV?????????N??????vyTB??????dv??????????????????t????????????t??????shTVk???s????????????TVty???hfj?????????????????????th???kty???bhjbyt???yty???Jyv???????????????#ty????????????df", 'flappy')
    assert_image hoc_certificate_image_with_too_long_name, 1754, 1235, 'JPEG'
    unspecified_course_image = CertificateImage.create_course_certificate_image('Robot Tester', nil)
    assert_image unspecified_course_image, 1754, 1235, 'JPEG'
    blank_named_certificate_image = CertificateImage.create_course_certificate_image('Robot Tester', 'course1', nil, 'Course 1')
    assert_image blank_named_certificate_image, 1754, 1240, 'PNG'
    twenty_hour_certificate_image = CertificateImage.create_course_certificate_image('Robot Tester', '20-hour')
    assert_image twenty_hour_certificate_image, 1754, 1240, 'JPEG'
    accelerated_certificate_image = CertificateImage.create_course_certificate_image('Robot Tester', 'accelerated')
    assert_image accelerated_certificate_image, 1754, 1240, 'JPEG'

    # Create course certificates with nil and empty values
    nil_name_course_certificate_image = CertificateImage.create_course_certificate_image(nil, 'course1', 'sponsor', 'Course 1')
    assert_image nil_name_course_certificate_image, 1754, 1240, 'PNG'
    nil_sponsor_course_certificate_image = CertificateImage.create_course_certificate_image('Robot Tester', 'course1', nil, 'Course 1')
    assert_image nil_sponsor_course_certificate_image, 1754, 1240, 'PNG'
    nil_title_course_certificate_image = CertificateImage.create_course_certificate_image('Robot Tester', 'course1', 'sponsor', nil)
    assert_image nil_title_course_certificate_image, 1754, 1240, 'PNG'
    empty_name_course_certificate_image = CertificateImage.create_course_certificate_image('', 'course1', 'sponsor', 'Course 1')
    assert_image empty_name_course_certificate_image, 1754, 1240, 'PNG'
    empty_sponsor_course_certificate_image = CertificateImage.create_course_certificate_image('Robot Tester', 'course1', '', 'Course 1')
    assert_image empty_sponsor_course_certificate_image, 1754, 1240, 'PNG'
    empty_title_course_certificate_image = CertificateImage.create_course_certificate_image('Robot Tester', 'course1', 'sponsor', '')
    assert_image empty_title_course_certificate_image, 1754, 1240, 'PNG'

    # Entered name "à Test Namé" on /congrats/course1
    # JS btoa(JSON.stringified(config)) becomes:
    #   "eyJuYW1lIjoi4CBUZXN0IE5hbekiLCJjb3Vyc2UiOiJDb3Vyc2UgMSJ9"
    # Ruby JSON.parse(Base64.urlsafe_decode64(encoded_config) becomes:
    #   { name: "à Test Namé", course: "Course 1"}
    #   ^ but the name is encoded in ISO-8859-1. This used to throw when gsub
    #     would get called on the string with a regex. Now we call
    #     force_8859_to_utf8 on the string, and the chars now render OK.
    iso_8859_name = 'An ISO-8859 Tester \xE0' # Includes an à in ISO-8859-1
    twenty_hour_certificate_image = CertificateImage.create_course_certificate_image(iso_8859_name, '20-hour')
    assert_image twenty_hour_certificate_image, 1754, 1240, 'JPEG'
  end

  def test_pl_certificate_image_generation
    course_version = create :course_version, :with_unit
    course_version.content_root.update!(instructor_audience: 'facilitator', participant_audience: 'teacher')
    pl_certificate_image = CertificateImage.create_course_certificate_image('Robot Tester', course_version.name)
    assert_image pl_certificate_image, 2526, 1786, 'PNG'
  end

  def test_escape_image_magick_string
    # Imagemagick will interperate a '@' at the beginning of a string to be a
    # filepath
    assert_equal '\\@hello', CertificateImage.escape_image_magick_string('@hello')
    # '@' in the middle of a string is fine.
    assert_equal 'hello@world.com', CertificateImage.escape_image_magick_string('hello@world.com')
    # '%' is a special imagemagick symbol for inserting image metadata such as
    # width.
    assert_equal 'width=\\%x', CertificateImage.escape_image_magick_string('width=%x')
    # Strings shouldn't allow new-line characters.
    assert_equal '\\\\n', CertificateImage.escape_image_magick_string("\n")
    # Imagemagick will interperate '\\n' as a new-line.
    assert_equal '\\\\n', CertificateImage.escape_image_magick_string('\\n')
    # Nothing should be escaped with a '\' so just print any '\'s.
    assert_equal '\\\\', CertificateImage.escape_image_magick_string('\\')
  end

  def test_hoc_course
    coursea = create :script, name: "coursea-2021", is_course: true
    create :course_version, content_root: coursea

    csp = create :unit_group, name: 'csp-2021'
    create :course_version, content_root: csp

    hello = create :script, name: 'hello', is_course: true
    cv = create :course_version, content_root: hello
    create :course_offering, course_versions: [cv], key: 'hello', marketing_initiative: 'HOC'

    other = create :script, name: 'other', is_course: true
    cv = create :course_version, content_root: other
    create :course_offering, course_versions: [cv], key: 'other', marketing_initiative: 'CSF'

    assert CertificateImage.hoc_course?('flappy')
    assert CertificateImage.hoc_course?('oceans')
    assert CertificateImage.hoc_course?('mc')
    assert CertificateImage.hoc_course?('mee')
    assert CertificateImage.hoc_course?('kodable')
    assert CertificateImage.hoc_course?('hello')

    # course1 is created by dashboard test fixtures
    refute CertificateImage.hoc_course?('course1')
    refute CertificateImage.hoc_course?('coursea-2021')
    refute CertificateImage.hoc_course?('csp-2021')
    refute CertificateImage.hoc_course?('other')
  end

  private def assert_image(image, width, height, format)
    info_line = image.inspect
    assert info_line.match(/#{format}/)
    assert info_line.match(/#{width}x/)
    assert info_line.match(/x#{height}/)
    image&.destroy!
  end
end

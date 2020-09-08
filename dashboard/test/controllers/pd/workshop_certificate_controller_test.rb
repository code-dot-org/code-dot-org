require 'test_helper'

class Pd::WorkshopCertificateControllerTest < ::ActionController::TestCase
  setup do
    @user = create :teacher
    sign_in(@user)
    @workshop = create :workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSD
    @enrollment = create :pd_enrollment, :with_attendance, workshop: @workshop

    facilitator_1 = create :facilitator, name: 'Facilitator 1'
    facilitator_2 = create :facilitator, name: 'Facilitator 2'
    [facilitator_1, facilitator_2].each do |f|
      create(:pd_course_facilitator, facilitator: f, course: Pd::Workshop::COURSE_CSD)
    end

    @workshop.facilitators << facilitator_1
    @workshop.facilitators << facilitator_2
  end

  test_user_gets_response_for(
    :generate_certificate,
    name: 'Generates certificate for a real user',
    user: -> {@user},
    params: -> {{enrollment_code: @enrollment.code}}
  )

  test 'Generates no certificate for an invalid enrollment' do
    assert_raise ActiveRecord::RecordNotFound do
      get :generate_certificate, params: {enrollment_code: "garbage code"}
    end
  end

  test 'Generates no certificates if teacher did not attend workshop' do
    @enrollment = create :pd_enrollment, workshop: @workshop

    get :generate_certificate, params: {enrollment_code: @enrollment.code}
    assert_response :missing
  end

  # Disable this lint rule because it's very useful to use _ as shorthand for 'anything' matchers
  # rubocop:disable Lint/UnderscorePrefixedVariableName

  test 'Generates certificate for CSF 101 workshop' do
    workshop = create :csf_intro_workshop
    enrollment = create :pd_enrollment, :with_attendance, workshop: workshop

    mock_image = expect_renders_certificate
    expect_renders_text(mock_image, enrollment.full_name)
    expect_renders_text(mock_image, 'CS Fundamentals')
    expect_renders_text(mock_image, 'Intro Workshop')
    workshop.facilitators.each {|f| expect_renders_text(mock_image, f.name)}
    workshop_hours = Integer(workshop.effective_num_hours)
    expect_renders_text(mock_image, workshop_hours.to_s)
    expect_renders_text(mock_image, workshop.workshop_date_range_string)

    get :generate_certificate, params: {
      user: @user,
      enrollment_code: enrollment.code
    }
  end

  test 'Generates certificate for regular CSD event' do
    enrollment = create :pd_enrollment, :with_attendance, workshop: @workshop
    assert_equal Pd::Workshop::COURSE_CSD, @workshop.course

    mock_image = expect_renders_certificate
    expect_renders_text(mock_image, enrollment.full_name)
    expect_renders_text(mock_image, 'CS Discoveries')
    expect_renders_text(mock_image, '5-day Summer Workshop')
    @workshop.facilitators.each {|f| expect_renders_text(mock_image, f.name)}
    workshop_hours = Integer(@workshop.effective_num_hours)
    expect_renders_text(mock_image, workshop_hours.to_s)
    expect_renders_text(mock_image, @workshop.workshop_date_range_string)

    get :generate_certificate, params: {
      user: @user,
      enrollment_code: enrollment.code
    }
  end

  test 'Generates certificate for CSD teachercon' do
    workshop = create :workshop,
      num_sessions: 1,
      course: Pd::Workshop::COURSE_CSD,
      subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON
    enrollment = create :pd_enrollment, :with_attendance, workshop: workshop

    mock_image = expect_renders_certificate
    expect_renders_text(mock_image, enrollment.full_name)
    expect_renders_text(mock_image, 'CS Discoveries')
    expect_renders_text(mock_image, 'Code.org TeacherCon')
    expect_renders_text(mock_image, Pd::CertificateRenderer::HARDCODED_CSD_FACILITATOR)
    workshop_hours = Integer(workshop.effective_num_hours)
    expect_renders_text(mock_image, workshop_hours.to_s)
    expect_renders_text(mock_image, workshop.workshop_date_range_string)

    get :generate_certificate, params: {
      user: @user,
      enrollment_code: enrollment.code
    }
  end

  test 'Generates certificate for CSP teachercon' do
    workshop = create :workshop,
      num_sessions: 1,
      course: Pd::Workshop::COURSE_CSP,
      subject: Pd::Workshop::SUBJECT_CSP_TEACHER_CON
    enrollment = create :pd_enrollment, :with_attendance, workshop: workshop

    mock_image = expect_renders_certificate
    expect_renders_text(mock_image, enrollment.full_name)
    expect_renders_text(mock_image, 'CS Principles')
    expect_renders_text(mock_image, 'Code.org TeacherCon')
    expect_renders_text(mock_image, Pd::CertificateRenderer::HARDCODED_CSP_FACILITATOR)
    workshop_hours = Integer(workshop.effective_num_hours)
    expect_renders_text(mock_image, workshop_hours.to_s)
    expect_renders_text(mock_image, workshop.workshop_date_range_string)

    get :generate_certificate, params: {
      user: @user,
      enrollment_code: enrollment.code
    }
  end

  # Verifies the expected Magick::Image methods are called which are needed to
  # put text on the certificate template image.
  def expect_renders_text(mock_background_image, string)
    # See create_workshop_certificate_image in certificate_image.rb for help
    # understanding why these particular mocks and stubs work.
    mock_text_image = mock
    mock_text_image.stub_everything
    # :trim is called in order to make sure excess empty space is removed around
    # the text.
    mock_text_image.expects(:trim!).returns(mock_text_image)
    # :columns is the width of the image in pixels. This is checked to see if the
    # text needs to be resized.
    mock_text_image.expects(:columns).returns(325)
    # :read with a "pango:..." string is what generates an image with the given
    # text in it.
    Magick::Image.expects(:read).with("pango:#{string}").returns([mock_text_image])
    # :composite! puts the text_image onto the certificate.
    _ = anything
    mock_background_image.expects(:composite!).with(mock_text_image, _, _, _, Magick::OverCompositeOp)
    # Important to make sure the temporary text image is destroyed; otherwise
    # there will be a memory leak.
    mock_text_image.expects(:destroy!)
  end

  # rubocop:enable Lint/UnderscorePrefixedVariableName
  # Verifies that the certificate template image is loaded by the Magick::Image
  # methods and eventually cleaned up.
  def expect_renders_certificate
    # See create_workshop_certificate_image in certificate_image.rb for help
    # understanding why these particular mocks and stubs work.

    # Since we don't really want to test the drawing implementation, we want
    # Magick::Image.read to return a very flexible mock Magick::Image.
    mock_image = mock
    mock_image.stub_everything
    Magick::Image.expects(:read).returns([mock_image])

    # The Magick::Image is returned all the way up to the WorkshopCertificateController,
    # which is responsible for cleaning it up, so we set up expectations that
    # the image will be used and then destroyed to avoid memory leaks.
    # Note: These expectations take precendence over the `stub_everything` calls above.
    mock_image.expects(:destroy!)
    mock_image
  end

  test_redirect_to_sign_in_for :generate_certificate, params: -> {{enrollment_code: @enrollment.code}}
end

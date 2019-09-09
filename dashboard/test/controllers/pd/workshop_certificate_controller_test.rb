require 'test_helper'

class Pd::WorkshopCertificateControllerTest < ::ActionController::TestCase
  setup do
    @user = create :teacher
    sign_in(@user)
    @workshop = create :workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSD
    @enrollment = create :pd_enrollment, workshop: @workshop

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

  # Disable this lint rule because it's very useful to use _ as shorthand for 'anything' matchers
  # rubocop:disable Lint/UnderscorePrefixedVariableName

  test 'Generates certificate for CSF 101 workshop' do
    workshop = create :csf_intro_workshop
    enrollment = create :pd_enrollment, workshop: workshop

    _ = anything
    mock_draw = expect_renders_certificate
    mock_draw.expects(:annotate).with(_, _, _, _, _, 'CS Fundamentals')
    mock_draw.expects(:annotate).with(_, _, _, _, _, 'Intro Workshop')

    get :generate_certificate, params: {
      user: @user,
      enrollment_code: enrollment.code
    }
  end

  test 'Generates certificate for regular CSD event' do
    enrollment = create :pd_enrollment, workshop: @workshop
    assert_equal Pd::Workshop::COURSE_CSD, @workshop.course

    _ = anything
    mock_draw = expect_renders_certificate
    mock_draw.expects(:annotate).with(_, _, _, _, _, 'CS Discoveries')
    mock_draw.expects(:annotate).with(_, _, _, _, _, 'Facilitator 1')
    mock_draw.expects(:annotate).with(_, _, _, _, _, 'Facilitator 2')

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
    enrollment = create :pd_enrollment, workshop: workshop

    _ = anything
    mock_draw = expect_renders_certificate
    mock_draw.expects(:annotate).with(_, _, _, _, _, 'CS Discoveries')
    mock_draw.expects(:annotate).with(_, _, _, _, _, Pd::CertificateRenderer::HARDCODED_CSD_FACILITATOR)

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
    enrollment = create :pd_enrollment, workshop: workshop

    _ = anything
    mock_draw = expect_renders_certificate
    mock_draw.expects(:annotate).with(_, _, _, _, _, 'CS Principles')
    mock_draw.expects(:annotate).with(_, _, _, _, _, Pd::CertificateRenderer::HARDCODED_CSP_FACILITATOR)

    get :generate_certificate, params: {
      user: @user,
      enrollment_code: enrollment.code
    }
  end

  # rubocop:enable Lint/UnderscorePrefixedVariableName

  def expect_renders_certificate
    # Mock certificate generation at a fairly low level so that we actually run
    # our logic for generating annotations on the certificate.

    # See create_workshop_certificate_image in certificate_image.rb for help
    # understanding why these particular mocks and stubs work.

    # Since we don't really want to test the drawing implementation, we want
    # Magick::Image.read to return a very flexible mock Magick::Image.
    mock_image = mock
    mock_image.stub_everything
    Magick::Image.expects(:read).returns([mock_image])

    # We also want Magick::Draw.new to return a flexible mock Magick::Draw.
    mock_draw = mock
    mock_draw.stub_everything
    Magick::Draw.expects(:new).returns(mock_draw)

    # The Magick::Image is returned all the way up to the WorkshopCertificateController,
    # which is responsible for cleaning it up, so we set up expectations that
    # the image will be used and then destroyed to avoid memory leaks.
    # Note: These expectations take precendence over the `stub_everything` calls above.
    mock_image.expects(:to_blob)
    mock_image.expects(:destroy!)

    # Return mock Magick::Draw to tests can add expectations about the specific annotations
    # being generated
    mock_draw
  end

  test_redirect_to_sign_in_for :generate_certificate, params: -> {{enrollment_code: @enrollment.code}}
end

require 'test_helper'

class Pd::WorkshopCertificateControllerTest < ::ActionController::TestCase
  setup do
    @user = create :teacher
    sign_in(@user)
    @workshop = create :pd_workshop, num_sessions: 1
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

  test 'Generates certificate for CSF 101 workshop' do
    workshop = create :pd_workshop,
      num_sessions: 1,
      course: Pd::Workshop::COURSE_CSF,
      subject: Pd::Workshop::SUBJECT_CSF_101
    enrollment = create :pd_enrollment, workshop: workshop
    mock_image = mock
    @controller.expects(:create_workshop_certificate_helper).
        with(workshop, []).
        returns(mock_image)
    mock_image.expects(:destroy!)
    mock_image.expects(:to_blob)

    get :generate_certificate, params: {
      user: @user,
      enrollment_code: enrollment.code
    }
  end

  test 'Generates certificate for regular CSD event' do
    enrollment = create :pd_enrollment, workshop: @workshop
    mock_image = mock

    @controller.expects(:create_workshop_certificate_helper).
      with(@workshop, ['Facilitator 1', 'Facilitator 2']).
      returns(mock_image)
    mock_image.expects(:destroy!)
    mock_image.expects(:to_blob)

    get :generate_certificate, params: {
      user: @user,
      enrollment_code: enrollment.code
    }
  end

  test 'Generates certificate for CSD teachercon' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_CSD_TEACHER_CON
    enrollment = create :pd_enrollment, workshop: workshop
    mock_image = mock
    @controller.expects(:create_workshop_certificate_helper).
      with(workshop, [Pd::WorkshopCertificateController::HARDCODED_CSD_FACILITATOR]).
      returns(mock_image)
    mock_image.expects(:destroy!)
    mock_image.expects(:to_blob)

    get :generate_certificate, params: {
      user: @user,
      enrollment_code: enrollment.code
    }
  end

  test 'Generates certificate for CSP teachercon' do
    workshop = create :pd_workshop, num_sessions: 1, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_TEACHER_CON
    enrollment = create :pd_enrollment, workshop: workshop
    mock_image = mock
    @controller.expects(:create_workshop_certificate_helper).
      with(workshop, [Pd::WorkshopCertificateController::HARDCODED_CSP_FACILITATOR]).
      returns(mock_image)
    mock_image.expects(:destroy!)
    mock_image.expects(:to_blob)
    get :generate_certificate, params: {
      user: @user,
      enrollment_code: enrollment.code
    }
  end

  test_redirect_to_sign_in_for :generate_certificate, params: -> {{enrollment_code: @enrollment.code}}
end

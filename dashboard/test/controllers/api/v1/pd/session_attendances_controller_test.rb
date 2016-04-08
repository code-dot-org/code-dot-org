require 'test_helper'

class Api::V1::Pd::SessionAttendancesControllerTest < ::ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @organizer = create :workshop_organizer
    @facilitator = create :facilitator

    @workshop = create :pd_workshop, organizer: @organizer, facilitators: [@facilitator]
    @session = create :pd_session
    @workshop.sessions << @session

    @other_workshop = create :pd_workshop
    @other_workshop.sessions << create(:pd_session)

    @teacher = create :teacher
    @teacher.sign_in_count = 1
    @teacher.save!
  end

  test 'facilitators can manage attendance for their workshops' do
    sign_in @facilitator
    get :index, workshop_id: @workshop.id
    assert_response :success

    patch :bulk_update, workshop_id: @workshop.id, pd_workshop: params
    assert_response :success
  end

  test 'workshop organizers can manage attendance for their workshops' do
    sign_in @organizer
    get :index, workshop_id: @workshop.id
    assert_response :success

    patch :bulk_update, workshop_id: @workshop.id, pd_workshop: params
    assert_response :success
  end

  test 'facilitators cannot see attendance for workshops they are not facilitating' do
    sign_in @facilitator
    get :index, workshop_id: @other_workshop.id
    assert_response :forbidden
  end

  test 'organizers cannot see attendance for workshops they are not organizing' do
    sign_in @organizer
    get :index, workshop_id: @other_workshop.id
    assert_response :forbidden
  end

  test 'teachers cannot read attendance' do
    # Even if they are attending the workshop
    create :pd_attendance, session: @session, teacher: @teacher

    sign_in @teacher
    get :index, workshop_id: @workshop.id
    assert_response :forbidden
  end

  test 'see enrolled teachers' do
    create :pd_enrollment, workshop: @workshop, name: @teacher.name, email: @teacher.email

    sign_in @facilitator
    get :index, workshop_id: @workshop.id
    response = JSON.parse(@response.body)
    assert_equal 1, response.length

    session_attendances = response[0]['attendances']
    assert_equal 1, session_attendances.length

    assert_equal @teacher.name, session_attendances[0]['name']
    assert_equal @teacher.email, session_attendances[0]['email']
    assert session_attendances[0]['enrolled']
    assert_equal @teacher.id, session_attendances[0]['user_id']
    refute session_attendances[0]['in_section']
    refute session_attendances[0]['attended']
  end

  test 'see teachers in section' do
    @workshop.start!
    @workshop.section.add_student @teacher

    sign_in @facilitator
    get :index, workshop_id: @workshop.id
    response = JSON.parse(@response.body)
    assert_equal 1, response.length

    session_attendances = response[0]['attendances']
    assert_equal 1, session_attendances.length

    assert_equal @teacher.name, session_attendances[0]['name']
    assert_equal @teacher.email, session_attendances[0]['email']
    refute session_attendances[0]['enrolled']
    assert_equal @teacher.id, session_attendances[0]['user_id']
    assert session_attendances[0]['in_section']
    refute session_attendances[0]['attended']
  end

  test 'see teacher attendance' do
    # Enrolled, in section, signed in, and attended
    create :pd_enrollment, workshop: @workshop, name: @teacher.name, email: @teacher.email
    @workshop.start!
    @workshop.section.add_student @teacher
    create :pd_attendance, session: @session, teacher: @teacher

    sign_in @facilitator
    get :index, workshop_id: @workshop.id
    response = JSON.parse(@response.body)
    assert_equal 1, response.length

    session_attendances = response[0]['attendances']
    assert_equal 1, session_attendances.length

    assert_equal @teacher.name, session_attendances[0]['name']
    assert_equal @teacher.email, session_attendances[0]['email']
    assert session_attendances[0]['enrolled']
    assert_equal @teacher.id, session_attendances[0]['user_id']
    assert session_attendances[0]['in_section']
    assert session_attendances[0]['attended']
  end

  test 'toggle teacher attendance' do
    # Enrolled and in section
    create :pd_enrollment, workshop: @workshop, name: @teacher.name, email: @teacher.email
    @workshop.start!
    @workshop.section.add_student @teacher
    assert_empty Pd::Attendance.for_teacher_in_workshop(@teacher, @workshop)

    # Mark attended
    sign_in @facilitator
    patch :bulk_update, workshop_id: @workshop.id, pd_workshop: params
    assert_response :success
    assert_equal 1, Pd::Attendance.for_teacher_in_workshop(@teacher, @workshop).count

    # Mark not attended
    patch :bulk_update, workshop_id: @workshop.id, pd_workshop: params(false)
    assert_response :success
    assert_empty Pd::Attendance.for_teacher_in_workshop(@teacher, @workshop)
  end

  private

  def params(attended = true)
    attendances = attended ? [@teacher.id] : []
    {
      session_attendances: [
        session_id: @session.id,
        attendances: attendances
      ]
    }
  end
end

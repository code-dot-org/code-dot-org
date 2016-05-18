require 'test_helper'

class Api::V1::Pd::WorkshopAttendanceControllerTest < ::ActionController::TestCase
  freeze_time

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
    get :show, workshop_id: @workshop.id
    assert_response :success

    patch :update, workshop_id: @workshop.id, pd_workshop: params
    assert_response :success
  end

  test 'workshop organizers can manage attendance for their workshops' do
    sign_in @organizer
    get :show, workshop_id: @workshop.id
    assert_response :success

    patch :update, workshop_id: @workshop.id, pd_workshop: params
    assert_response :success
  end

  test 'facilitators cannot see attendance for workshops they are not facilitating' do
    sign_in @facilitator
    get :show, workshop_id: @other_workshop.id
    assert_response :forbidden
  end

  test 'organizers cannot see attendance for workshops they are not organizing' do
    sign_in @organizer
    get :show, workshop_id: @other_workshop.id
    assert_response :forbidden
  end

  test 'teachers cannot read attendance' do
    # Even if they are attending the workshop
    create :pd_attendance, session: @session, teacher: @teacher

    sign_in @teacher
    get :show, workshop_id: @workshop.id
    assert_response :forbidden
  end

  test 'admins get admin actions' do
    sign_in create(:admin)
    get :show, workshop_id: @workshop.id
    assert JSON.parse(@response.body)['admin_actions']
  end

  test 'non-admins do not get admin actions' do
    sign_in @organizer
    get :show, workshop_id: @workshop.id
    refute JSON.parse(@response.body)['admin_actions']
  end

  test 'see enrolled teachers' do
    create :pd_enrollment, workshop: @workshop, name: @teacher.name, email: @teacher.email

    sign_in @facilitator
    get :show, workshop_id: @workshop.id
    response = JSON.parse(@response.body)
    assert_equal 1, response['session_attendances'].length

    attendance = response['session_attendances'][0]['attendance']
    assert_equal 1, attendance.length

    assert_equal @teacher.name, attendance[0]['name']
    assert_equal @teacher.email, attendance[0]['email']
    assert attendance[0]['enrolled']
    assert_equal @teacher.id, attendance[0]['user_id']
    refute attendance[0]['in_section']
    refute attendance[0]['attended']
  end

  test 'see teachers in section' do
    @workshop.start!
    @workshop.section.add_student @teacher

    sign_in @facilitator
    get :show, workshop_id: @workshop.id
    response = JSON.parse(@response.body)
    assert_equal 1, response['session_attendances'].length

    attendance = response['session_attendances'][0]['attendance']
    assert_equal 1, attendance.length

    assert_equal @teacher.name, attendance[0]['name']
    assert_equal @teacher.email, attendance[0]['email']
    refute attendance[0]['enrolled']
    assert_equal @teacher.id, attendance[0]['user_id']
    assert attendance[0]['in_section']
    refute attendance[0]['attended']
  end

  test 'see teacher attendance' do
    # Enrolled, in section, signed in, and attended
    create :pd_enrollment, workshop: @workshop, name: @teacher.name, email: @teacher.email
    @workshop.start!
    @workshop.section.add_student @teacher
    create :pd_attendance, session: @session, teacher: @teacher

    sign_in @facilitator
    get :show, workshop_id: @workshop.id
    response = JSON.parse(@response.body)
    assert_equal 1, response['session_attendances'].length

    attendance = response['session_attendances'][0]['attendance']
    assert_equal 1, attendance.length

    assert_equal @teacher.name, attendance[0]['name']
    assert_equal @teacher.email, attendance[0]['email']
    assert attendance[0]['enrolled']
    assert_equal @teacher.id, attendance[0]['user_id']
    assert attendance[0]['in_section']
    assert attendance[0]['attended']
  end

  test 'toggle teacher attendance' do
    # Enrolled and in section
    create :pd_enrollment, workshop: @workshop, name: @teacher.name, email: @teacher.email
    @workshop.start!
    @workshop.section.add_student @teacher
    assert_empty Pd::Attendance.for_teacher(@teacher).for_workshop(@workshop)

    # Mark attended
    sign_in @facilitator
    patch :update, workshop_id: @workshop.id, pd_workshop: params
    assert_response :success
    assert_equal 1, Pd::Attendance.for_teacher(@teacher).for_workshop(@workshop).count

    # Mark not attended
    patch :update, workshop_id: @workshop.id, pd_workshop: params(false)
    assert_response :success
    assert_empty Pd::Attendance.for_teacher(@teacher).for_workshop(@workshop)
  end

  test 'admins can create new users in attendance' do
    sign_in create(:admin)
    email = "new_teacher#{SecureRandom.hex(4)}@example.net"
    create :pd_enrollment, workshop: @workshop, email: email

    assert_creates(User) do
      patch :update, workshop_id: @workshop.id, pd_workshop: create_user_params(email)
      assert_response :success
    end
    assert_equal 1, Pd::Attendance.for_teacher(User.last).for_workshop(@workshop).count
  end

  test 'admin creating a user without enrollment raises error' do
    sign_in create(:admin)
    email = "new_teacher#{SecureRandom.hex(4)}@example.net"

    assert_raises(ActiveRecord::RecordNotFound) do
      patch :update, workshop_id: @workshop.id, pd_workshop: create_user_params(email)
    end
  end

  test 'non-admins cannot create new users' do
    sign_in @organizer
    email = "new_teacher#{SecureRandom.hex(4)}@example.net"
    create :pd_enrollment, workshop: @workshop, email: email

    patch :update, workshop_id: @workshop.id, pd_workshop: create_user_params(email)
    assert_response :forbidden
  end

  private

  def params(attended = true)
    attendances = attended ? [{id: @teacher.id}] : []
    {
      session_attendances: [
        session_id: @session.id,
        attendances: attendances
      ]
    }
  end

  def create_user_params(enrolled_teacher_email)
    {
      session_attendances: [
        session_id: @session.id,
        attendances: [{email: enrolled_teacher_email}]
      ]
    }
  end
end

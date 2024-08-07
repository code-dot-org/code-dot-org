require 'test_helper'

class Api::V1::Pd::WorkshopEnrollmentsControllerTest < ActionController::TestCase
  setup do
    @organizer = create :workshop_organizer
    @program_manager = create :program_manager
    @facilitator = create :facilitator

    @organizer_workshop = create :workshop, organizer: @organizer, facilitators: [@facilitator]
    @organizer_workshop_enrollment = create :pd_enrollment, workshop: @organizer_workshop

    @workshop = create :workshop, :with_codes_assigned, organizer: @program_manager, facilitators: [@facilitator], num_sessions: 1
    @enrollment = create :pd_enrollment, workshop: @workshop

    @unrelated_workshop = create :workshop
    @unrelated_enrollment = create :pd_enrollment, workshop: @unrelated_workshop
  end

  CONTROLLER_PATH = 'api/v1/pd/workshop_enrollments'

  RESPONSE_MESSAGES = Api::V1::Pd::WorkshopEnrollmentsController::RESPONSE_MESSAGES

  test 'routes' do
    assert_routing(
      {method: :get, path: "http://#{CDO.dashboard_hostname}/api/v1/pd/workshops/#{@workshop.id}/enrollments"},
      {controller: CONTROLLER_PATH, action: 'index', workshop_id: @workshop.id.to_s}
    )

    assert_routing(
      {path: "http://#{CDO.dashboard_hostname}/api/v1/pd/workshops/#{@workshop.id}/enrollments", method: :post},
      {controller: CONTROLLER_PATH, action: 'create', workshop_id: @workshop.id.to_s}
    )

    assert_routing(
      {method: :delete, path: "http://#{CDO.dashboard_hostname}/api/v1/pd/workshops/#{@workshop.id}/enrollments/#{@enrollment.id}"},
      {controller: CONTROLLER_PATH, action: 'destroy', workshop_id: @workshop.id.to_s, id: @enrollment.id.to_s}
    )

    assert_routing(
      {method: :delete, path: "http://#{CDO.dashboard_hostname}/api/v1/pd/enrollments/#{@enrollment.code}"},
      {controller: CONTROLLER_PATH, action: 'cancel', enrollment_code: @enrollment.code.to_s}
    )

    assert_routing(
      {method: :post, path: "http://#{CDO.dashboard_hostname}/api/v1/pd/enrollment/#{@enrollment.id}/scholarship_info"},
      {controller: CONTROLLER_PATH, action: 'update_scholarship_info', enrollment_id: @enrollment.id.to_s}
    )

    assert_routing(
      {method: :post, path: "http://#{CDO.dashboard_hostname}/api/v1/pd/enrollments/move"},
      {controller: CONTROLLER_PATH, action: 'move', enrollment_ids: [@enrollment.id], destination_workshop_id: @unrelated_workshop.id},
      {},
      {enrollment_ids: [@enrollment.id], destination_workshop_id: @unrelated_workshop.id}
    )

    assert_routing(
      {method: :post, path: "http://#{CDO.dashboard_hostname}/api/v1/pd/enrollment/#{@enrollment.id}/edit"},
      {controller: CONTROLLER_PATH, action: 'edit', id: @enrollment.id.to_s}
    )
  end

  test 'admins can see enrollments for all workshops' do
    sign_in create(:admin)
    get :index, params: {workshop_id: @unrelated_workshop.id}
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @unrelated_enrollment.email, response_json[0]['email']
  end

  test 'workshop organizers can see enrollments in their workshops' do
    sign_in @organizer
    get :index, params: {workshop_id: @organizer_workshop.id}
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @organizer_workshop_enrollment.email, response_json[0]['email']
  end

  test 'workshop organizers cannot see enrollments in workshops they are not organizing' do
    sign_in @organizer
    get :index, params: {workshop_id: @unrelated_workshop.id}
    assert_response :forbidden
  end

  test 'program managers can see enrollments in their workshops' do
    sign_in @program_manager
    get :index, params: {workshop_id: @workshop.id}
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @enrollment.email, response_json[0]['email']
  end

  test 'program managers cannot see enrollments in workshops they are not organizing' do
    sign_in @program_manager
    get :index, params: {workshop_id: @unrelated_workshop.id}
    assert_response :forbidden
  end

  test 'facilitators can see enrollments in their workshops' do
    sign_in @facilitator
    get :index, params: {workshop_id: @workshop.id}
    assert_response :success
    response_json = JSON.parse(@response.body)
    assert_equal 1, response_json.length
    assert_equal @enrollment.email, response_json[0]['email']
  end

  test 'facilitators can see enrollments in their workshops in csv format' do
    sign_in @facilitator
    get :index, params: {workshop_id: @workshop.id, format: :csv}
    assert_response :success

    response_csv = CSV.parse(@response.body)
    assert_equal 2, response_csv.length
    header_row = response_csv[0]
    enrollment_row = response_csv[1]
    assert_equal @enrollment.email, enrollment_row[header_row.find_index('Email')]
  end

  test 'facilitators cannot see enrollments in workshops they are not facilitating' do
    sign_in @facilitator
    get :index, params: {workshop_id: @unrelated_workshop.id}
    assert_response :forbidden
  end

  test_user_gets_response_for(
    :index,
    user: :teacher,
    response: :forbidden,
    params: -> {{workshop_id: @workshop.id}}
  )

  test 'admins can delete enrollments from any workshop' do
    sign_in create(:admin)

    delete :destroy, params: {
      workshop_id: @unrelated_workshop.id,
      id: @unrelated_enrollment.id
    }
    assert_response :success
    refute Pd::Enrollment.exists?(@unrelated_enrollment.id)
  end

  test 'organizers can delete enrollments from their own workshops' do
    sign_in @organizer

    delete :destroy, params: {workshop_id: @organizer_workshop.id, id: @organizer_workshop_enrollment.id}
    assert_response :success
    refute Pd::Enrollment.exists?(@organizer_workshop_enrollment.id)
  end

  test 'organizers cannot delete enrollments from workshops they are not organizing' do
    sign_in @organizer

    delete :destroy, params: {
      workshop_id: @unrelated_workshop.id,
      id: @unrelated_enrollment.id
    }
    assert_response :forbidden
  end

  test 'program managers can delete enrollments from their own workshops' do
    sign_in @program_manager

    delete :destroy, params: {workshop_id: @workshop.id, id: @enrollment.id}
    assert_response :success
    refute Pd::Enrollment.exists?(@enrollment.id)
  end

  test 'program managers cannot delete enrollments from workshops they are not organizing' do
    sign_in @program_manager

    delete :destroy, params: {
      workshop_id: @unrelated_workshop.id,
      id: @unrelated_enrollment.id
    }
    assert_response :forbidden
  end

  test 'facilitators can delete enrollments from their own workshops' do
    sign_in @facilitator

    delete :destroy, params: {workshop_id: @workshop.id, id: @enrollment.id}
    assert_response :success
    refute Pd::Enrollment.exists?(@enrollment.id)
  end

  test 'facilitators cannot delete enrollments from workshops they are not organizing' do
    sign_in @facilitator

    delete :destroy, params: {
      workshop_id: @unrelated_workshop.id,
      id: @unrelated_enrollment.id
    }
    assert_response :forbidden
  end

  test 'deleting an enrollment is idempotent' do
    sign_in create(:admin)

    delete :destroy, params: {workshop_id: @workshop.id, id: @enrollment.id}
    assert_response :success

    delete :destroy, params: {workshop_id: @workshop.id, id: @enrollment.id}
    assert_response :success

    # deleting a non-existent enrollment also succeeds
    delete :destroy, params: {
      workshop_id: @workshop.id,
      id: @unrelated_enrollment.id
    }
    assert_response :success
  end

  test 'cancelling an active enrollment deletes it and sends email' do
    Pd::WorkshopMailer.expects(:teacher_cancel_receipt).returns(stub(:deliver_now))
    Pd::WorkshopMailer.expects(:organizer_cancel_receipt).returns(stub(:deliver_now))

    assert_destroys Pd::Enrollment do
      delete :cancel, params: {enrollment_code: @enrollment.code}
      assert_response :success
    end

    assert @enrollment.reload.deleted?
  end

  test 'cancelling a deleted enrollment does nothing' do
    Pd::WorkshopMailer.expects(:teacher_cancel_receipt).never
    Pd::WorkshopMailer.expects(:organizer_cancel_receipt).never

    @enrollment.destroy
    assert_does_not_destroy Pd::Enrollment do
      delete :cancel, params: {enrollment_code: @enrollment.code}
      assert_response :success
    end
  end

  test 'enrollments can be created' do
    @teacher = create :teacher
    assert_creates(Pd::Enrollment) do
      post :create, params: {
        user_id: @teacher.id,
        workshop_id: @workshop.id,
        school_info: school_info_params
      }.merge(enrollment_test_params)
      assert_response :success
      assert_equal RESPONSE_MESSAGES[:SUCCESS], JSON.parse(@response.body)["workshop_enrollment_status"]
    end
    enrollment = Pd::Enrollment.last
    refute_nil enrollment.code
  end

  test 'can enroll in workshop when all params are submitted' do
    @teacher = create :teacher
    sign_in @teacher
    workshop = create :summer_workshop

    assert_nil Pd::Enrollment.find_by(pd_workshop_id: workshop.id)

    post :create, params: {
      user_id: @teacher.id,
      workshop_id: workshop.id,
      first_name: "Janine",
      last_name: "Teagues",
      email: "janine@test.xx",
      school_info: {school_id: School.first.id},
      role: "Counselor",
      grades_teaching: ["Kindergarten", "Grade 1", "Grade 2"],
      attended_csf_intro_workshop: "No",
      csf_course_experience: {'Course A': "none", 'Course B': "a few lessons", 'Course E': "most lessons"},
      csf_courses_planned: ["Course E", "Course F"],
      csf_intro_intent: "No",
      years_teaching: "30",
      years_teaching_cs: "10",
      previous_courses: "I don’t have experience teaching any of these courses",
      csf_intro_other_factors: "I want to learn computer science concepts.",
      taught_ap_before: "Yes, AP CS Principles or AP CS A",
      planning_to_teach_ap: "Yes"
    }

    assert_response :success
    assert_equal RESPONSE_MESSAGES[:SUCCESS], JSON.parse(@response.body)["workshop_enrollment_status"]
    refute_nil Pd::Enrollment.find_by(pd_workshop_id: workshop.id)
  end

  test 'creating an enrollment can find user and submit if enrollment email is alternate email' do
    teacher = create :teacher
    sign_in teacher

    application = create :pd_teacher_application, user: teacher, status: 'accepted'
    app_alt_email = application.form_data_hash['alternateEmail']

    refute_equal teacher.email, app_alt_email
    assert_equal teacher.email_for_enrollments, app_alt_email

    params = enrollment_test_params.merge(
      {
        user_id: teacher.id,
        email: app_alt_email,
        email_confirmation: app_alt_email,
        workshop_id: @workshop.id,
        school_info: school_info_params
      }
    )
    post :create, params: params

    assert_response :success

    response_body = JSON.parse(@response.body)
    assert_equal RESPONSE_MESSAGES[:SUCCESS], response_body["workshop_enrollment_status"]
    assert response_body["account_exists"]
    refute_nil Pd::Enrollment.find_by(pd_workshop_id: @workshop.id)
  end

  test 'creating a duplicate enrollment sends \'duplicate\' workshop enrollment status' do
    @teacher = create :teacher
    params = enrollment_test_params.merge(
      {
        user_id: @teacher.id,
        first_name: @enrollment.first_name,
        last_name: @enrollment.last_name,
        email: @enrollment.email,
        confirmation_email: @enrollment.email,
      }
    )
    post :create, params: params.merge({workshop_id: @workshop.id})
    assert_response 400
    assert_equal RESPONSE_MESSAGES[:DUPLICATE], JSON.parse(@response.body)["workshop_enrollment_status"]
  end

  test 'creating an enrollment with email match from organizer sends \'own\' workshop enrollment status' do
    params = enrollment_test_params.merge(
      {
        user_id: @organizer.id,
        full_name: @organizer.name,
        email: @organizer.email,
        confirmation_email: @organizer.email,
      }
    )
    post :create, params: params.merge({workshop_id: @organizer_workshop.id})
    assert_response 400
    assert_equal RESPONSE_MESSAGES[:OWN], JSON.parse(@response.body)["workshop_enrollment_status"]
  end

  test 'creating an enrollment with email match from program manager organizer sends \'own\' workshop enrollment status' do
    params = enrollment_test_params.merge(
      {
        user_id: @program_manager.id,
        full_name: @program_manager.name,
        email: @program_manager.email,
        confirmation_email: @program_manager.email,
      }
    )
    post :create, params: params.merge({workshop_id: @workshop.id})
    assert_response 400
    assert_equal RESPONSE_MESSAGES[:OWN], JSON.parse(@response.body)["workshop_enrollment_status"]
  end

  test 'creating an enrollment with email match from facilitator sends \'own\' workshop enrollment status' do
    params = enrollment_test_params.merge(
      {
        user_id: @facilitator.id,
        full_name: @facilitator.name,
        email: @facilitator.email,
        confirmation_email: @facilitator.email,
      }
    )
    post :create, params: params.merge({workshop_id: @workshop.id})
    assert_response 400
    assert_equal RESPONSE_MESSAGES[:OWN], JSON.parse(@response.body)["workshop_enrollment_status"]
  end

  test 'creating an enrollment with errors sends \'error\' workshop enrollment status' do
    @teacher = create :teacher
    params = enrollment_test_params.merge(
      {
        first_name: '',
        confirmation_email: nil
      }
    )
    post :create, params: {
      user_id: @teacher.id,
      workshop_id: @workshop.id,
      pd_enrollment: params,
      school_info: school_info_params
    }
    assert_response 400
    assert_equal RESPONSE_MESSAGES[:ERROR], JSON.parse(@response.body)["workshop_enrollment_status"]
  end

  test 'creating an enrollment on an unknown workshop id returns 404' do
    post :create, params: enrollment_test_params.merge({workshop_id: 'nonsense'})
    assert_response 404
  end

  test 'creating an enrollment for Build Your Own workshops marks user as attended for all sessions' do
    user = create :teacher
    num_workshop_sessions = 3
    byo_workshop = create :pd_workshop,
      funded: false,
      course: Pd::Workshop::COURSE_BUILD_YOUR_OWN,
      subject: nil,
      course_offerings: [] << (create :course_offering),
      num_sessions: num_workshop_sessions
    params = enrollment_test_params(user).merge(
      {
        user_id: user.id,
        workshop_id: byo_workshop.id
      }
    )

    assert_equal 0, Pd::Attendance.for_workshop(byo_workshop).count

    post :create, params: params

    workshop_attendance = Pd::Attendance.for_workshop(byo_workshop)

    assert_equal num_workshop_sessions, workshop_attendance.count
    workshop_attendance.each do |attendance|
      assert_equal user.id, attendance.teacher_id
    end
  end

  test 'admin can update scholarship info' do
    workshop = create :summer_workshop
    enrollment = create :pd_enrollment, :from_user, workshop: workshop
    sign_in create(:admin)

    assert_nil enrollment.scholarship_status
    post :update_scholarship_info, params: {enrollment_id: enrollment.id, scholarship_status: Pd::ScholarshipInfoConstants::YES_OTHER}
    assert_response 200
    assert_equal Pd::ScholarshipInfoConstants::YES_OTHER, JSON.parse(@response.body)["scholarship_status"]
    assert_equal Pd::ScholarshipInfoConstants::YES_OTHER, enrollment.scholarship_status
  end

  test 'program managers can update scholarship info' do
    workshop = create :summer_workshop, organizer: @program_manager
    enrollment = create :pd_enrollment, :from_user, workshop: workshop
    sign_in @program_manager

    assert_nil enrollment.scholarship_status
    post :update_scholarship_info, params: {enrollment_id: enrollment.id, scholarship_status: Pd::ScholarshipInfoConstants::YES_OTHER}
    assert_response 200
    assert_equal Pd::ScholarshipInfoConstants::YES_OTHER, JSON.parse(@response.body)["scholarship_status"]
    assert_equal Pd::ScholarshipInfoConstants::YES_OTHER, enrollment.scholarship_status
  end

  test 'facilitators cannot update scholarship info' do
    workshop = create :summer_workshop
    enrollment = create :pd_enrollment, :from_user, workshop: workshop
    sign_in workshop.facilitators.first

    assert_nil enrollment.scholarship_status
    post :update_scholarship_info, params: {enrollment_id: enrollment.id, scholarship_status: Pd::ScholarshipInfoConstants::YES_OTHER}
    assert_response 403
    assert_nil enrollment.scholarship_status
  end

  test 'move' do
    origin_workshop = create :pd_workshop, num_sessions: 1, enrolled_and_attending_users: 1,
      enrolled_unattending_users: 1
    attendance = Pd::Attendance.for_workshop(origin_workshop).first
    attendance.update(pd_enrollment_id: origin_workshop.enrollments.first.id)
    destination_workshop = create :pd_workshop

    admin = create :workshop_admin
    sign_in admin

    assert_equal 2, origin_workshop.enrollments.length
    assert_equal 1, Pd::Attendance.for_workshop(origin_workshop).count

    assert_equal 0, destination_workshop.enrollments.length

    post :move, params: {
      destination_workshop_id: destination_workshop.id,
      enrollment_ids: origin_workshop.enrollments.pluck(:id)
    }

    origin_workshop.reload
    destination_workshop.reload

    assert_equal 0, origin_workshop.enrollments.length
    assert_equal 0, Pd::Attendance.for_workshop(origin_workshop).count

    assert_equal 2, destination_workshop.enrollments.length
  end

  test 'edit' do
    workshop = create :summer_workshop
    enrollment = create :pd_enrollment, first_name: 'Rubeus', last_name: 'Hagrid', email: 'rubeushagrid@code.org', workshop: workshop

    admin = create :workshop_admin
    sign_in admin

    post :edit, params: {
      id: enrollment.id,
      first_name: 'Harry',
      last_name: 'Potter',
      email: 'harrypotter@code.org'
    }

    enrollment.reload
    assert_equal 'Harry', enrollment.first_name
    assert_equal 'Potter', enrollment.last_name
    assert_equal 'harrypotter@code.org', enrollment.email
  end

  test 'non-workshop-admins cannot move enrollments' do
    sign_in @program_manager

    post :move, params: {
      destination_workshop_id: @unrelated_workshop.id,
      enrollment_ids: [@enrollment.id]
    }
    assert_response 403
  end

  private def enrollment_test_params(teacher = nil)
    if teacher
      first_name, last_name = teacher.name.split(' ', 2)
      email = teacher.email
    else
      first_name = "Teacher#{SecureRandom.hex(4)}"
      last_name = 'Codeberg'
      email = "#{first_name}@example.net".downcase
    end
    {
      first_name: first_name,
      last_name: last_name,
      email: email,
      email_confirmation: email
    }
  end

  private def school_info_params
    {
      school_type: 'private',
      school_state: 'WA',
      school_name: 'A Seattle private school',
      school_zip: '98102'
    }
  end
end

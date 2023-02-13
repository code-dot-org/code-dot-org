require 'test_helper'

class EnrollmentFormsTest < ActionDispatch::IntegrationTest
  setup do
    @teacher = create :teacher

    @base_params = {
      first_name: "mx",
      last_name: "teacher",
      email: "teacher@test.xx",
      school_info: {school_id: School.first.id},
    }
  end

  test 'can enroll in workshop CSD Summer Workshop' do
    sign_in @teacher
    workshop = create :csd_summer_workshop

    assert_nil Pd::Enrollment.find_by(pd_workshop_id: workshop.id)

    post "/api/v1/pd/workshops/#{workshop.id}/enrollments", params: @base_params

    assert_response :success
    refute_nil Pd::Enrollment.find_by(pd_workshop_id: workshop.id)
  end

  test 'can enroll in workshop Admin/Counselor Workshop' do
    sign_in @teacher
    workshop = create :admin_counselor_workshop

    assert_nil Pd::Enrollment.find_by(pd_workshop_id: workshop.id)

    post "/api/v1/pd/workshops/#{workshop.id}/enrollments", params: {
      role: "Counselor",
      grades_teaching: ["Kindergarten"]
    }.merge(@base_params)

    assert_response :success
    refute_nil Pd::Enrollment.find_by(pd_workshop_id: workshop.id)
  end
end

require "test_helper"

class PotentialTeachersControllerTest < ActionDispatch::IntegrationTest
  test "should create a potential teacher" do
    course_offering = create :course_offering, key: 'course-offering-1', display_name: "Test"
    assert_difference('PotentialTeacher.count', 1) do
      post potential_teachers_url, params: {
        name: 'foosbars',
        email: 'foobar@example.com',
        source_course_offering_id: course_offering.id,
        receives_marketing: true
      }
    end
  end

  test "show returns correct information for a potential teacher" do
    course_offering = create :course_offering, key: 'course-offering-1', display_name: "Test"
    example_potential_teacher = create :potential_teacher, source_course_offering_id: course_offering.id, receives_marketing: true

    get "/potential_teachers/#{example_potential_teacher.id}"

    response_data = JSON.parse(response.body)
    assert_equal example_potential_teacher.name, response_data['name']
    assert_equal example_potential_teacher.email, response_data['email']
    assert_equal example_potential_teacher.source_course_offering_id, response_data['source_course_offering']
    assert_equal example_potential_teacher.receives_marketing, response_data['receives_marketing']
  end
end

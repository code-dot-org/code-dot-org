require "test_helper"

class PotentialTeachersControllerTest < ActionDispatch::IntegrationTest
  test "should create a potential teacher" do
    course_offering = create :course_offering, key: 'course-offering-1', display_name: "Test"
    assert_difference('PotentialTeacher.count', 1) do
      post potential_teachers_url, params: {
        name: 'foosbars',
        email: 'foobar@example.com',
        source_course_offering_id: course_offering.id
      }
    end
  end

  test "should get show for a potential teacher" do
    course_offering = create :course_offering, key: 'course-offering-1', display_name: "Test"
    example_potential_teacher = create :potential_teacher, name: 'foosbars', email: 'foobar@example.com', source_course_offering_id: course_offering.id

    get "/potential_teachers/#{example_potential_teacher.id}"

    response_data = JSON.parse(response.body)
    assert_equal 'foosbars', response_data['name']
    assert_equal 'foobar@example.com', response_data['email']
  end
end

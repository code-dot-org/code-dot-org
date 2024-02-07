require "test_helper"

class PotentialTeachersControllerTest < ActionDispatch::IntegrationTest
  test "should create a potential teacher" do
    script = create :script, name: "test"
    assert_difference('PotentialTeacher.count', 1) do
      post potential_teachers_url, params: {
        name: 'foosbars',
        email: 'foobar@example.com',
        script_id: script.id,
        receives_marketing: true
      }
    end
  end

  test "show returns correct information for a potential teacher" do
    script = create :script, name: "test"
    example_potential_teacher = create :potential_teacher, script_id: script.id

    get "/potential_teachers/#{example_potential_teacher.id}"

    response_data = JSON.parse(response.body)
    assert_equal example_potential_teacher.name, response_data['name']
    assert_equal example_potential_teacher.email, response_data['email']
    assert_equal example_potential_teacher.script_id, response_data['script_id']
    assert_equal example_potential_teacher.receives_marketing, response_data['receives_marketing']
  end
end

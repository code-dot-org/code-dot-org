require "test_helper"

class PotentialTeachersControllerTest < ActionDispatch::IntegrationTest
  test "should create a potential teacher" do
    script = create :script, :in_single_unit_course, name: "test"
    assert_difference('PotentialTeacher.count', 1) do
      post potential_teachers_url, params: {
        name: 'foosbars',
        email: 'foobar@example.com',
        script_id: script.id,
        receives_marketing: true
      }
    end
  end
end

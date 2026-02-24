require 'test_helper'

class SkillsControllerTest < ActionController::TestCase
  setup do
    @controller = SkillsController.new
  end

  # Anonymous, signed-out user cannot create skills,
  # expects redirect to sign in
  test 'no_user_no_access' do
    get :create, params: {
      key: "variables_increment",
      description: "Increment values stored in variables",
      evaluationCriteria: "Does the student's added code increment the values stored in the variables correctly?",
      concept: "variables"
    }
    assert_response :redirect
  end

  test 'student_can_not_create_skills' do
    sign_in(create(:student))
    get :create, params: {
      key: "variables_increment",
      description: "Increment values stored in variables",
      evaluationCriteria: "Does the student's added code increment the values stored in the variables correctly?",
      concept: "variables"
    }
    assert_response :forbidden
  end

  test 'teacher_can_not_create_skills' do
    sign_in(create(:teacher))
    get :create, params: {
      key: "variables_increment",
      description: "Increment values stored in variables",
      evaluationCriteria: "Does the student's added code increment the values stored in the variables correctly?",
      concept: "variables"
    }
    assert_response :forbidden
  end

  test 'levelbuilder_can_create_skills' do
    sign_in(create(:levelbuilder))
    get :create, params: {
      key: "variables_increment",
      description: "Increment values stored in variables",
      evaluationCriteria: "Does the student's added code increment the values stored in the variables correctly?",
      concept: "variables"
    }
    assert_response :created
  end

  class SectionSkillsTest < ActionController::TestCase
    setup do
      @controller = SkillsController.new
      @teacher = create(:teacher)
      @section = create(:section, user: @teacher)
      @unit = create(:unit, name: 'csd-unit1')
    end

    test 'student_cannot_access_section_skills' do
      student = create(:student)
      sign_in(student)
      get :section_skills, params: {
        section_id: @section.id,
        unit_name: @unit.name
      }
      assert_response :forbidden
    end

    test 'teacher_can_access_section_skills_for_their_section' do
      SkillsHelper.stubs(:get_section_skills_data).returns({'student_data' => {}})

      sign_in(@teacher)
      get :section_skills, params: {
        section_id: @section.id,
        unit_name: @unit.name
      }

      assert_response :success
      response_body = JSON.parse(response.body)
      assert_equal 'success', response_body['status']
      assert response_body.key?('skillsData')
      assert response_body.key?('evaluationData')
    end

    test 'teacher_cannot_access_section_skills_for_other_sections' do
      other_teacher = create(:teacher)
      other_section = create(:section, user: other_teacher)
      sign_in(@teacher)
      get :section_skills, params: {
        section_id: other_section.id,
        unit_name: @unit.name
      }

      assert_response :forbidden
    end

    test 'section_skills_returns_not_found_for_invalid_section' do
      sign_in(@teacher)
      get :section_skills, params: {
        section_id: 999999,
        unit_name: @unit.name
      }

      assert_response :not_found
      response_body = JSON.parse(response.body)
      assert_equal 'error', response_body['status']
      assert_equal 'Section not found', response_body['message']
    end
  end
end

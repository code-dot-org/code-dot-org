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
end

require 'test_helper'

class LevelsSkillsControllerTest < ActionController::TestCase
  setup do
    @controller = LevelsSkillsController.new
    @skill = create(:skill)
    @level = create(:level)
  end

  # Anonymous, signed-out user cannot create skills,
  # expects redirect to sign in
  test 'no_user_no_access' do
    get :create, params: {
      skillId: @skill.id,
      levelId: @level.id
    }
    assert_response :redirect
  end

  test 'student_can_not_create_skills' do
    sign_in(create(:student))
    get :create, params: {
      skillId: @skill.id,
      levelId: @level.id
    }
    assert_response :forbidden
  end

  test 'teacher_can_not_create_skills' do
    sign_in(create(:teacher))
    get :create, params: {
      skillId: @skill.id,
      levelId: @level.id
    }
    assert_response :forbidden
  end

  test 'levelbuilder_can_create_skills' do
    sign_in(create(:levelbuilder))
    get :create, params: {
      skillId: @skill.id,
      levelId: @level.id
    }
    assert_response :created
  end
end

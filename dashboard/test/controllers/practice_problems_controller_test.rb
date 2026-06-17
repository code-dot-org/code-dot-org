require 'test_helper'

class PracticeProblemsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @user = create(:student)

    @objective1 = create(:objective)
    @objective2 = create(:objective)

    @problem_with_obj1 = create(:practice_problem)
    @problem_with_obj2 = create(:practice_problem)
    @problem_no_objectives = create(:practice_problem)

    @problem_with_obj1.objectives << @objective1
    @problem_with_obj2.objectives << @objective2
  end

  # --- unauthenticated ---

  test 'index redirects to sign in when not signed in' do
    get :index
    assert_redirected_to_sign_in
  end

  test 'show redirects to sign in when not signed in' do
    get :show, params: {id: @problem_with_obj1.id}
    assert_redirected_to_sign_in
  end

  # --- index ---

  test 'index returns all practice problems when no objective_ids param given' do
    sign_in @user
    get :index
    assert_response :success
    ids = JSON.parse(response.body).map {|p| p['id']}
    assert_includes ids, @problem_with_obj1.id
    assert_includes ids, @problem_with_obj2.id
    assert_includes ids, @problem_no_objectives.id
  end

  test 'index returns only practice problems associated with a single objective_id' do
    sign_in @user
    get :index, params: {objective_ids: [@objective1.id]}
    assert_response :success
    ids = JSON.parse(response.body).map {|p| p['id']}
    assert_includes ids, @problem_with_obj1.id
    refute_includes ids, @problem_with_obj2.id
    refute_includes ids, @problem_no_objectives.id
  end

  test 'index returns practice problems matching any of multiple objective_ids' do
    sign_in @user
    get :index, params: {objective_ids: [@objective1.id, @objective2.id]}
    assert_response :success
    ids = JSON.parse(response.body).map {|p| p['id']}
    assert_includes ids, @problem_with_obj1.id
    assert_includes ids, @problem_with_obj2.id
    refute_includes ids, @problem_no_objectives.id
  end

  test 'index returns each matching practice problem only once when it has multiple matching objectives' do
    sign_in @user
    @problem_with_obj1.objectives << @objective2
    get :index, params: {objective_ids: [@objective1.id, @objective2.id]}
    assert_response :success
    ids = JSON.parse(response.body).map {|p| p['id']}
    assert_equal 1, ids.count(@problem_with_obj1.id)
  end

  test 'index returns empty array when no practice problems match the given objective_ids' do
    sign_in @user
    unassigned_objective = create(:objective)
    get :index, params: {objective_ids: [unassigned_objective.id]}
    assert_response :success
    assert_empty JSON.parse(response.body)
  end

  test 'index response includes objectives with id and description for each practice problem' do
    sign_in @user
    get :index, params: {objective_ids: [@objective1.id]}
    assert_response :success
    problem = JSON.parse(response.body).first
    objective_entry = problem['objectives'].first
    assert_equal @objective1.id, objective_entry['id']
    assert_equal @objective1.description, objective_entry['description']
  end

  # --- show ---

  test 'show returns the practice problem' do
    sign_in @user
    get :show, params: {id: @problem_with_obj1.id}
    assert_response :success
    assert_equal @problem_with_obj1.id, JSON.parse(response.body)['id']
  end

  test 'show response includes objectives with id and description' do
    sign_in @user
    get :show, params: {id: @problem_with_obj1.id}
    assert_response :success
    objective_entry = JSON.parse(response.body)['objectives'].first
    assert_equal @objective1.id, objective_entry['id']
    assert_equal @objective1.description, objective_entry['description']
  end
end

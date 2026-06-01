require 'test_helper'

class PracticeProblemsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @lesson = create(:lesson)
    @other_lesson = create(:lesson)
    @objective = create(:objective, key: 'controller-test-obj', lesson: @lesson)
    @other_objective = create(:objective, key: 'controller-test-other-obj', lesson: @other_lesson)
    @problem = create(:practice_problem, key: 'controller-test-existing')
    @problem.objectives << @objective
  end

  # index and create both require authentication and (for writes) levelbuilder.
  # Index is read-only and only requires a signed-in user; create writes both
  # the DB row and the config file, so it's levelbuilder-gated.

  test_user_gets_response_for :index, params: -> {{lesson_id: 1}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'

  test_user_gets_response_for(
    :create,
    method: :post,
    params: -> {{key: 'gating-test', problem_type: 'multiple_choice_single_select', problem_text: 'q?', solution: [{option: 'a', correct: true}], active: false, objective_keys: ['controller-test-obj']}},
    user: nil,
    response: :redirect,
    redirected_to: '/users/sign_in',
  )
  test_user_gets_response_for(
    :create,
    method: :post,
    params: -> {{key: 'gating-test', problem_type: 'multiple_choice_single_select', problem_text: 'q?', solution: [{option: 'a', correct: true}], active: false, objective_keys: ['controller-test-obj']}},
    user: :student,
    response: :forbidden,
  )
  test_user_gets_response_for(
    :create,
    method: :post,
    params: -> {{key: 'gating-test', problem_type: 'multiple_choice_single_select', problem_text: 'q?', solution: [{option: 'a', correct: true}], active: false, objective_keys: ['controller-test-obj']}},
    user: :teacher,
    response: :forbidden,
  )
  test_user_gets_response_for(
    :create,
    method: :post,
    params: -> {{key: 'gating-test-lb', problem_type: 'multiple_choice_single_select', problem_text: 'q?', solution: [{option: 'a', correct: true}], active: false, objective_keys: ['controller-test-obj']}},
    user: :levelbuilder,
    response: :success,
  )

  test 'index returns only problems associated with the given lesson' do
    sign_in create(:student)
    other_problem = create(:practice_problem, key: 'index-test-other')
    other_problem.objectives << @other_objective

    get :index, params: {lesson_id: @lesson.id}
    assert_response :success

    results = JSON.parse(response.body)
    keys = results.map {|r| r['key']}
    assert_includes keys, @problem.key
    refute_includes keys, other_problem.key
  end

  test 'index returns objective_keys for each problem' do
    sign_in create(:student)
    get :index, params: {lesson_id: @lesson.id}
    assert_response :success

    results = JSON.parse(response.body)
    target = results.find {|r| r['key'] == @problem.key}
    assert_equal [@objective.key], target['objective_keys']
  end

  test 'index requires lesson_id' do
    sign_in create(:student)
    assert_raises ActionController::ParameterMissing do
      get :index
    end
  end

  test 'create persists a problem and links it to its objectives' do
    sign_in create(:levelbuilder)
    PracticeProblem.any_instance.stubs(:write_serialization)

    post :create, params: {
      key: 'created-problem',
      problem_type: 'multiple_choice_single_select',
      problem_text: 'What is 2+2?',
      solution: [{option: '4', correct: true}, {option: '5', correct: false}],
      active: true,
      objective_keys: [@objective.key],
    }
    assert_response :ok

    problem = PracticeProblem.find_by!(key: 'created-problem')
    assert_equal 'multiple_choice_single_select', problem.problem_type
    assert_equal 'What is 2+2?', problem.problem_text
    assert_equal [@objective], problem.objectives.to_a
    assert_equal true, problem.active

    data = JSON.parse(response.body)
    assert_equal problem.id, data['id']
    assert_equal 'created-problem', data['key']
    assert_equal [@objective.key], data['objective_keys']
  end

  test 'create returns 400 for an invalid problem' do
    sign_in create(:levelbuilder)

    post :create, params: {key: '', problem_type: 'not_a_real_type', problem_text: '', solution: []}
    assert_response :bad_request
  end

  test 'create returns 400 for a duplicate key' do
    sign_in create(:levelbuilder)

    post :create, params: {
      key: @problem.key,
      problem_type: 'multiple_choice_single_select',
      problem_text: 'duplicate',
      solution: [{option: 'a', correct: true}],
      active: false,
    }
    assert_response :bad_request
  end

  test 'create invokes write_serialization to persist the config file' do
    sign_in create(:levelbuilder)
    PracticeProblem.any_instance.expects(:write_serialization).once

    post :create, params: {
      key: 'write-trigger',
      problem_type: 'multiple_choice_single_select',
      problem_text: 'q?',
      solution: [{option: 'a', correct: true}],
      active: false,
      objective_keys: [@objective.key],
    }
    assert_response :ok
  end

  test 'create rolls back when write_serialization raises' do
    sign_in create(:levelbuilder)
    PracticeProblem.any_instance.stubs(:write_serialization).raises(RuntimeError, 'disk full')

    assert_raises RuntimeError do
      post :create, params: {
        key: 'rollback-test',
        problem_type: 'multiple_choice_single_select',
        problem_text: 'q?',
        solution: [{option: 'a', correct: true}],
        active: false,
        objective_keys: [@objective.key],
      }
    end

    refute PracticeProblem.exists?(key: 'rollback-test'),
      'transaction should have rolled back the DB row when the file write failed'
  end
end

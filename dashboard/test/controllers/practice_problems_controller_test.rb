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

  # --- create / update / destroy / generate are levelbuilder-only ---

  test_user_gets_response_for :create, method: :post, params: -> {{problem_type: 'match', problem_text: 'x', solution: []}}, user: :student, response: :forbidden
  test_user_gets_response_for :create, method: :post, params: -> {{problem_type: 'match', problem_text: 'x', solution: []}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :generate, method: :post, params: -> {{lesson_id: 1}}, user: :student, response: :forbidden

  # --- generate ---

  test 'generate returns candidate problems from the generator' do
    sign_in create(:levelbuilder)
    lesson = create(:lesson)
    candidates = [
      {problemType: 'match', problemText: 'Q', solution: [{option: 'a', correct: 'b'}], objectiveIds: []},
    ]
    PracticeProblemGenerator.expects(:generate).with(lesson: lesson, count: 5).returns(candidates)

    post :generate, params: {lesson_id: lesson.id, count: 5}
    assert_response :ok
    assert_equal 'Q', JSON.parse(response.body).first['problemText']
  end

  test 'generate returns 502 when generation fails' do
    sign_in create(:levelbuilder)
    lesson = create(:lesson)
    PracticeProblemGenerator.stubs(:generate).raises(PracticeProblemGenerator::OpenaiError.new('boom'))

    post :generate, params: {lesson_id: lesson.id}
    assert_response :bad_gateway
  end

  test 'generate returns 404 for an unknown lesson' do
    sign_in create(:levelbuilder)
    post :generate, params: {lesson_id: 0}
    assert_response :not_found
  end

  test 'create persists a problem, associates lesson objectives, and returns the summary' do
    sign_in create(:levelbuilder)
    lesson = create(:lesson)
    objective = create(:objective, lesson: lesson)

    post :create, params: {
      problem_type: 'multiple_choice_single_select',
      problem_text: 'Which is a loop?',
      active: true,
      solution: [{option: 'for', correct: true}, {option: 'if', correct: false}],
      lesson_id: lesson.id,
      objective_ids: [objective.id],
    }
    assert_response :ok

    data = JSON.parse(response.body)
    problem = PracticeProblem.find(data['id'])
    assert_equal 'multiple_choice_single_select', problem.problem_type
    assert_equal 'Which is a loop?', problem.problem_text
    assert_includes problem.objectives, objective
    assert data['key'].present?, 'key should be auto-generated'
    assert_equal [objective.id], data['objectiveIds']
  end

  test 'create returns 400 for an invalid problem' do
    sign_in create(:levelbuilder)
    post :create, params: {problem_type: 'not_a_type', problem_text: '', solution: []}
    assert_response :bad_request
  end

  test 'update edits fields and preserves objectives from other lessons' do
    sign_in create(:levelbuilder)
    lesson_a = create(:lesson)
    lesson_b = create(:lesson)
    obj_a = create(:objective, lesson: lesson_a)
    obj_b = create(:objective, lesson: lesson_b)
    problem = create(:practice_problem)
    problem.objectives = [obj_a, obj_b]

    # Editing from lesson_b, clearing its objective, must not touch lesson_a.
    # The client sends a lone empty-string marker for an empty selection since
    # Rails drops a truly-empty array param.
    patch :update, params: {
      id: problem.id,
      problem_text: 'edited',
      lesson_id: lesson_b.id,
      objective_ids: [''],
    }
    assert_response :ok

    problem.reload
    assert_equal 'edited', problem.problem_text
    assert_includes problem.objectives, obj_a
    refute_includes problem.objectives, obj_b
  end

  test 'update returns 404 for an unknown id' do
    sign_in create(:levelbuilder)
    patch :update, params: {id: 0, problem_text: 'x'}
    assert_response :not_found
  end

  test 'destroy detaches only this lesson objectives when used elsewhere' do
    sign_in create(:levelbuilder)
    lesson_a = create(:lesson)
    lesson_b = create(:lesson)
    obj_a = create(:objective, lesson: lesson_a)
    obj_b = create(:objective, lesson: lesson_b)
    problem = create(:practice_problem)
    problem.objectives = [obj_a, obj_b]

    delete :destroy, params: {id: problem.id, lesson_id: lesson_a.id}
    assert_response :ok

    assert_equal false, JSON.parse(response.body)['deleted']
    problem.reload
    refute_includes problem.objectives, obj_a
    assert_includes problem.objectives, obj_b
  end

  test 'destroy deletes the problem entirely once orphaned' do
    sign_in create(:levelbuilder)
    lesson = create(:lesson)
    objective = create(:objective, lesson: lesson)
    problem = create(:practice_problem)
    problem.objectives = [objective]

    delete :destroy, params: {id: problem.id, lesson_id: lesson.id}
    assert_response :ok

    assert_equal true, JSON.parse(response.body)['deleted']
    assert_nil PracticeProblem.find_by(id: problem.id)
  end
end

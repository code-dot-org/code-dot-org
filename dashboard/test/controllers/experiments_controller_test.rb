require 'test_helper'

class ExperimentsControllerTest < ActionController::TestCase
  setup_all do
    @pilot = create(:pilot, allow_joining_via_url: true)
    @pilot_name = @pilot.name
  end

  setup do
    @teacher = create(:teacher)
    unit_group = create(:unit_group, name: 'my-course')
    default_script = create(:script, name: 'default-script')
    create(:unit_group_unit, unit_group: unit_group, script: default_script, position: 2)
  end

  test_redirect_to_sign_in_for(:index)

  test 'index lists experiments the user opted into' do
    sign_in(@teacher)
    SingleUserExperiment.create!(min_user_id: @teacher.id, name: @pilot_name)
    SingleUserExperiment.create!(min_user_id: @teacher.id + 1, name: 'someone-elses-experiment')
    SingleUserExperiment.create!(min_user_id: @teacher.id, name: 'ended-experiment', end_at: 1.day.ago)
    # covers 100% of users, but is not an opt-in, so it must not be listed
    UserBasedExperiment.create!(name: 'everyone-percentage', percentage: 100)

    get :index
    assert_response :success
    experiments = assigns(:user_experiments)
    assert_equal [@pilot_name], experiments.pluck(:name)
    assert experiments.first[:canLeave]
  end

  test 'index marks experiments without a joinable pilot as not leavable' do
    sign_in(@teacher)
    SingleUserExperiment.create!(min_user_id: @teacher.id, name: 'not-a-pilot')

    get :index
    assert_response :success
    experiments = assigns(:user_experiments)
    assert_equal ['not-a-pilot'], experiments.pluck(:name)
    refute experiments.first[:canLeave]
  end

  test 'leave removes the current user from the experiment' do
    sign_in(@teacher)
    SingleUserExperiment.create!(min_user_id: @teacher.id, name: @pilot_name)

    post :leave, params: {experiment_name: @pilot_name}
    assert_response :no_content
    assert_empty SingleUserExperiment.where(min_user_id: @teacher.id, name: @pilot_name)
  end

  test 'leave returns not_found when the user is not in the experiment' do
    sign_in(@teacher)

    post :leave, params: {experiment_name: @pilot_name}
    assert_response :not_found
  end

  test 'leave returns forbidden for experiments not joinable via url' do
    sign_in(@teacher)
    SingleUserExperiment.create!(min_user_id: @teacher.id, name: 'not-a-pilot')

    post :leave, params: {experiment_name: 'not-a-pilot'}
    assert_response :forbidden
    refute_empty SingleUserExperiment.where(min_user_id: @teacher.id, name: 'not-a-pilot')
  end

  test 'leave does not remove other users from the experiment' do
    sign_in(@teacher)
    SingleUserExperiment.create!(min_user_id: @teacher.id, name: @pilot_name)
    SingleUserExperiment.create!(min_user_id: @teacher.id + 1, name: @pilot_name)

    post :leave, params: {experiment_name: @pilot_name}
    assert_response :no_content
    assert_equal [@teacher.id + 1], SingleUserExperiment.where(name: @pilot_name).pluck(:min_user_id)
  end

  test_redirect_to_sign_in_for(
    :set_single_user_experiment,
    params: -> {{experiment_name: @pilot_name}}
  )

  test_user_gets_response_for(
    :set_single_user_experiment,
    name: 'single user can set valid experiment name',
    response: :redirect,
    user: :teacher,
    params: -> {{experiment_name: @pilot_name}}
  ) do
    assert_nil flash[:alert]
    assert_includes flash[:notice], "You have successfully joined the experiment"
    assert SingleUserExperiment.where(
      name: @pilot_name,
      min_user_id: @teacher.id,
      start_at: nil,
      end_at: nil
    )
  end

  test_user_gets_response_for(
    :set_single_user_experiment,
    name: 'single user cannot set invalid experiment name',
    response: :redirect,
    user: :teacher,
    params: -> {{experiment_name: 'invalid-experiment-name'}}
  ) do
    assert_includes flash[:alert], "not a valid experiment"
    assert_nil flash[:notice]
    assert_nil Experiment.first
  end

  test_redirect_to_sign_in_for(
    :disable_single_user_experiment,
    params: -> {{experiment_name: @pilot_name}}
  )

  test_user_gets_response_for(
    :disable_single_user_experiment,
    name: 'single user cannot disable experiment they are not in',
    response: :redirect,
    user: :teacher,
    params: -> {{experiment_name: 'invalid-experiment-name'}}
  ) do
    assert_includes flash[:alert], "not a valid experiment"
    assert_nil flash[:notice]
    assert_nil Experiment.first
  end

  test 'user can disable an experiment user is in' do
    student = create(:user)
    sign_in(student)
    SingleUserExperiment.create(min_user_id: student.id, name: @pilot_name)

    get :disable_single_user_experiment, params: {experiment_name: @pilot_name}
    assert_response :redirect
    assert_nil flash[:alert]
    assert_includes flash[:notice], "You have successfully disabled the experiment"
    assert_nil Experiment.first
  end

  test 'user can not join an experiment user is already in' do
    sign_in(@teacher)
    experiment = SingleUserExperiment.create(min_user_id: @teacher.id, name: @pilot_name)

    get :set_single_user_experiment, params: {experiment_name: @pilot_name}
    assert_response :redirect
    assert_nil flash[:notice]
    assert_includes flash[:alert], "Already enabled in experiment"
    assert_equal 1, SingleUserExperiment.where(name: @pilot_name, min_user_id: @teacher.id).count

    experiment.destroy
  end

  test_user_gets_response_for(
    :set_single_user_experiment,
    name: 'teacher cannot join experiment where allow_joining_via_url is false',
    response: :redirect,
    user: :teacher,
    params: -> {{experiment_name: create(:pilot, allow_joining_via_url: false).name}}
  ) do
    assert_includes flash[:alert], "is not a valid experiment"
    assert_nil flash[:notice]
    assert_nil Experiment.first
  end

  test_user_gets_response_for(
    :set_single_user_experiment,
    name: 'teacher can join experiment where allow_joining_via_url is true',
    response: :redirect,
    user: -> {@teacher},
    params: -> {{experiment_name: @pilot_name}}
  ) do
    assert_nil flash[:alert]
    assert_includes flash[:notice], "success"
    assert Experiment.find_by(min_user_id: @teacher.id, name: @pilot_name)
  end
end

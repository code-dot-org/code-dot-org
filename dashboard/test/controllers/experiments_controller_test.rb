require 'test_helper'

class ExperimentsControllerTest < ActionController::TestCase
  setup do
    @teacher = create :teacher
    @experiment_name = 'my-experiment'
    unit_group = create :unit_group, name: 'my-course'
    default_script = create(:script, name: 'default-script')
    alternate_script = create(:script, name: 'alternate-script')

    create :unit_group_unit, unit_group: unit_group, script: default_script, position: 2
    create :unit_group_unit,
      unit_group: unit_group,
      script: alternate_script,
      position: 2,
      default_script: default_script,
      experiment_name: @experiment_name
  end

  test_redirect_to_sign_in_for(
    :set_course_experiment,
    params: -> {{experiment_name: @experiment_name}}
  )

  test_user_gets_response_for(
    :set_course_experiment,
    name: "student cannot set course experiment",
    response: :redirect,
    user: :student,
    # use proc syntax so we can pass in @experiment_name
    params: -> {{experiment_name: @experiment_name}}
  ) do
    assert_equal flash[:alert], "Only teachers may join course experiments."
    assert_nil flash[:notice]
    assert_nil Experiment.first
  end

  test_user_gets_response_for(
    :set_course_experiment,
    name: 'teacher can set valid experiment name',
    response: :redirect,
    user: -> {@teacher},
    params: -> {{experiment_name: @experiment_name}}
  ) do
    assert_nil flash[:alert]
    assert_includes flash[:notice], "success"
    assert Experiment.find_by(min_user_id: @teacher.id, name: @experiment_name)
  end

  test_user_gets_response_for(
    :set_course_experiment,
    name: 'teacher cannot set invalid experiment name',
    response: :redirect,
    user: :teacher,
    params: -> {{experiment_name: 'invalid-experiment-name'}}
  ) do
    assert_includes flash[:alert], "Unknown experiment name"
    assert_nil flash[:notice]
    assert_nil Experiment.first
  end

  test_redirect_to_sign_in_for(
    :set_single_user_experiment,
    params: -> {{experiment_name: @experiment_name}}
  )

  test_user_gets_response_for(
    :set_single_user_experiment,
    name: 'single user can set valid experiment name',
    response: :redirect,
    user: :teacher,
    params: -> {{experiment_name: '2018-teacher-experience'}}
  ) do
    assert_nil flash[:alert]
    assert_includes flash[:notice], "You have successfully joined the experiment"
    assert SingleUserExperiment.where(
      name: "2018-teacher-experience",
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
    params: -> {{experiment_name: @experiment_name}}
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
    student = create :user
    sign_in(student)
    SingleUserExperiment.create(min_user_id: student.id, name: '2018-teacher-experience')

    get :disable_single_user_experiment, params: {experiment_name: '2018-teacher-experience'}
    assert_response :redirect
    assert_nil flash[:alert]
    assert_includes flash[:notice], "You have successfully disabled the experiment"
    assert_nil Experiment.first
  end

  test 'user can not join an experiment user is already in' do
    sign_in(@teacher)
    experiment = SingleUserExperiment.create(min_user_id: @teacher.id, name: '2018-teacher-experience')

    get :set_single_user_experiment, params: {experiment_name: '2018-teacher-experience'}
    assert_response :redirect
    assert_nil flash[:notice]
    assert_includes flash[:alert], "Already enabled in experiment"
    assert_equal 1, SingleUserExperiment.where(name: "2018-teacher-experience", min_user_id: @teacher.id).count

    experiment.destroy
  end

  test_user_gets_response_for(
    :set_single_user_experiment,
    name: 'teacher cannot join experiment where allow_joining_via_url is false',
    response: :redirect,
    user: :teacher,
    params: -> {{experiment_name: Experiment::PILOT_EXPERIMENTS.find {|p| !p[:allow_joining_via_url]}[:name]}}
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
    params: -> {{experiment_name: Experiment::PILOT_EXPERIMENTS.find {|p| p[:allow_joining_via_url]}[:name]}}
  ) do
    assert_nil flash[:alert]
    assert_includes flash[:notice], "success"
    assert Experiment.find_by(min_user_id: @teacher.id, name: Experiment::PILOT_EXPERIMENTS.find {|p| p[:allow_joining_via_url]}[:name])
  end
end

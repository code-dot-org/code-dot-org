require 'test_helper'

class ExperimentsControllerTest < ActionController::TestCase
  setup do
    @teacher = create :teacher
    @experiment_name = 'my-experiment'
    course = create :course, name: 'my-course'
    default_script = create(:script, name: 'default-script')
    alternate_script = create(:script, name: 'alternate-script')

    create :course_script, course: course, script: default_script, position: 2
    create :course_script,
      course: course,
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
    assert SingleUserExperiment.where(name: "2018-teacher-experience", min_user_id: @teacher.id)
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
    name: 'single user cannot set disable experiment they are not in',
    response: :redirect,
    user: :teacher,
    params: -> {{experiment_name: 'invalid-experiment-name'}}
  ) do
    assert_includes flash[:alert], "You are not in the 'invalid-experiment-name' experiment."
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
end

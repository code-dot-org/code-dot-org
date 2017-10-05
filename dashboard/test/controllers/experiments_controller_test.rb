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
end

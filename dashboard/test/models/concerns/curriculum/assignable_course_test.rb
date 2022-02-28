require 'test_helper'

class AssignableCourseTests < ActiveSupport::TestCase
  setup_all do
    @teacher = create :teacher
    @levelbuilder = create :levelbuilder
  end

  test 'course_assignable? is true if item is launched' do
    launched_course = create(:script, published_state: 'stable')
    assert launched_course.course_assignable?(@teacher)
  end

  test 'course_assignable? is false if published state is beta' do
    beta_course = create(:script, published_state: 'beta')
    refute beta_course.course_assignable?(@teacher)
  end

  test 'course_assignable? is false if can not be instructor of course' do
    pl_course = create :script, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher

    refute pl_course.course_assignable?(@teacher)
  end

  test 'course_assignable? is true if user has pilot access to item' do
    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    pilot_course = create :script, pilot_experiment: 'my-experiment'

    assert pilot_course.course_assignable?(pilot_teacher)
  end

  test 'course_assignable? is false if user does not have pilot access to item' do
    pilot_course = create :script, pilot_experiment: 'my-experiment'

    refute pilot_course.course_assignable?(@teacher)
  end

  test 'course_assignable? if levelbuilder and item is in development' do
    in_development_course = create(:script, published_state: 'in_development')
    assert in_development_course.course_assignable?(@levelbuilder)
  end

  test 'course_assignable? is false if not a levelbuilder and item is in development' do
    in_development_course = create(:script, published_state: 'in_development')
    refute in_development_course.course_assignable?(@teacher)
  end
end

require 'test_helper'

class AssignableCourseTests < ActiveSupport::TestCase
  setup_all do
    @teacher = create(:teacher)
    @levelbuilder = create(:levelbuilder)
  end

  test 'course_assignable? is true if item is launched' do
    launched_course = create(:course_version, :with_single_unit_course).content_root
    launched_course.update!(published_state: 'stable')
    assert launched_course.course_assignable?(@teacher)
  end

  test 'course_assignable? is false if published state is beta' do
    beta_course = create(:course_version, :with_single_unit_course).content_root
    beta_course.update!(published_state: 'beta')
    refute beta_course.course_assignable?(@teacher)
  end

  test 'course_assignable? is false if can not be instructor of course' do
    pl_course = create(:course_version, :with_single_unit_course).content_root
    pl_course.update!(instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)

    refute pl_course.course_assignable?(@teacher)
  end

  test 'course_assignable? is true if user has pilot access to item' do
    pilot_teacher = create(:teacher, pilot_experiment: 'my-experiment')
    pilot_course = create(:course_version, :with_single_unit_course).content_root
    pilot_course.update!(pilot_experiment: 'my-experiment')

    assert pilot_course.course_assignable?(pilot_teacher)
  end

  test 'course_assignable? is false if user does not have pilot access to item' do
    pilot_course = create(:course_version, :with_single_unit_course).content_root
    pilot_course.update!(pilot_experiment: 'my-experiment')

    refute pilot_course.course_assignable?(@teacher)
  end

  test 'course_assignable? if levelbuilder and item is in development' do
    in_development_course = create(:course_version, :with_single_unit_course).content_root
    in_development_course.update!(published_state: 'in_development')
    assert in_development_course.course_assignable?(@levelbuilder)
  end

  test 'course_assignable? is false if not a levelbuilder and item is in development' do
    in_development_course = create(:course_version, :with_single_unit_course).content_root
    in_development_course.update!(published_state: 'in_development')
    refute in_development_course.course_assignable?(@teacher)
  end

  test 'course_assignable? if levelbuilder and item is beta' do
    in_development_course = create(:course_version, :with_single_unit_course).content_root
    in_development_course.update!(published_state: 'beta')
    assert in_development_course.course_assignable?(@levelbuilder)
  end

  test 'course_assignable? is false if not a levelbuilder and item is beta' do
    in_development_course = create(:course_version, :with_single_unit_course).content_root
    in_development_course.update!(published_state: 'in_development')
    refute in_development_course.course_assignable?(@teacher)
  end

  test 'course_assignable? is false if published state is sunsetting' do
    sunsetting_course = create(:course_version, :with_single_unit_course).content_root
    sunsetting_course.update!(published_state: 'sunsetting')
    refute sunsetting_course.course_assignable?(@teacher)
  end

  test 'course_progress_viewable? is true if published state is sunsetting' do
    sunsetting_course = create(:course_version, :with_single_unit_course).content_root
    sunsetting_course.update!(published_state: 'sunsetting')
    assert sunsetting_course.course_progress_viewable?(@teacher)
  end

  test 'course_progress_viewable? is true if item is launched' do
    launched_course = create(:course_version, :with_single_unit_course).content_root
    launched_course.update!(published_state: 'stable')
    assert launched_course.course_progress_viewable?(@teacher)
  end

  test 'course_progress_viewable? is false if published state is beta' do
    beta_course = create(:course_version, :with_single_unit_course).content_root
    beta_course.update!(published_state: 'beta')
    refute beta_course.course_progress_viewable?(@teacher)
  end

  test 'course_progress_viewable? is false if sunsetting and can not be instructor of course' do
    sunsetting_pl_course = create(:course_version, :with_single_unit_course).content_root
    sunsetting_pl_course.update!(
      published_state: 'sunsetting',
      instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator,
      participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    )

    refute sunsetting_pl_course.course_progress_viewable?(@teacher)
  end

  test 'course_progress_viewable? is false if sunsetting and the course offering is not assignable' do
    sunsetting_course = create(:course_version, :with_single_unit_course).content_root
    sunsetting_course.update!(published_state: 'sunsetting')
    sunsetting_course.get_course_version.course_offering.update!(assignable: false)

    refute sunsetting_course.course_progress_viewable?(@teacher)
  end
end

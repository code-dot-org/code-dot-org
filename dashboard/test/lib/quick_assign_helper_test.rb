require 'test_helper'

class QuickAssignHelperTest < ActionController::TestCase
  setup do
    # remove any test fixtures
    CourseOffering.destroy_all
  end

  test 'returns course offerings by grade level' do
    elementary_course_version = create :course_version
    elementary_course_version.content_root.update!(published_state: 'stable')
    elementary_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    middle_course_version = create :course_version
    middle_course_version.content_root.update!(published_state: 'stable')
    middle_course_version.course_offering.update!(grade_levels: '7,8', curriculum_type: 'Course', header: 'Test')

    high_course_version = create :course_version
    high_course_version.content_root.update!(published_state: 'stable')
    high_course_version.course_offering.update!(grade_levels: '11', curriculum_type: 'Course', header: 'Test')

    teacher = create :teacher
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale, 'student')

    refute course_offerings[:elementary].blank?
    refute course_offerings[:middle].blank?
    refute course_offerings[:high].blank?
  end

  test 'returns HoC course offerings' do
    elementary_course_version = create :course_version
    elementary_course_version.content_root.update!(published_state: 'stable')
    elementary_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    hoc_course_version = create :course_version
    hoc_course_version.content_root.update!(published_state: 'stable')
    hoc_course_version.course_offering.update!(marketing_initiative: 'HOC', header: 'HoC Test')

    teacher = create :teacher
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale, 'student')

    refute course_offerings[:elementary].blank?
    assert course_offerings[:middle].blank?
    assert course_offerings[:high].blank?
    refute course_offerings[:hoc].blank?
  end

  test 'returns PL course offerings when participant type is teacher' do
    elementary_course_version = create :course_version
    elementary_course_version.content_root.update!(published_state: 'stable')
    elementary_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    hoc_course_version = create :course_version
    hoc_course_version.content_root.update!(published_state: 'stable')
    hoc_course_version.course_offering.update!(marketing_initiative: 'HOC', header: 'HoC Test')

    pl_for_teachers_course_version = create :course_version
    pl_for_teachers_course_version.content_root.update!(published_state: 'stable', instructor_audience: 'facilitator', participant_audience: 'teacher')
    pl_for_teachers_course_version.course_offering.update!(header: 'PL Test')

    pl_for_facilitators_course_version = create :course_version
    pl_for_facilitators_course_version.content_root.update!(published_state: 'stable', instructor_audience: 'universal_instructor', participant_audience: 'facilitator')
    pl_for_facilitators_course_version.course_offering.update!(header: 'PL Test')

    teacher = create :facilitator
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale, 'teacher')

    refute course_offerings[:elementary].blank?
    assert course_offerings[:middle].blank?
    assert course_offerings[:high].blank?
    refute course_offerings[:hoc].blank?
    refute course_offerings[:pl].blank?
    assert_equal 1, course_offerings[:pl]['PL Test'].length
  end

  test 'returns PL course offerings when participant type is facilitator' do
    elementary_course_version = create :course_version
    elementary_course_version.content_root.update!(published_state: 'stable')
    elementary_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    hoc_course_version = create :course_version
    hoc_course_version.content_root.update!(published_state: 'stable')
    hoc_course_version.course_offering.update!(marketing_initiative: 'HOC', header: 'HoC Test')

    pl_for_teachers_course_version = create :course_version
    pl_for_teachers_course_version.content_root.update!(published_state: 'stable', instructor_audience: 'facilitator', participant_audience: 'teacher')
    pl_for_teachers_course_version.course_offering.update!(header: 'PL Test')

    pl_for_facilitators_course_version = create :course_version
    pl_for_facilitators_course_version.content_root.update!(published_state: 'stable', instructor_audience: 'universal_instructor', participant_audience: 'facilitator')
    pl_for_facilitators_course_version.course_offering.update!(header: 'PL Test')

    teacher = create :universal_instructor
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale, 'facilitator')

    refute course_offerings[:elementary].blank?
    assert course_offerings[:middle].blank?
    assert course_offerings[:high].blank?
    refute course_offerings[:hoc].blank?
    refute course_offerings[:pl].blank?
    assert_equal 2, course_offerings[:pl]['PL Test'].length
  end

  test 'only returns assignable course offerings' do
    assignable_course_version = create :course_version
    assignable_course_version.content_root.update!(published_state: 'stable')
    assignable_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    unassignable_course_version = create :course_version
    unassignable_course_version.content_root.update!(published_state: 'stable')
    unassignable_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test', assignable: false)

    teacher = create :teacher
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale, 'student')

    refute course_offerings[:elementary].blank?
    assert_equal 1, course_offerings[:elementary]['Course']['Test'].length
  end

  test 'grade level offerings are grouped by curriculum type and header' do
    course_offering1 = create :course_offering, curriculum_type: 'Course', header: 'Header 2'
    course_offering2 = create :course_offering, curriculum_type: 'Course', header: 'Header 1'
    course_offering3 = create :course_offering, curriculum_type: 'Standalone Unit', header: 'Header 1'
    # course_offering4 and course_offering5 should be grouped together, with course_offering5 being first in the resulting list.
    course_offering4 = create :course_offering, curriculum_type: 'Standalone Unit', header: 'Header 2', display_name: 'Z'
    course_offering5 = create :course_offering, curriculum_type: 'Standalone Unit', header: 'Header 2', display_name: 'B'

    teacher = create :teacher
    grouped_offerings = QuickAssignHelper.group_grade_level_offerings([course_offering1, course_offering2, course_offering3, course_offering4, course_offering5], teacher, I18n.default_locale)

    assert_equal 1, grouped_offerings['Course']['Header 2'].length
    assert_equal course_offering2.id, grouped_offerings['Course']['Header 1'][0][:id]
    assert_equal 1, grouped_offerings['Course']['Header 1'].length
    assert_equal course_offering1.id, grouped_offerings['Course']['Header 2'][0][:id]
    assert_equal 1, grouped_offerings['Standalone Unit']['Header 1'].length
    assert_equal course_offering3.id, grouped_offerings['Standalone Unit']['Header 1'][0][:id]
    assert_equal 2, grouped_offerings['Standalone Unit']['Header 2'].length
    assert_equal course_offering5.id, grouped_offerings['Standalone Unit']['Header 2'][0][:id]
    assert_equal course_offering4.id, grouped_offerings['Standalone Unit']['Header 2'][1][:id]

    assert_equal ['Header 1', 'Header 2'], grouped_offerings['Course'].keys
  end

  test 'HoC course offerings are grouped by header' do
    course_offering1 = create :course_offering, marketing_initiative: 'HOC', header: 'A Header'
    course_offering2 = create :course_offering, marketing_initiative: 'HOC', header: 'B Header', display_name: 'Z'
    course_offering3 = create :course_offering, marketing_initiative: 'HOC', header: 'B Header', display_name: 'A'
    favorite_course_offering = create :course_offering, marketing_initiative: 'HOC', header: 'Favorites'

    teacher = create :teacher
    grouped_offerings = QuickAssignHelper.group_hoc_and_pl_offerings([course_offering1, course_offering2, course_offering3, favorite_course_offering], teacher, I18n.default_locale)

    assert_equal 1, grouped_offerings['A Header'].length
    assert_equal course_offering1.id, grouped_offerings['A Header'][0][:id]
    assert_equal 2, grouped_offerings['B Header'].length
    assert_equal course_offering3.id, grouped_offerings['B Header'][0][:id]
    assert_equal course_offering2.id, grouped_offerings['B Header'][1][:id]
    assert_equal 1, grouped_offerings['Favorites'].length
    assert_equal favorite_course_offering.id, grouped_offerings['Favorites'][0][:id]

    assert_equal ['Favorites', 'A Header', 'B Header'], grouped_offerings.keys
  end
end

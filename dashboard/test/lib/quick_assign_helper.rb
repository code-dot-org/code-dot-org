require 'test_helper'

class QuickAssignHelperTest < ActionController::TestCase
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
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale)

    refute course_offerings[:elementary].blank?
    refute course_offerings[:middle].blank?
    refute course_offerings[:high].blank?
  end

  test 'only returns assignable course offerings' do
    assignable_course_version = create :course_version
    assignable_course_version.content_root.update!(published_state: 'stable')
    assignable_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    unassignable_course_version = create :course_version
    unassignable_course_version.content_root.update!(published_state: 'stable')
    unassignable_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test', assignable: false)

    teacher = create :teacher
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale)

    refute course_offerings[:elementary].blank?
    assert_equal 1, course_offerings[:elementary]['Course']['Test'].length
  end

  test 'offerings are grouped by curriculum type and header' do
    course_offering1 = create :course_offering, curriculum_type: 'Course', header: 'Header 1'
    course_offering2 = create :course_offering, curriculum_type: 'Course', header: 'Header 2'
    course_offering3 = create :course_offering, curriculum_type: 'Standalone Unit', header: 'Header 1'
    # course_offering4 and course_offering5 should be grouped together, with course_offering5 being first in the resulting list.
    course_offering4 = create :course_offering, curriculum_type: 'Standalone Unit', header: 'Header 2', display_name: 'Z'
    course_offering5 = create :course_offering, curriculum_type: 'Standalone Unit', header: 'Header 2', display_name: 'B'

    teacher = create :teacher
    grouped_offerings = QuickAssignHelper.group_offerings([course_offering1, course_offering2, course_offering3, course_offering4, course_offering5], teacher, I18n.default_locale)

    assert_equal 1, grouped_offerings['Course']['Header 1'].length
    assert_equal course_offering1.id, grouped_offerings['Course']['Header 1'][0][:id]
    assert_equal 1, grouped_offerings['Course']['Header 2'].length
    assert_equal course_offering2.id, grouped_offerings['Course']['Header 2'][0][:id]
    assert_equal 1, grouped_offerings['Standalone Unit']['Header 1'].length
    assert_equal course_offering3.id, grouped_offerings['Standalone Unit']['Header 1'][0][:id]
    assert_equal 2, grouped_offerings['Standalone Unit']['Header 2'].length
    assert_equal course_offering5.id, grouped_offerings['Standalone Unit']['Header 2'][0][:id]
    assert_equal course_offering4.id, grouped_offerings['Standalone Unit']['Header 2'][1][:id]
  end
end

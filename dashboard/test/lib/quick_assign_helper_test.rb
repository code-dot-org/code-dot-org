require 'test_helper'

class QuickAssignHelperTest < ActionController::TestCase
  setup do
    # remove any test fixtures
    CourseOffering.destroy_all
  end

  test 'returns course offerings by grade level' do
    elementary_course_version = create(:course_version)
    elementary_course_version.content_root.update!(published_state: 'stable')
    elementary_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    middle_course_version = create(:course_version)
    middle_course_version.content_root.update!(published_state: 'stable')
    middle_course_version.course_offering.update!(grade_levels: '7,8', curriculum_type: 'Course', header: 'Test')

    high_course_version = create(:course_version)
    high_course_version.content_root.update!(published_state: 'stable')
    high_course_version.course_offering.update!(grade_levels: '11', curriculum_type: 'Course', header: 'Test')

    teacher = create(:teacher)
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale, 'student')

    refute course_offerings[:elementary].blank?
    refute course_offerings[:middle].blank?
    refute course_offerings[:high].blank?
  end

  test 'returns HoC and HoAI course offerings' do
    elementary_course_version = create(:course_version)
    elementary_course_version.content_root.update!(published_state: 'stable')
    elementary_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    hoc_course_version = create(:course_version)
    hoc_course_version.content_root.update!(published_state: 'stable')
    hoc_course_version.course_offering.update!(marketing_initiative: 'HOC', header: 'HoC Test')

    hoai_course_version = create(:course_version)
    hoai_course_version.content_root.update!(published_state: 'stable')
    hoai_course_version.course_offering.update!(marketing_initiative: 'HOAI', header: 'HoAI Test')

    teacher = create(:teacher)
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale, 'student')

    refute course_offerings[:elementary].blank?
    assert course_offerings[:middle].blank?
    assert course_offerings[:high].blank?
    refute course_offerings[:hoc].blank?
    refute course_offerings[:hoai].blank?
  end

  test 'returns PL course offerings when participant type is teacher' do
    elementary_course_version = create(:course_version)
    elementary_course_version.content_root.update!(published_state: 'stable')
    elementary_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    hoc_course_version = create(:course_version)
    hoc_course_version.content_root.update!(published_state: 'stable')
    hoc_course_version.course_offering.update!(marketing_initiative: 'HOC', header: 'HoC Test')

    pl_for_teachers_course_version = create(:course_version)
    pl_for_teachers_course_version.content_root.update!(published_state: 'stable', instructor_audience: 'facilitator', participant_audience: 'teacher')
    pl_for_teachers_course_version.course_offering.update!(header: 'PL Test')

    pl_for_facilitators_course_version = create(:course_version)
    pl_for_facilitators_course_version.content_root.update!(published_state: 'stable', instructor_audience: 'universal_instructor', participant_audience: 'facilitator')
    pl_for_facilitators_course_version.course_offering.update!(header: 'PL Test')

    teacher = create(:facilitator)
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale, 'teacher')

    refute course_offerings[:elementary].blank?
    assert course_offerings[:middle].blank?
    assert course_offerings[:high].blank?
    refute course_offerings[:hoc].blank?
    refute course_offerings[:pl].blank?
    assert_equal 1, course_offerings[:pl]['PL Test'].length
  end

  test 'returns PL course offerings when participant type is facilitator' do
    elementary_course_version = create(:course_version)
    elementary_course_version.content_root.update!(published_state: 'stable')
    elementary_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    hoc_course_version = create(:course_version)
    hoc_course_version.content_root.update!(published_state: 'stable')
    hoc_course_version.course_offering.update!(marketing_initiative: 'HOC', header: 'HoC Test')

    pl_for_teachers_course_version = create(:course_version)
    pl_for_teachers_course_version.content_root.update!(published_state: 'stable', instructor_audience: 'facilitator', participant_audience: 'teacher')
    pl_for_teachers_course_version.course_offering.update!(header: 'PL Test')

    pl_for_facilitators_course_version = create(:course_version)
    pl_for_facilitators_course_version.content_root.update!(published_state: 'stable', instructor_audience: 'universal_instructor', participant_audience: 'facilitator')
    pl_for_facilitators_course_version.course_offering.update!(header: 'PL Test')

    teacher = create(:universal_instructor)
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale, 'facilitator')

    refute course_offerings[:elementary].blank?
    assert course_offerings[:middle].blank?
    assert course_offerings[:high].blank?
    refute course_offerings[:hoc].blank?
    refute course_offerings[:pl].blank?
    assert_equal 2, course_offerings[:pl]['PL Test'].length
  end

  test 'only returns assignable course offerings' do
    assignable_course_version = create(:course_version)
    assignable_course_version.content_root.update!(published_state: 'stable')
    assignable_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test')

    unassignable_course_version = create(:course_version)
    unassignable_course_version.content_root.update!(published_state: 'stable')
    unassignable_course_version.course_offering.update!(grade_levels: 'K,1,2', curriculum_type: 'Course', header: 'Test', assignable: false)

    teacher = create(:teacher)
    course_offerings = QuickAssignHelper.course_offerings(teacher, I18n.default_locale, 'student')

    refute course_offerings[:elementary].blank?
    assert_equal 1, course_offerings[:elementary]['Course']['Test'].length
  end

  test 'grade level offerings are grouped by curriculum type and header' do
    course_offering1 = create(:course_offering, curriculum_type: 'Course', header: 'Header 2')
    course_offering2 = create(:course_offering, curriculum_type: 'Course', header: 'Header 1')
    course_offering3 = create(:course_offering, curriculum_type: 'Standalone Unit', header: 'Header 1')
    # course_offering4 and course_offering5 should be grouped together, with course_offering5 being first in the resulting list.
    course_offering4 = create(:course_offering, curriculum_type: 'Standalone Unit', header: 'Header 2', display_name: 'Z')
    course_offering5 = create(:course_offering, curriculum_type: 'Standalone Unit', header: 'Header 2', display_name: 'B')

    teacher = create(:teacher)
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
    course_offering1 = create(:course_offering, marketing_initiative: 'HOC', header: 'A Header')
    course_offering2 = create(:course_offering, marketing_initiative: 'HOC', header: 'B Header', display_name: 'Z')
    course_offering3 = create(:course_offering, marketing_initiative: 'HOC', header: 'B Header', display_name: 'A')
    favorite_course_offering = create(:course_offering, marketing_initiative: 'HOC', header: 'Favorites')

    teacher = create(:teacher)
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

  test 'HoAI course offerings are grouped by header' do
    course_offering1 = create(:course_offering, marketing_initiative: 'HOAI', header: 'A Header')
    course_offering2 = create(:course_offering, marketing_initiative: 'HOAI', header: 'B Header', display_name: 'Z')
    course_offering3 = create(:course_offering, marketing_initiative: 'HOAI', header: 'B Header', display_name: 'A')
    favorite_course_offering = create(:course_offering, marketing_initiative: 'HOAI', header: 'Favorites')

    teacher = create(:teacher)
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

  test 'featured grade level offerings are grouped under Recommended instead of their own header' do
    featured_course_offering = create(:course_offering, curriculum_type: 'Course', header: 'Year Long', is_featured: true)
    course_offering = create(:course_offering, curriculum_type: 'Course', header: 'Year Long')

    teacher = create(:teacher)
    grouped_offerings = QuickAssignHelper.group_grade_level_offerings([featured_course_offering, course_offering], teacher, I18n.default_locale)

    assert_equal 1, grouped_offerings['Course']['Recommended'].length
    assert_equal featured_course_offering.id, grouped_offerings['Course']['Recommended'][0][:id]

    # The featured offering is listed once, not under both headers.
    assert_equal 1, grouped_offerings['Course']['Year Long'].length
    assert_equal course_offering.id, grouped_offerings['Course']['Year Long'][0][:id]

    assert_equal ['Recommended', 'Year Long'], grouped_offerings['Course'].keys
  end

  test 'Recommended sorts ahead of every other grade level header' do
    featured_course_offering = create(:course_offering, curriculum_type: 'Course', header: 'B Header', is_featured: true)
    favorite_course_offering = create(:course_offering, curriculum_type: 'Course', header: 'Favorites')
    year_long_course_offering = create(:course_offering, curriculum_type: 'Course', header: 'Year Long')
    course_offering = create(:course_offering, curriculum_type: 'Course', header: 'A Header')

    teacher = create(:teacher)
    grouped_offerings = QuickAssignHelper.group_grade_level_offerings([course_offering, favorite_course_offering, year_long_course_offering, featured_course_offering], teacher, I18n.default_locale)

    assert_equal 'Recommended', grouped_offerings['Course'].keys.first
    # compare_headers forces both 'Favorites' and 'Year Long' to the front, so it does not
    # define an order between the two of them. Only assert on what it does define.
    assert_equal ['Favorites', 'Year Long'], grouped_offerings['Course'].keys[1..2].sort
    assert_equal 'A Header', grouped_offerings['Course'].keys.last
  end

  test 'featured grade level offerings stay within their own curriculum type' do
    featured_course = create(:course_offering, curriculum_type: 'Course', header: 'Year Long', is_featured: true)
    featured_module = create(:course_offering, curriculum_type: 'Module', header: 'CS Connections', is_featured: true)

    teacher = create(:teacher)
    grouped_offerings = QuickAssignHelper.group_grade_level_offerings([featured_course, featured_module], teacher, I18n.default_locale)

    assert_equal 1, grouped_offerings['Course']['Recommended'].length
    assert_equal featured_course.id, grouped_offerings['Course']['Recommended'][0][:id]
    assert_equal 1, grouped_offerings['Module']['Recommended'].length
    assert_equal featured_module.id, grouped_offerings['Module']['Recommended'][0][:id]
  end

  test 'featured grade level offerings within Recommended are sorted by display name' do
    course_offering_z = create(:course_offering, curriculum_type: 'Course', header: 'Year Long', display_name: 'Z', is_featured: true)
    course_offering_a = create(:course_offering, curriculum_type: 'Course', header: 'A Header', display_name: 'A', is_featured: true)

    teacher = create(:teacher)
    grouped_offerings = QuickAssignHelper.group_grade_level_offerings([course_offering_z, course_offering_a], teacher, I18n.default_locale)

    assert_equal 2, grouped_offerings['Course']['Recommended'].length
    assert_equal course_offering_a.id, grouped_offerings['Course']['Recommended'][0][:id]
    assert_equal course_offering_z.id, grouped_offerings['Course']['Recommended'][1][:id]
  end

  test 'featured grade level offerings without a header or curriculum type are still ignored' do
    no_header_course_offering = create(:course_offering, curriculum_type: 'Course', is_featured: true)
    no_curriculum_type_course_offering = create(:course_offering, header: 'Year Long', is_featured: true)

    teacher = create(:teacher)
    grouped_offerings = QuickAssignHelper.group_grade_level_offerings([no_header_course_offering, no_curriculum_type_course_offering], teacher, I18n.default_locale)

    assert_empty grouped_offerings
  end

  test 'featured HoC and PL offerings are grouped under Recommended instead of their own header' do
    featured_course_offering = create(:course_offering, marketing_initiative: 'HOC', header: 'Favorites', is_featured: true)
    favorite_course_offering = create(:course_offering, marketing_initiative: 'HOC', header: 'Favorites')
    course_offering = create(:course_offering, marketing_initiative: 'HOC', header: 'A Header')

    teacher = create(:teacher)
    grouped_offerings = QuickAssignHelper.group_hoc_and_pl_offerings([course_offering, favorite_course_offering, featured_course_offering], teacher, I18n.default_locale)

    assert_equal 1, grouped_offerings['Recommended'].length
    assert_equal featured_course_offering.id, grouped_offerings['Recommended'][0][:id]

    # The featured offering is listed once, not under both headers.
    assert_equal 1, grouped_offerings['Favorites'].length
    assert_equal favorite_course_offering.id, grouped_offerings['Favorites'][0][:id]

    assert_equal ['Recommended', 'Favorites', 'A Header'], grouped_offerings.keys
  end

  test 'featured HoC and PL offerings without a header are still ignored' do
    no_header_course_offering = create(:course_offering, marketing_initiative: 'HOC', is_featured: true)

    teacher = create(:teacher)
    grouped_offerings = QuickAssignHelper.group_hoc_and_pl_offerings([no_header_course_offering], teacher, I18n.default_locale)

    assert_empty grouped_offerings
  end
end

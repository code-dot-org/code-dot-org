require 'test_helper'

class ExportStudentDataControllerTest < ActionController::TestCase
  setup do
    @teacher = create(:teacher)
    @course, @course_units = course_with_units(1)
  end

  test_user_gets_response_for :show, user: :teacher
  test_user_gets_response_for :show, user: :student, response: :forbidden
  test_redirect_to_sign_in_for :show

  test 'lists the single unit of a one-unit course' do
    section = assigned_section(@course, @course_units.first)
    create(:follower, section: section, user: @teacher)

    sign_in @teacher
    get :show

    assert_equal @course_units.map(&:name), section_data_for(section)[:units].pluck(:name)
  end

  # A section assigned a course has course_id AND script_id set -- the model
  # requires course_id whenever script_id is present -- so resolving the unit
  # from script first would report one unit for a six-unit course.
  test 'lists every unit of a course-assigned section, in position order' do
    course, units = course_with_units(3)
    section = assigned_section(course, units.first)
    create(:follower, section: section, user: @teacher)

    sign_in @teacher
    get :show

    assert_equal units.map(&:name), section_data_for(section)[:units].pluck(:name)
  end

  test 'reports no units for an unassigned section' do
    section = create(:section, user: @teacher)
    create(:follower, section: section, user: @teacher)

    sign_in @teacher
    get :show

    assert_empty section_data_for(section)[:units]
  end

  # Legacy rows predate the course_id validation, so the script-only branch
  # still has to work.
  test 'falls back to the assigned unit when a section has no course' do
    section = assigned_section(@course, @course_units.first)
    section.update_column(:course_id, nil)

    sign_in @teacher
    get :show

    assert_equal @course_units.map(&:name), section_data_for(section)[:units].pluck(:name)
  end

  test 'includes archived sections, flagged as hidden' do
    section = assigned_section(@course, @course_units.first, hidden: true)

    sign_in @teacher
    get :show

    assert section_data_for(section)[:hidden]
  end

  test 'excludes demo sections' do
    section = assigned_section(@course, @course_units.first, demo_type: 'high')

    sign_in @teacher
    get :show

    assert_nil section_data_for(section)
  end

  test 'excludes sections whose participants are not students' do
    section = create(:section, :teacher_participants, user: @teacher)

    sign_in @teacher
    get :show

    assert_nil section_data_for(section)
  end

  test 'excludes other teachers sections' do
    other_section = create(:section, user: create(:teacher))

    sign_in @teacher
    get :show

    assert_nil section_data_for(other_section)
  end

  test 'includes co-taught sections' do
    owner = create(:teacher)
    section = create(:section, user: owner, script: @course_units.first, course_id: @course.id)
    create(:section_instructor, section: section, instructor: @teacher, status: :active)

    sign_in @teacher
    get :show

    refute_nil section_data_for(section)
  end

  test 'serializes a student with no username as nil rather than omitting them' do
    section = assigned_section(@course, @course_units.first)
    student = create(:student)
    student.update_column(:username, nil)
    create(:follower, section: section, student_user: student, user: @teacher)

    sign_in @teacher
    get :show

    students = section_data_for(section)[:students]
    assert_equal [student.id], students.pluck(:id)
    assert_nil students.first[:username]
  end

  test 'serializes both the given name and family name for a student' do
    section = assigned_section(@course, @course_units.first)
    student = create(:student, name: 'Chani', family_name: 'Kynes')
    create(:follower, section: section, student_user: student, user: @teacher)

    sign_in @teacher
    get :show

    student_data = section_data_for(section)[:students].find {|s| s[:id] == student.id}
    assert_equal 'Chani', student_data[:name]
    assert_equal 'Kynes', student_data[:familyName]
  end

  test 'does not cache the page' do
    sign_in @teacher
    get :show

    assert_equal 'no-store', response.headers['Cache-Control']
  end

  private def course_with_units(count)
    unit_group = create(:unit_group)
    units = Array.new(count) do |i|
      unit = create(:script, name: "export-test-unit-#{unit_group.name}-#{i}")
      create(:unit_group_unit, unit_group: unit_group, script: unit, position: i + 1)
      unit
    end
    [unit_group, units]
  end

  private def assigned_section(unit_group, unit, attributes = {})
    create(:section, {user: @teacher, script: unit, course_id: unit_group.id}.merge(attributes))
  end

  private def section_data_for(section)
    assigns(:sections_data).find {|data| data[:id] == section.id}
  end
end

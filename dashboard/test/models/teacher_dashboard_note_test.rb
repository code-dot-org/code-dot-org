require 'test_helper'

class TeacherDashboardNoteTest < ActiveSupport::TestCase
  setup do
    @teacher = create(:teacher)
    @section = create(:section, user: @teacher)
    @unit = create(:unit, :in_single_unit_course)
    @unit_group = create(:unit_group)
    @lesson = create(:lesson)
  end

  test 'validates required and trimmed body' do
    note = build(:teacher_dashboard_note, teacher: @teacher, unit: @unit, body: '   ')

    refute note.valid?
    assert_includes note.errors[:body], 'must not be blank'
  end

  test 'allows exactly 20000 characters and rejects longer bodies' do
    note = build(:teacher_dashboard_note, teacher: @teacher, unit: @unit, body: 'a' * 20_000)
    assert note.valid?

    note.body = 'a' * 20_001
    refute note.valid?
  end

  test 'validates course unit and lesson context ids' do
    assert build(:teacher_dashboard_note, :course_context, teacher: @teacher, unit_group: @unit_group).valid?
    assert build(:teacher_dashboard_note, teacher: @teacher, unit: @unit).valid?
    assert build(:teacher_dashboard_note, :lesson_context, teacher: @teacher, lesson: @lesson).valid?

    invalid = build(:teacher_dashboard_note, teacher: @teacher, context_type: TeacherDashboardNote::COURSE, unit: @unit)
    refute invalid.valid?
    assert_includes invalid.errors[:context_type], 'must have its matching context id'
  end

  test 'section note requires teacher to actively instruct section' do
    other_section = create(:section)
    note = build(:teacher_dashboard_note, teacher: @teacher, unit: @unit, section: other_section)

    refute note.valid?
    assert_includes note.errors[:section_id], 'must belong to an active instructor'
  end

  test 'shared sections must be actively instructed by the teacher' do
    other_section = create(:section)
    note = build(:teacher_dashboard_note, teacher: @teacher, unit: @unit)
    note.shared_sections << other_section

    refute note.valid?
    assert_includes note.errors[:shared_section_ids], 'must belong to an active instructor'
  end

  test 'shareable globally does not grant unrelated teacher visibility' do
    note = create(:teacher_dashboard_note, :shareable_globally, teacher: @teacher, unit: @unit)
    unrelated_teacher = create(:teacher)
    unrelated_section = create(:section, user: unrelated_teacher)

    visible = TeacherDashboardNote.visible_on_page_for(
      unrelated_teacher,
      section: unrelated_section,
      unit_id: @unit.id
    )

    assert_equal [note], TeacherDashboardNote.visible_on_page_for(@teacher, section: @section, unit_id: @unit.id)
    assert_empty visible
  end

  test 'all section notes and section specific notes are filtered for owner' do
    all_sections_note = create(:teacher_dashboard_note, teacher: @teacher, unit: @unit)
    current_section_note = create(:teacher_dashboard_note, teacher: @teacher, unit: @unit, section: @section)
    other_section = create(:section, user: @teacher)
    other_section_note = create(:teacher_dashboard_note, teacher: @teacher, unit: @unit, section: other_section)

    visible = TeacherDashboardNote.visible_on_page_for(@teacher, section: @section, unit_id: @unit.id)

    assert_includes visible, all_sections_note
    assert_includes visible, current_section_note
    refute_includes visible, other_section_note
  end

  test 'active coteacher sees shared section notes but removed coteacher does not' do
    coteacher = create(:teacher)
    @section.add_instructor(coteacher)
    shared_note = create(:teacher_dashboard_note, :shared_with_section, teacher: @teacher, unit: @unit, section: @section)

    assert_equal [shared_note], TeacherDashboardNote.visible_on_page_for(coteacher, section: @section, unit_id: @unit.id)

    @section.remove_instructor(coteacher)
    assert_empty TeacherDashboardNote.visible_on_page_for(coteacher, section: @section.reload, unit_id: @unit.id)
  end

  test 'unrelated teacher cannot see shared section notes' do
    create(:teacher_dashboard_note, :shared_with_section, teacher: @teacher, unit: @unit, section: @section)
    unrelated_teacher = create(:teacher)
    unrelated_section = create(:section, user: unrelated_teacher)

    assert_empty TeacherDashboardNote.visible_on_page_for(unrelated_teacher, section: unrelated_section, unit_id: @unit.id)
  end
end

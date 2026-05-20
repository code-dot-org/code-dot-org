require 'test_helper'

class Api::V1::TeacherDashboardNotesControllerTest < ActionDispatch::IntegrationTest
  API = '/dashboardapi/v1/teacher_dashboard_notes'

  setup do
    @teacher = create(:teacher)
    @section = create(:section, user: @teacher)
    @unit = create(:unit, :in_single_unit_course)
    @unit_group = create(:unit_group)
    @lesson = create(:lesson, script: @unit)
  end

  test 'owner can create list update and delete a unit note' do
    sign_in @teacher

    assert_difference('TeacherDashboardNote.count') do
      post API, params: {teacherDashboardNote: {
        title: 'Pair programming',
        body: 'Use pair programming here.',
        contextType: 'unit',
        unitId: @unit.id,
        sectionId: nil,
        sharedWithSection: false,
        shareableGlobally: false,
      }}, as: :json
    end
    assert_response :created
    note_id = parsed_response['id']
    assert_equal 'Pair programming', parsed_response['title']

    get API, params: {section_id: @section.id, unit_id: @unit.id}
    assert_response :success
    assert_equal ['Use pair programming here.'], parsed_response['notes'].pluck('body')

    patch "#{API}/#{note_id}", params: {teacherDashboardNote: {
      body: 'Use pair programming after the warmup.',
      title: 'Warmup pairs',
      contextType: 'unit',
      unitId: @unit.id,
      sectionId: nil,
      sharedWithSection: false,
      shareableGlobally: true,
      lockVersion: 0,
    }}, as: :json
    assert_response :success
    assert_equal 'Warmup pairs', parsed_response['title']
    assert_equal 'Use pair programming after the warmup.', parsed_response['body']
    assert_equal true, parsed_response['shareableGlobally']

    delete "#{API}/#{note_id}"
    assert_response :no_content
    refute TeacherDashboardNote.exists?(note_id)
  end

  test 'owner can list course unit and lesson notes for current page' do
    sign_in @teacher
    course_note = create(:teacher_dashboard_note, :course_context, teacher: @teacher, unit_group: @unit_group)
    unit_note = create(:teacher_dashboard_note, teacher: @teacher, unit: @unit)
    lesson_note = create(:teacher_dashboard_note, :lesson_context, teacher: @teacher, lesson: @lesson)

    get API, params: {
      section_id: @section.id,
      unit_group_id: @unit_group.id,
      unit_id: @unit.id,
      lesson_id: @lesson.id,
    }
    assert_response :success
    assert_equal [course_note.id, unit_note.id, lesson_note.id].sort, parsed_response['notes'].pluck('id').sort
  end

  test 'section-specific filtering and all-sections visibility' do
    sign_in @teacher
    all_sections_note = create(:teacher_dashboard_note, teacher: @teacher, unit: @unit)
    current_section_note = create(:teacher_dashboard_note, teacher: @teacher, unit: @unit, section: @section)
    other_section = create(:section, user: @teacher)
    create(:teacher_dashboard_note, teacher: @teacher, unit: @unit, section: other_section)

    get API, params: {section_id: @section.id, unit_id: @unit.id}
    assert_response :success
    assert_equal [all_sections_note.id, current_section_note.id].sort, parsed_response['notes'].pluck('id').sort
  end

  test 'shareable globally does not expose note to unrelated teacher' do
    create(:teacher_dashboard_note, :shareable_globally, teacher: @teacher, unit: @unit)
    other_teacher = create(:teacher)
    other_section = create(:section, user: other_teacher)
    sign_in other_teacher

    get API, params: {section_id: other_section.id, unit_id: @unit.id}
    assert_response :success
    assert_empty parsed_response['notes']
  end

  test 'coteacher can read shared notes but cannot edit or delete them' do
    coteacher = create(:teacher)
    @section.add_instructor(coteacher)
    note = create(:teacher_dashboard_note, :shared_with_section, teacher: @teacher, unit: @unit, section: @section)
    sign_in coteacher

    get API, params: {section_id: @section.id, unit_id: @unit.id}
    assert_response :success
    assert_equal [note.id], parsed_response['notes'].pluck('id')
    assert_equal false, parsed_response['notes'].first['isOwner']
    assert_equal [@section.id], parsed_response['notes'].first['sharedSectionIds']

    patch "#{API}/#{note.id}", params: {teacherDashboardNote: {
      body: 'Nope',
      contextType: 'unit',
      unitId: @unit.id,
      sectionId: @section.id,
      sharedWithSection: true,
      shareableGlobally: false,
      lockVersion: note.lock_version,
    }}, as: :json
    assert_response :forbidden

    delete "#{API}/#{note.id}"
    assert_response :forbidden
  end

  test 'coteacher can reorder a shared note with a personal layout' do
    coteacher = create(:teacher)
    @section.add_instructor(coteacher)
    note = create(:teacher_dashboard_note, :shared_with_section, teacher: @teacher, unit: @unit, section: @section)
    sign_in coteacher

    assert_difference('TeacherDashboardNoteLayout.count') do
      patch "#{API}/#{note.id}/layout", params: {teacherDashboardNoteLayout: {
        noteLayoutColumn: 1,
        notePosition: 3,
      }}, as: :json
    end
    assert_response :success
    assert_equal 1, parsed_response['noteLayoutColumn']
    assert_equal 3, parsed_response['notePosition']

    note.reload
    assert_equal 0, note.note_layout_column
    assert_equal 0, note.note_position

    sign_in @teacher
    get API, params: {section_id: @section.id, unit_id: @unit.id}
    assert_response :success
    assert_equal 0, parsed_response['notes'].first['noteLayoutColumn']
    assert_equal 0, parsed_response['notes'].first['notePosition']

    sign_in coteacher
    get API, params: {section_id: @section.id, unit_id: @unit.id}
    assert_response :success
    assert_equal 1, parsed_response['notes'].first['noteLayoutColumn']
    assert_equal 3, parsed_response['notes'].first['notePosition']
  end

  test 'unrelated teacher cannot reorder an invisible note' do
    note = create(:teacher_dashboard_note, teacher: @teacher, unit: @unit)
    other_teacher = create(:teacher)
    sign_in other_teacher

    patch "#{API}/#{note.id}/layout", params: {teacherDashboardNoteLayout: {
      noteLayoutColumn: 1,
      notePosition: 0,
    }}, as: :json

    assert_response :forbidden
    assert_empty TeacherDashboardNoteLayout.where(teacher_dashboard_note: note, teacher: other_teacher)
  end

  test 'owner can share an all-sections note with selected sections' do
    coteacher = create(:teacher)
    @section.add_instructor(coteacher)
    sign_in @teacher

    post API, params: {teacherDashboardNote: {
      title: 'Shared setup',
      body: 'Use the shared setup steps.',
      contextType: 'unit',
      unitId: @unit.id,
      sectionId: nil,
      sharedWithSection: true,
      sharedSectionIds: [@section.id],
      shareableGlobally: false,
    }}, as: :json
    assert_response :created
    assert_equal [@section.id], parsed_response['sharedSectionIds']

    sign_in coteacher
    get API, params: {section_id: @section.id, unit_id: @unit.id}
    assert_response :success
    assert_equal ['Shared setup'], parsed_response['notes'].pluck('title')
  end

  test 'removed coteacher loses shared note visibility' do
    coteacher = create(:teacher)
    @section.add_instructor(coteacher)
    create(:teacher_dashboard_note, :shared_with_section, teacher: @teacher, unit: @unit, section: @section)
    @section.remove_instructor(coteacher)
    sign_in coteacher

    get API, params: {section_id: @section.id, unit_id: @unit.id}
    assert_response :forbidden
  end

  test 'stale update returns conflict with current note' do
    sign_in @teacher
    note = create(:teacher_dashboard_note, teacher: @teacher, unit: @unit, body: 'First body')
    note.update!(body: 'Current body')

    patch "#{API}/#{note.id}", params: {teacherDashboardNote: {
      body: 'Stale body',
      contextType: 'unit',
      unitId: @unit.id,
      sectionId: nil,
      sharedWithSection: false,
      shareableGlobally: false,
      lockVersion: 0,
    }}, as: :json
    assert_response :conflict
    assert_equal 'stale note', parsed_response['error']
    assert_equal 'Current body', parsed_response['note']['body']
  end

  test 'student cannot use notes api' do
    sign_in create(:student)
    get API, params: {section_id: @section.id, unit_id: @unit.id}
    assert_response :forbidden
  end
end

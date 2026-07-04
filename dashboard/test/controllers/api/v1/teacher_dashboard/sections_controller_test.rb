require 'test_helper'

class Api::V1::TeacherDashboard::SectionsControllerTest < ActionController::TestCase
  setup_all do
    @teacher = create(:teacher)
    @student = create(:student)
  end

  # TDF-AUTH-01
  test 'signed out receives unauthorized' do
    get :index
    assert_response :unauthorized
  end

  # TDF-AUTH-02
  test 'student is forbidden' do
    sign_in @student
    get :index
    assert_response :forbidden
  end

  # TDF-AUTH-03
  test 'teacher with no sections gets an empty envelope' do
    sign_in create(:teacher)
    get :index
    assert_response :success
    assert_equal({'sections' => [], 'section_order' => nil}, returned_json)
  end

  # TDF-AUTH-04 / TDF-LIST-02
  test 'owner teacher sees only their own sections, archived included' do
    teacher = create(:teacher)
    owned_section = create(:section, user: teacher, login_type: 'word')
    archived_section = create(:section, user: teacher, login_type: 'word', hidden: true)
    create(:section, login_type: 'word') # another teacher's section, must not appear

    sign_in teacher
    get :index
    assert_response :success

    returned_ids = returned_json['sections'].map {|s| s['id']}
    assert_equal [owned_section.id, archived_section.id].sort, returned_ids.sort
    archived = returned_json['sections'].find {|s| s['id'] == archived_section.id}
    assert_equal true, archived['hidden']
  end

  # TDF-AUTH-05
  test 'accepted co-teacher sees the co-taught section' do
    owner = create(:teacher)
    coteacher = create(:teacher)
    cotaught_section = create(:section, user: owner, login_type: 'word')
    create(:section_instructor, instructor: coteacher, section: cotaught_section, status: :active)

    sign_in coteacher
    get :index
    assert_response :success

    returned_ids = returned_json['sections'].map {|s| s['id']}
    assert_includes returned_ids, cotaught_section.id
  end

  # TDF-AUTH-06
  test 'admin instructing no sections gets an empty list, no bypass' do
    admin = create(:admin)
    create(:section, login_type: 'word') # some other teacher's section

    sign_in admin
    get :index
    assert_response :success
    assert_equal({'sections' => [], 'section_order' => nil}, returned_json)
  end

  # TDF-LIST-01 / TDF-LIST-03
  test 'section with no curriculum has nullable fields null, participant_type passes through' do
    teacher = create(:teacher)
    create(:section, :teacher_participants, user: teacher)

    sign_in teacher
    get :index
    assert_response :success

    returned_section = returned_json['sections'].first
    assert_equal 'teacher', returned_section['participant_type']
    assert_nil returned_section['unitName']
    assert_nil returned_section['course_offering_id']
    assert_nil returned_section['demo_type']
  end

  # TDF-LIST-04
  test 'section_order is returned verbatim when a UserPreference row exists' do
    teacher = create(:teacher)
    section_a = create(:section, user: teacher, login_type: 'word')
    section_b = create(:section, user: teacher, login_type: 'word')
    UserPreference.create!(user_id: teacher.id, section_order: [section_b.id, section_a.id])

    sign_in teacher
    get :index
    assert_response :success
    assert_equal [section_b.id, section_a.id], returned_json['section_order']
  end

  # TDF-LIST-05
  test 'section_order is null when the user has no UserPreference row' do
    teacher = create(:teacher)
    create(:section, user: teacher, login_type: 'word')

    sign_in teacher
    get :index
    assert_response :success
    assert_nil returned_json['section_order']
  end

  # TDF-EQ-01 (R1 gate)
  test 'each returned section is field-equivalent to Section#concise_summarize' do
    teacher = create(:teacher)
    scriptless_section = create(:section, user: teacher, login_type: 'word')
    script = create(:unit, :in_single_unit_course)
    scripted_section = create(:section, user: teacher, login_type: 'word', script: script)

    sign_in teacher
    get :index
    assert_response :success

    returned_by_id = returned_json['sections'].index_by {|s| s['id']}

    [scriptless_section, scripted_section].each do |section|
      expected = JSON.parse(section.concise_summarize.to_json)
      actual = returned_by_id[section.id]
      assert_equal expected.keys.sort, actual.keys.sort, "key set mismatch for section #{section.id}"
      assert_equal expected, actual, "value mismatch for section #{section.id}"
    end
  end

  # Parsed JSON returned after the last request, for easy assertions.
  def returned_json
    JSON.parse @response.body
  end
end

require 'test_helper'

class StudentSnapshotsControllerTest < ActionController::TestCase
  let(:teacher) {create(:teacher)}
  let!(:unit) {create(:unit, name: 'test-unit')}
  let!(:lesson_group) {create(:lesson_group, script: unit)}
  let!(:lesson1) do
    create(:lesson,
           script: unit,
           lesson_group: lesson_group,
           name: 'Test Lesson 1',
           has_lesson_plan: true,
           lockable: false,
           relative_position: 1
    )
  end
  let!(:lesson2) do
    create(:lesson,
           script: unit,
           lesson_group: lesson_group,
           name: 'Test Lesson 2',
           has_lesson_plan: false,
           lockable: true,
           relative_position: 2
    )
  end

  before do
    sign_in(teacher)
  end

  describe 'GET #lessons' do
    subject(:get_lessons) {get :lessons, params: {unit_id: unit_id}}

    let(:unit_id) {unit.id}
    let(:response_data) {JSON.parse(response.body)}
    let(:lessons_data) {response_data['lessons']}

    it 'returns correct format with unit_id' do
      get_lessons

      _(response).must_be :ok?
      _(lessons_data.length).must_equal 2

      lesson_data = lessons_data.first
      _(lesson_data['id'].to_i).must_equal lesson1.id
      _(lesson_data['name']).must_equal 'Test Lesson 1'
      _(lesson_data['hasLessonPlan']).must_equal true
      _(lesson_data['isLockable']).must_equal false
      _(lesson_data['position']).must_equal 1
    end

    context 'with invalid unit_id' do
      let(:unit_id) {99999}

      it 'returns error' do
        get_lessons

        _(response).must_be :bad_request?
        _(response_data['error']).must_include "Can't find Unit id=99999"
      end
    end

    context 'with unit with no lessons' do
      let(:unit_id) {create(:unit, name: 'empty-unit').id}

      it 'returns empty array' do
        get_lessons

        _(response).must_be :ok?
        _(response_data['lessons']).must_equal []
        _(response_data['hasUnnumberedLessons']).must_equal false
      end
    end
  end

  describe 'GET #lesson_data' do
    subject(:get_lesson_data) {get :lesson_data, params: params}

    let(:params) {{lesson_id: lesson1.id}}
    let(:response_data) {JSON.parse(response.body)}

    context 'without any include parameters' do
      it 'returns empty response' do
        get_lesson_data

        _(response).must_be :ok?
        _(response_data).must_equal({})
      end
    end

    context 'with include_pythonlab parameter' do
      let(:params) {{lesson_id: lesson1.id, include_pythonlab: true}}

      context 'when lesson has no Pythonlab level' do
        it 'returns nil for pythonlabLevel' do
          get_lesson_data

          _(response).must_be :ok?
          _(response_data['pythonlabLevel']).must_be_nil
        end
      end

      context 'when lesson has Pythonlab level' do
        let!(:pythonlab_level) {create(:pythonlab, name: 'Test Pythonlab')}

        before do
          create(:script_level, script: unit, lesson: lesson1, levels: [pythonlab_level])
        end

        it 'includes levelData' do
          get_lesson_data

          _(response).must_be :ok?

          _(response_data['pythonlabLevel']).wont_be_nil
          _(response_data['pythonlabLevel']['id']).must_equal pythonlab_level.id
          _(response_data['pythonlabLevel']['name']).must_equal 'Test Pythonlab'
        end
      end

      context 'when lesson has multiple Pythonlab levels' do
        let!(:pythonlab_level1) {create(:pythonlab, name: 'First Pythonlab')}
        let!(:pythonlab_level2) {create(:pythonlab, name: 'Last Pythonlab')}

        before do
          create(:script_level, script: unit, lesson: lesson1, levels: [pythonlab_level1])
          create(:script_level, script: unit, lesson: lesson1, levels: [pythonlab_level2])
        end

        it 'uses last Pythonlab level' do
          get_lesson_data

          _(response).must_be :ok?

          _(response_data['pythonlabLevel']['id']).must_equal pythonlab_level2.id
          _(response_data['pythonlabLevel']['name']).must_equal 'Last Pythonlab'
        end
      end
    end
  end

  test "cfu_levels endpoint returns CFU levels from lesson" do
    # Create levels
    cfu_level = create(:level, name: 'CFU Level 1', type: 'Multi')
    regular_level = create(:level, name: 'Regular Level', type: 'Multi')

    # Create script levels with progression attribute
    cfu_script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level])
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Practice', levels: [regular_level])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_levels = response_data['cfu_levels']

    assert_equal 1, cfu_levels.length
    cfu_data = cfu_levels.first
    assert_equal cfu_level.id, cfu_data['id']
    assert_equal 'CFU Level 1', cfu_data['name']
    assert_equal 'CFU Level 1', cfu_data['display_name']
    assert_equal 'Multi', cfu_data['type']
    assert_equal cfu_script_level.id, cfu_data['script_level_id']
    assert_equal 'Check Your Understanding', cfu_data['progression']
    refute_nil cfu_data['progression_display_name']
  end

  test "cfu_levels endpoint matches both Check Your Understanding and Check For Understanding" do
    # Test both progression variants
    cfu_level1 = create(:level, name: 'CFU Level 1', type: 'Multi')
    cfu_level2 = create(:level, name: 'CFU Level 2', type: 'Multi')

    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level1])
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check For Understanding', levels: [cfu_level2])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_levels = response_data['cfu_levels']

    assert_equal 2, cfu_levels.length
    cfu_ids = cfu_levels.map {|l| l['id']}
    assert_includes cfu_ids, cfu_level1.id
    assert_includes cfu_ids, cfu_level2.id
  end

  test "cfu_levels endpoint returns empty array when no CFU levels exist" do
    regular_level = create(:level, name: 'Regular Level', type: 'Multi')
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Practice', levels: [regular_level])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    assert_equal [], response_data['cfu_levels']
  end

  test "cfu_levels endpoint returns empty array when script_level has no progression" do
    regular_level = create(:level, name: 'Regular Level', type: 'Multi')
    create(:script_level, script: @unit, lesson: @lesson1, progression: nil, levels: [regular_level])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    assert_equal [], response_data['cfu_levels']
  end

  test "cfu_levels endpoint returns error for invalid lesson_id" do
    get :cfu_levels, params: {lesson_id: 99999}

    assert_response :bad_request
    response_data = JSON.parse(response.body)
    assert_includes response_data['error'], "Can't find Lesson id=99999"
  end

  test "cfu_levels endpoint handles multiple levels in a script_level" do
    # Create multiple levels for the same script_level
    cfu_level1 = create(:level, name: 'CFU Level 1', type: 'Multi')
    cfu_level2 = create(:level, name: 'CFU Level 2', type: 'Multi')

    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level1, cfu_level2])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_levels = response_data['cfu_levels']

    assert_equal 2, cfu_levels.length
    cfu_ids = cfu_levels.map {|l| l['id']}
    assert_includes cfu_ids, cfu_level1.id
    assert_includes cfu_ids, cfu_level2.id
  end

  test "cfu_levels endpoint includes all required fields" do
    cfu_level = create(:level, name: 'CFU Level', type: 'Multi', display_name: 'CFU Display Name')
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_data = response_data['cfu_levels'].first

    refute_nil cfu_data['id']
    refute_nil cfu_data['name']
    refute_nil cfu_data['display_name']
    refute_nil cfu_data['type']
    refute_nil cfu_data['script_level_id']
    refute_nil cfu_data['progression']
    refute_nil cfu_data['progression_display_name']
    assert_equal 'CFU Display Name', cfu_data['display_name']
  end

  test "cfu_levels endpoint uses level name as display_name when display_name is nil" do
    cfu_level = create(:level, name: 'CFU Level', type: 'Multi', display_name: nil)
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_data = response_data['cfu_levels'].first

    assert_equal 'CFU Level', cfu_data['display_name']
  end
end

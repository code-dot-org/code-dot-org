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

  describe 'GET #cfu_levels' do
    subject(:get_cfu_levels) {get :cfu_levels, params: {lesson_id: lesson_id}}

    let(:lesson_id) {lesson1.id}
    let(:response_data) {JSON.parse(response.body)}
    let(:cfu_levels_data) {response_data['cfu_levels']}

    let(:regular_level) {create(:level, name: 'Regular Level', type: 'Multi')}
    let(:cfu_level1) {create(:level, name: 'CFU Level 1', type: 'Multi')}
    let(:cfu_level2) {create(:level, name: 'CFU Level 2', type: 'Multi')}

    context 'with invalid lesson_id' do
      let(:lesson_id) {99999}

      it 'returns error' do
        get_cfu_levels

        _(response).must_be :bad_request?
        _(response_data['error']).must_include "Can't find Lesson id=99999"
      end
    end

    context 'when no CFU levels should be returned' do
      it 'returns empty array for non-CFU progression' do
        create(:script_level, script: unit, lesson: lesson1, progression: 'Practice', levels: [regular_level])
        get_cfu_levels

        _(response).must_be :ok?
        _(cfu_levels_data).must_equal []
      end

      it 'returns empty array when progression is nil' do
        create(:script_level, script: unit, lesson: lesson1, progression: nil, levels: [regular_level])
        get_cfu_levels

        _(response).must_be :ok?
        _(cfu_levels_data).must_equal []
      end
    end

    context 'when lesson has CFU levels' do
      let!(:cfu_script_level) do
        create(:script_level, script: unit, lesson: lesson1, progression: 'Check Your Understanding', levels: [cfu_level1])
      end

      before do
        create(:script_level, script: unit, lesson: lesson1, progression: 'Practice', levels: [regular_level])
      end

      it 'returns only CFU levels with correct data' do
        get_cfu_levels

        _(response).must_be :ok?
        _(cfu_levels_data.length).must_equal 1

        cfu_data = cfu_levels_data.first
        _(cfu_data['id']).must_equal cfu_level1.id
        _(cfu_data['name']).must_equal 'CFU Level 1'
        _(cfu_data['display_name']).must_equal 'CFU Level 1'
        _(cfu_data['type']).must_equal 'Multi'
        _(cfu_data['script_level_id']).must_equal cfu_script_level.id
        _(cfu_data['progression']).must_equal 'Check Your Understanding'
        _(cfu_data['progression_display_name']).wont_be_nil
      end
    end

    context 'with multiple CFU levels' do
      it 'returns both progression variants' do
        create(:script_level, script: unit, lesson: lesson1, progression: 'Check Your Understanding', levels: [cfu_level1])
        create(:script_level, script: unit, lesson: lesson1, progression: 'Check For Understanding', levels: [cfu_level2])

        get_cfu_levels

        _(response).must_be :ok?
        _(cfu_levels_data.length).must_equal 2

        cfu_ids = cfu_levels_data.map {|l| l['id']}
        _(cfu_ids).must_include cfu_level1.id
        _(cfu_ids).must_include cfu_level2.id
      end

      it 'returns all levels in a single script_level' do
        create(:script_level, script: unit, lesson: lesson1, progression: 'Check Your Understanding', levels: [cfu_level1, cfu_level2])

        get_cfu_levels

        _(response).must_be :ok?
        _(cfu_levels_data.length).must_equal 2

        cfu_ids = cfu_levels_data.map {|l| l['id']}
        _(cfu_ids).must_include cfu_level1.id
        _(cfu_ids).must_include cfu_level2.id
      end
    end

    context 'with display_name handling' do
      it 'uses display_name when present' do
        cfu_level = create(:level, name: 'CFU Level', type: 'Multi', display_name: 'CFU Display Name')
        create(:script_level, script: unit, lesson: lesson1, progression: 'Check Your Understanding', levels: [cfu_level])

        get_cfu_levels

        _(response).must_be :ok?
        _(cfu_levels_data.first['display_name']).must_equal 'CFU Display Name'
      end

      it 'falls back to name when display_name is nil' do
        cfu_level = create(:level, name: 'CFU Level', type: 'Multi', display_name: nil)
        create(:script_level, script: unit, lesson: lesson1, progression: 'Check Your Understanding', levels: [cfu_level])

        get_cfu_levels

        _(response).must_be :ok?
        _(cfu_levels_data.first['display_name']).must_equal 'CFU Level'
      end
    end
  end
end

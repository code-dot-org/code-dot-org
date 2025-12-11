require 'test_helper'

class StudentSnapshotsControllerTest < ActionController::TestCase
  include MiniTest::RSpecMocks

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
      _(lesson_data['levelData']).must_be_nil
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

    context 'when lesson has Pythonlab level' do
      let!(:pythonlab_level) {create(:pythonlab, name: 'Test Pythonlab')}

      before do
        create(:script_level, script: unit, lesson: lesson1, levels: [pythonlab_level])
      end

      it 'includes levelData' do
        get_lessons

        _(response).must_be :ok?

        lesson_data = lessons_data.first
        _(lesson_data['levelData']).wont_be_nil
        _(lesson_data['levelData']['id']).must_equal pythonlab_level.id
        _(lesson_data['levelData']['name']).must_equal 'Test Pythonlab'
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
        get_lessons

        _(response).must_be :ok?

        lesson_data = lessons_data.first
        _(lesson_data['levelData']['id']).must_equal pythonlab_level2.id
        _(lesson_data['levelData']['name']).must_equal 'Last Pythonlab'
      end
    end
  end
end

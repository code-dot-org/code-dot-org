require 'test_helper'

class ClassGalleryProjectsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  let(:teacher) {create(:teacher)}
  let(:section) {create(:section, user: teacher)}
  let(:student) {create(:student)}
  let(:classmate) {create(:student)}
  let(:outsider) {create(:student)}

  let(:unit) {create(:script)}
  let(:lesson) {create(:lesson, script: unit, lesson_group: create(:lesson_group, script: unit), has_lesson_plan: true)}

  # The tagged level shares its channel with the project template, as the
  # levels of a multi-level project do.
  let(:template_level) {create(:music)}
  let(:project_level) do
    level = create(:music)
    level.project_template_level_name = template_level.name
    level.save!
    level
  end
  let!(:tagged_script_level) do
    create(:script_level, script: unit, lesson: lesson, levels: [project_level], class_gallery: true)
  end

  let(:response_json) {JSON.parse(response.body)}

  before do
    create(:follower, section:, student_user: student)
    create(:follower, section:, student_user: classmate)
  end

  # A channel for `user` on `level` in `unit_id`, as opening the level makes
  # it; saved_at, when given, is when its sources were last saved.
  def create_project(user, level, saved_at: 1.minute.from_now, state: 'active', unit_id: unit.id)
    storage_id = ProjectStorage.find_or_create_by!(user_id: user.id).id
    project = Project.create!(
      storage_id: storage_id,
      updated_ip: '127.0.0.1',
      project_type: 'music',
      state: state,
      value: {name: "#{user.name}'s song"}.to_json
    )
    project.update_columns(updated_at: saved_at) if saved_at
    ChannelToken.create!(level: level, storage_app_id: project.id, storage_id: storage_id, script_id: unit_id)
    project
  end

  describe 'GET #index' do
    it 'redirects signed-out users to sign in' do
      get :index, params: {unit_id: unit.id}
      assert_redirected_to_sign_in
    end

    describe 'as the section teacher' do
      before {sign_in teacher}

      it "lists each student's saved project on a tagged level" do
        project = create_project(student, template_level)
        create_project(classmate, template_level)

        get :index, params: {section_id: section.id, unit_id: unit.id}

        assert_response :success
        _(response_json.pluck('user_id').sort).must_equal [student.id, classmate.id].sort
        entry = response_json.find {|e| e['user_id'] == student.id}
        _(entry['channel']).must_equal project.channel_id
        _(entry['share_path']).must_equal "/projects/music/#{project.channel_id}"
        _(entry['user_name']).must_equal student.name
        _(entry['name']).must_equal "#{student.name}'s song"
        _(entry['unit_id']).must_equal unit.id
        _(entry['lesson_position']).must_equal lesson.relative_position
        _(entry['script_level_id']).must_equal tagged_script_level.id
        _(entry['reactions']).must_equal []
      end

      it 'omits a channel that was opened but never saved' do
        create_project(student, template_level, saved_at: nil)
        get :index, params: {section_id: section.id, unit_id: unit.id}
        _(response_json).must_be_empty
      end

      it 'omits a deleted project' do
        create_project(student, template_level, state: 'deleted')
        get :index, params: {section_id: section.id, unit_id: unit.id}
        _(response_json).must_be_empty
      end

      it 'omits work on an untagged level' do
        untagged_level = create(:music)
        create(:script_level, script: unit, lesson: lesson, levels: [untagged_level])
        create_project(student, untagged_level)
        get :index, params: {section_id: section.id, unit_id: unit.id}
        _(response_json).must_be_empty
      end

      it 'omits work on the same level in another unit' do
        other_unit = create(:script)
        create_project(student, template_level, unit_id: other_unit.id)
        get :index, params: {section_id: section.id, unit_id: unit.id}
        _(response_json).must_be_empty
      end

      it "omits students outside the section" do
        create_project(outsider, template_level)
        get :index, params: {section_id: section.id, unit_id: unit.id}
        _(response_json).must_be_empty
      end

      it 'lists the most recently saved sublevel of a tagged bubble choice' do
        choice_a = create(:music)
        choice_b = create(:music)
        bubble_choice = create(:bubble_choice_level, sublevels: [choice_a, choice_b])
        bubble_script_level = create(:script_level, script: unit, lesson: lesson, levels: [bubble_choice], class_gallery: true)
        create_project(student, choice_a, saved_at: 2.minutes.from_now)
        newer = create_project(student, choice_b, saved_at: 3.minutes.from_now)

        get :index, params: {section_id: section.id, unit_id: unit.id}

        entries = response_json.select {|e| e['script_level_id'] == bubble_script_level.id}
        _(entries.pluck('channel')).must_equal [newer.channel_id]
      end

      describe 'ordering' do
        before do
          create_project(student, template_level, saved_at: 2.minutes.from_now)
          create_project(classmate, template_level, saved_at: 3.minutes.from_now)
        end

        it 'lists the newest save first by default' do
          get :index, params: {section_id: section.id, unit_id: unit.id}
          _(response_json.pluck('user_id')).must_equal [classmate.id, student.id]
        end

        it 'lists the oldest save first on request' do
          get :index, params: {section_id: section.id, unit_id: unit.id, sort: 'oldest'}
          _(response_json.pluck('user_id')).must_equal [student.id, classmate.id]
        end
      end
    end

    it "lets a section student list their classmates' projects" do
      create_project(classmate, template_level)
      sign_in student
      get :index, params: {section_id: section.id, unit_id: unit.id}
      assert_response :success
      _(response_json.pluck('user_id')).must_equal [classmate.id]
    end

    it 'refuses a user outside the section' do
      sign_in outsider
      get :index, params: {section_id: section.id, unit_id: unit.id}
      assert_response :forbidden
    end

    it "lists only the caller's own projects without a section" do
      create_project(student, template_level)
      create_project(classmate, template_level)
      sign_in student
      get :index, params: {unit_id: unit.id}
      _(response_json.pluck('user_id')).must_equal [student.id]
    end
  end

  describe 'GET #unit_counts' do
    it 'counts entries per unit over the section' do
      create_project(student, template_level)
      create_project(classmate, template_level)
      other_unit = create(:script)
      sign_in teacher

      get :unit_counts, params: {section_id: section.id, unit_ids: "#{unit.id},#{other_unit.id}"}

      assert_response :success
      _(response_json).must_equal({unit.id.to_s => 2})
    end

    it 'refuses a user outside the section' do
      sign_in outsider
      get :unit_counts, params: {section_id: section.id, unit_ids: unit.id.to_s}
      assert_response :forbidden
    end
  end
end

require 'test_helper'

class HiddenLevelTest < ActionDispatch::IntegrationTest
  include LevelsHelper # for build_script_level_path

  self.use_transactional_test_case = true

  setup_all do
    @student = create :student
    @teacher = create :authorized_teacher
    @script = create(:script, hideable_stages: true)
    @stage_1 = create(:stage, script: @script, absolute_position: 1, relative_position: '1')
    @script_level_1 = create(
      :script_level,
      script: @script,
      stage: @stage_1,
      position: 1
    )
    @section = create(:section, user_id: @teacher.id, script: @script)

    Follower.create!(section_id: @section.id, student_user_id: @student.id, user: @teacher)

    # Hide the first lesson/stage
    SectionHiddenStage.create(
      section_id: @section.id,
      stage_id: @stage_1.id
    )

    @hidden_sl = @script.script_levels.first
  end

  test 'authorized teacher viewing hidden level' do
    sign_in @teacher

    get build_script_level_path(@hidden_sl)
    assert_response :success
  end

  test 'student viewing hidden level' do
    sign_in @student

    assert @student.script_level_hidden?(@hidden_sl)
    get build_script_level_path(@hidden_sl)
    assert_response :success
  end
end

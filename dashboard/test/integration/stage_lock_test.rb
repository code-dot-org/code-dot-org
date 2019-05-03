require 'test_helper'

class StageLockTest < ActionDispatch::IntegrationTest
  include LevelsHelper # for build_script_level_path

  setup_all do
    @student = create :student
    @teacher = create :authorized_teacher
    @section = create :section, user_id: @teacher.id
    Follower.create!(section_id: @section.id, student_user_id: @student.id, user: @teacher)

    @script = create :script
    @lockable_stage = create(:stage, script: @script, name: 'Lockable Stage', lockable: true)
    external = create(:external, name: 'markdown level')
    @lockable_external_sl = create(:script_level, script: @script, stage: @lockable_stage, levels: [external])
    @level_group = create(:level_group, :with_sublevels, name: 'assessment 1')
    @lockable_level_group_sl = create(:script_level, script: @script, stage: @lockable_stage, levels: [@level_group], assessment: true)
  end

  test 'authorized teacher viewing lockable stage contents' do
    sign_in @teacher

    get build_script_level_path(@lockable_external_sl)
    assert_response :success
    assert_includes response.body, 'lorem ipsum'
    assert_select "#locked-stage", 1
    # data-hidden indicates that the client will decide whether the teacher
    # will see the locked-stage message via the ViewAsToggle.
    assert_select "#locked-stage[data-hidden]", 1

    # This needs to be an integration test rather than a controller test in
    # order to follow the redirect which adds the /page/1 suffix.
    get build_script_level_path(@lockable_level_group_sl)
    follow_redirect!
    assert_response :success
    assert_select '.level-group', 1
    assert_select "#locked-stage", 1
    assert_select "#locked-stage[data-hidden]", 1
  end

  test 'student viewing lockable stage contents' do
    sign_in @student
    assert @lockable_level_group_sl.locked?(@student)
    assert @lockable_external_sl.locked?(@student)

    get build_script_level_path(@lockable_external_sl)
    assert_response :success
    refute_includes response.body, 'lorem ipsum'
    assert_select "#locked-stage", 1
    assert_select "#locked-stage[data-hidden]", 0

    get build_script_level_path(@lockable_level_group_sl)
    follow_redirect!
    assert_response :success
    assert_select '.level-group', 0
    assert_select "#locked-stage", 1
    assert_select "#locked-stage[data-hidden]", 0

    # Unlock the stage.
    UserLevel.update_lockable_state(
      @student.id, @level_group.id, @script.id, false, false
    )
    refute @lockable_level_group_sl.locked?(@student)
    refute @lockable_external_sl.locked?(@student)

    get build_script_level_path(@lockable_external_sl)
    assert_response :success
    assert_includes response.body, 'lorem ipsum'
    assert_select "#locked-stage", 0

    get build_script_level_path(@lockable_level_group_sl)
    follow_redirect!
    assert_response :success
    assert_select '.level-group', 1
    assert_select "#locked-stage", 0
  end
end

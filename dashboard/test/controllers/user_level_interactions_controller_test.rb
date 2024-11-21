require 'test_helper'

class UserLevelInteractionsControllerTest < ActionController::TestCase
  include LevelsHelper
  setup do
    @student = create :student
    sign_in @student
    @csp_2024_script = create(:csp_script, :with_levels, version_year: '2024', family_name: 'csp', is_course: true)
    CourseOffering.add_course_offering(@csp_2024_script)
    @csp_2024_level = @csp_2024_script.levels.first
  end

  test "create User Level Interaction with valid params" do
    uli, metadata = check_created_uli(@csp_2024_script, @csp_2024_level)
    # There isn't a project associated with this level; check these values are nil.
    assert_nil uli.code_version
    assert_nil metadata["project_id"]
  end

  test "create User Level Interaction for project level" do
    @lesson = create(:lesson, :with_lesson_group, script: @csp_2024_script)
    @script_level = create :script_level, script: @csp_2024_script, lesson: @lesson, levels: [@csp_2024_level]
    @fake_ip = '127.0.0.1'
    @storage_id = create_storage_id_for_user(@student.id)
    channel_token = ChannelToken.find_or_create_channel_token(@csp_2024_level, @fake_ip, @storage_id, @csp_2024_script)
    @channel_id = channel_token.channel

    # Don't actually talk to S3 when running SourceBucket.new
    AWS::S3.stubs :create_client
    stub_project_source_data(@channel_id)
    _, @project_id = storage_decrypt_channel_id(@channel_id)
    fake_version_id = "fake-version-id"

    uli, metadata = check_created_uli(@csp_2024_script, @csp_2024_level)

    assert_equal fake_version_id, uli.code_version
    assert_equal @project_id, metadata["project_id"]
  end

  def check_created_uli(script, level)
    assert_creates(UserLevelInteraction) do
      post :create, params: {
        level_id: level.id,
        script_id: script.id,
        interaction: SharedConstants::USER_LEVEL_INTERACTIONS.click_help_and_tips,
      }
    end
    created_uli = UserLevelInteraction.last
    assert_equal @student.id, created_uli.user_id
    assert_equal script.id, created_uli.script_id
    assert_equal level.id, created_uli.level_id
    assert_equal SharedConstants::USER_LEVEL_INTERACTIONS.click_help_and_tips, created_uli.interaction
    metadata = JSON.parse(created_uli.metadata)
    assert_equal script.properties["curriculum_umbrella"], metadata["course_offering"]
    assert_equal script.name, metadata["unit"]
    assert_equal level.type, metadata["level_type"]
    assert_equal @student.user_type, metadata["user_type"]
    return created_uli, metadata
  end

  test "do not create User Level Interaction for teachers" do
    @teacher = create :teacher
    sign_in @teacher
    refute_creates_uli(@csp_2024_script, @csp_2024_level)
  end

  test "do not create User Level Interaction for non-CSP units" do
    @csf_2024_script = create(:csf_script, :with_levels, version_year: '2024', family_name: 'csf', is_course: true)
    CourseOffering.add_course_offering(@csf_2024_script)
    @csf_2024_level = @csf_2024_script.levels.first
    refute_creates_uli(@csf_2024_script, @csf_2024_level)
  end

  test "do not create User Level Interaction for units before 2024" do
    @csp_2017_script = create(:csp_script, :with_levels, version_year: '2017', family_name: 'csp', is_course: true)
    CourseOffering.add_course_offering(@csp_2017_script)
    @csp_2017_level = @csp_2017_script.levels.first
    refute_creates_uli(@csp_2017_script, @csp_2017_level)
  end

  def refute_creates_uli(script, level)
    refute_creates(UserLevelInteraction) do
      post :create, params: {
        level_id: level.id,
        script_id: script.id,
        interaction: SharedConstants::USER_LEVEL_INTERACTIONS.click_help_and_tips,
      }
      assert_response :success
    end
  end
end

require 'test_helper'

class ProjectTest < ActiveSupport::TestCase
  setup_all do
    @owner = create(:student)
    @storage_id = ProjectStorage.create_for_user(@owner.id)
    @other_storage_id = ProjectStorage.create_for_user(create(:student).id)
    @anonymous_storage_id = ProjectStorage.create_for_user
  end

  test 'create_channel returns an encrypted channel id unless project-uuid-in-url is on' do
    channel_id = Project.create_channel(@anonymous_storage_id, {projectType: 'artist'}, ip: 123)
    refute_match Project::UUID_FORMAT, channel_id
    assert_equal @anonymous_storage_id, storage_decrypt_channel_id(channel_id).first

    DCDO.stubs(:get).with('project-uuid-in-url', false).returns(true)
    channel_id = Project.create_channel(@anonymous_storage_id, {projectType: 'artist'}, ip: 123)
    assert_match Project::UUID_FORMAT, channel_id
    assert_equal @anonymous_storage_id, Project.find_by!(uuid: channel_id).storage_id
  end

  test 'create_channel writes the columns Projects#create wrote' do
    parent = project_for(Project.create_channel(@storage_id, {}, ip: 123))
    published_at = Time.utc(2026, 1, 2, 3, 4, 5)

    project = project_for(
      Project.create_channel(
        @storage_id,
        {'name' => 'remix'},
        ip: 123,
        type: 'applab',
        published_at: published_at,
        remix_parent_id: parent.id,
        standalone: false
      )
    )

    assert_equal({'name' => 'remix'}, JSON.parse(project.value))
    assert_equal '123', project.updated_ip
    assert_equal 'active', project.state
    assert_equal 0, project.abuse_score
    assert_equal 'applab', project.project_type
    assert_equal published_at, project.published_at
    assert_equal parent.id, project.remix_parent_id
    assert_equal false, project.skip_content_moderation
    assert_equal false, project.standalone
    assert_equal project.created_at, project.updated_at
    assert_match Project::UUID_FORMAT, project.uuid
  end

  test 'create_channel prefers type over the level project type' do
    level = mock
    level.expects(:project_type).never
    channel_id = Project.create_channel(@storage_id, {}, ip: 123, type: 'actual_type', level: level)
    assert_equal 'actual_type', Project.get_channel(@storage_id, channel_id)[:projectType]
  end

  test 'create_channel falls back to the level project type' do
    level = mock
    level.expects(:project_type).returns('test_type').once
    channel_id = Project.create_channel(@storage_id, {}, ip: 123, level: level)
    assert_equal 'test_type', Project.get_channel(@storage_id, channel_id)[:projectType]
  end

  test 'create_channel allows a nil project type' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    assert_nil Project.get_channel(@storage_id, channel_id)[:projectType]
  end

  test 'create_channel validates the thumbnail url' do
    assert_raises(Projects::ValidationError) do
      Project.create_channel(@storage_id, {'thumbnailUrl' => 'bad.com'}, ip: 123)
    end

    thumbnail_url = '/v3/files/parentChannelId123/.metadata/thumbnail.png'
    channel_id = Project.create_channel(@storage_id, {'thumbnailUrl' => thumbnail_url}, ip: 123)
    assert_equal thumbnail_url, Project.get_channel(@storage_id, channel_id)['thumbnailUrl']
  end

  test 'get_channel hides age-restricted projects made without an account from other storage' do
    channel_id = Project.create_channel(@anonymous_storage_id, {projectType: 'applab'}, ip: 123)
    assert_raises(Projects::NotFound) {Project.get_channel(@storage_id, channel_id)}
    Project.get_channel(@anonymous_storage_id, channel_id)

    channel_id = Project.create_channel(@anonymous_storage_id, {projectType: 'artist'}, ip: 123)
    Project.get_channel(@storage_id, channel_id)

    channel_id = Project.create_channel(@storage_id, {projectType: 'applab'}, ip: 123)
    Project.get_channel(@anonymous_storage_id, channel_id)
  end

  test 'get_channel raises NotFound for channel ids it cannot resolve' do
    assert_raises(Projects::NotFound) {Project.get_channel(@storage_id, 'garbage')}
    assert_raises(Projects::NotFound) {Project.get_channel(@storage_id, SecureRandom.uuid)}
  end

  test 'get_channel reports isOwner only to the owning storage' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    assert_equal true, Project.get_channel(@storage_id, channel_id)[:isOwner]
    assert_equal false, Project.get_channel(@other_storage_id, channel_id)[:isOwner]
  end

  test 'get_channel returns four-byte characters intact' do
    channel_id = Project.create_channel(@storage_id, {'emoticon' => "\u{1F44D}"}, ip: 123)
    assert_equal "\u{1F44D}", Project.get_channel(@storage_id, channel_id)['emoticon']
  end

  test 'update_channel moves updated_at but not created_at' do
    created_at = Time.utc(2026, 10, 1, 12)
    channel_id = Timecop.freeze(created_at) {Project.create_channel(@storage_id, {'abc' => 123}, ip: 123)}
    value = Project.get_channel(@storage_id, channel_id)
    assert_equal created_at, value[:createdAt]
    assert_equal created_at, value[:updatedAt]

    updated_at = created_at + 1.day
    returned = Timecop.freeze(updated_at) do
      Project.update_channel(@storage_id, channel_id, {'abc' => 456}, '127.0.0.1')
    end
    assert_equal 456, returned['abc']
    assert_equal true, returned[:isOwner]
    assert_equal updated_at, returned[:updatedAt]

    value = Project.get_channel(@storage_id, channel_id)
    assert_equal 456, value['abc']
    assert_equal created_at, value[:createdAt]
    assert_equal updated_at, value[:updatedAt]
  end

  test 'update_channel sets project_type only when given' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    Project.update_channel(@storage_id, channel_id, {}, '127.0.0.1')
    assert_nil project_for(channel_id).project_type

    Project.update_channel(@storage_id, channel_id, {}, '127.0.0.1', project_type: 'gamelab')
    assert_equal 'gamelab', project_for(channel_id).project_type
  end

  test 'update_channel gives a project without a uuid one' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    project = project_for(channel_id)
    project.update_column(:uuid, nil)

    Project.update_channel(@storage_id, channel_id, {}, '127.0.0.1')
    assert_match Project::UUID_FORMAT, project.reload.uuid
  end

  test 'update_channel validates the thumbnail url' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    assert_raises(Projects::ValidationError) do
      Project.update_channel(@storage_id, channel_id, {'thumbnailUrl' => 'bad.com'}, '127.0.0.1')
    end

    thumbnail_url = "/v3/files/#{channel_id}/.metadata/thumbnail.png"
    returned = Project.update_channel(@storage_id, channel_id, {'thumbnailUrl' => thumbnail_url}, '127.0.0.1')
    assert_equal thumbnail_url, returned['thumbnailUrl']
  end

  test 'update_channel skips the profanity check when the name is unchanged' do
    channel_id = Project.create_channel(@storage_id, {'name' => 'old'}, ip: 123)
    Project.expects(:title_profanity_privacy_violation).never
    Project.update_channel(@storage_id, channel_id, {'name' => 'old'}, '127.0.0.1')
  end

  test 'update_channel rejects a new name that fails the profanity check' do
    channel_id = Project.create_channel(@storage_id, {'name' => 'old'}, ip: 123)
    Project.expects(:title_profanity_privacy_violation).with('rude', 'fr').returns(stub(content: 'rude'))
    error = assert_raises(ProfanityPrivacyError) do
      Project.update_channel(@storage_id, channel_id, {'name' => 'rude'}, '127.0.0.1', locale: 'fr')
    end
    assert_equal 'rude', error.flagged_text
    assert_equal 'old', JSON.parse(project_for(channel_id).value)['name']
  end

  test 'delete_channel hides a project until restore_channel' do
    channel_id = Project.create_channel(@storage_id, {projectType: 'applab'}, ip: 123)

    assert_equal true, Project.delete_channel(@storage_id, channel_id)
    assert_equal 'deleted', project_for(channel_id).state
    assert_raises(Projects::NotFound) {Project.get_channel(@storage_id, channel_id)}

    assert_equal true, Project.restore_channel(@storage_id, channel_id)
    assert_equal 'active', project_for(channel_id).state
    Project.get_channel(@storage_id, channel_id)
  end

  test 'channel writes require the owning storage' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    assert_raises(Projects::NotFound) {Project.update_channel(@other_storage_id, channel_id, {}, '127.0.0.1')}
    assert_raises(Projects::NotFound) {Project.delete_channel(@other_storage_id, channel_id)}
    assert_raises(Projects::NotFound) {Project.restore_channel(@other_storage_id, channel_id)}
    assert_raises(Projects::NotFound) {Project.publish_channel(@other_storage_id, channel_id, 'applab')}
    assert_raises(Projects::NotFound) {Project.unpublish_channel(@other_storage_id, channel_id)}
    assert_equal 'active', project_for(channel_id).state
  end

  test 'channel updates skip deleted projects' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    Project.delete_channel(@storage_id, channel_id)
    assert_raises(Projects::NotFound) {Project.update_channel(@storage_id, channel_id, {}, '127.0.0.1')}
    assert_raises(Projects::NotFound) {Project.publish_channel(@storage_id, channel_id, 'applab')}
    assert_raises(Projects::NotFound) {Project.unpublish_channel(@storage_id, channel_id)}
  end

  test 'publish_channel and unpublish_channel set and clear published_at' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    published_at = Time.utc(2026, 10, 2)
    assert_equal 1, Timecop.freeze(published_at) {Project.publish_channel(@storage_id, channel_id, 'applab')}
    project = project_for(channel_id)
    assert_equal 'applab', project.project_type
    assert_equal published_at, project.published_at

    Project.unpublish_channel(@storage_id, channel_id)
    assert_nil project.reload.published_at
    # MySQL reports matched rather than changed rows (FOUND_ROWS), so a no-op unpublish is not NotFound.
    Project.unpublish_channel(@storage_id, channel_id)
  end

  test 'project_type_from_channel_id looks in the column, then the value, then the level' do
    assert_equal 'unknown', Project.project_type_from_channel_id(@storage_id, Project.create_channel(@storage_id, {}, ip: 123))

    channel_id = Project.create_channel(@storage_id, {}, ip: 123, type: 'applab')
    assert_equal 'applab', Project.project_type_from_channel_id(@storage_id, channel_id)

    channel_id = Project.create_channel(@storage_id, {projectType: 'gamelab'}, ip: 123)
    assert_equal 'gamelab', Project.project_type_from_channel_id(@storage_id, channel_id)

    channel_id = Project.create_channel(@storage_id, {level: '/projects/weblab'}, ip: 123)
    assert_equal 'weblab', Project.project_type_from_channel_id(@storage_id, channel_id)
  end

  test 'channels_for_storage lists undeleted projects and skips malformed values' do
    kept = Project.create_channel(@storage_id, {'name' => 'kept'}, ip: 123)
    Project.delete_channel(@storage_id, Project.create_channel(@storage_id, {}, ip: 123))
    Project.create!(storage_id: @storage_id, value: '{', updated_ip: '127.0.0.1')
    Project.create_channel(@other_storage_id, {}, ip: 123)

    channels = Project.channels_for_storage(@storage_id)
    assert_equal [kept], channels.pluck(:id)
    assert_equal 'kept', channels.first['name']
    assert_equal true, channels.first[:isOwner]
  end

  test 'most_recent_channel skips hidden and frozen projects unless asked for hidden ones' do
    start = Time.utc(2026, 10, 1)
    abc = Timecop.freeze(start) {Project.create_channel(@storage_id, {level: 'projects/abc'}, ip: 123)}
    xyz = Timecop.freeze(start + 1.minute) {Project.create_channel(@storage_id, {level: 'projects/xyz'}, ip: 123)}
    hidden = Timecop.freeze(start + 2.minutes) do
      Project.create_channel(@storage_id, {hidden: true, level: 'projects/abc'}, ip: 123)
    end
    Timecop.freeze(start + 3.minutes) {Project.create_channel(@storage_id, {frozen: true, level: 'projects/xyz'}, ip: 123)}
    Timecop.freeze(start + 4.minutes) {Project.create_channel(@storage_id, {}, ip: 123)}

    assert_equal abc, Project.most_recent_channel(@storage_id, 'abc')
    assert_equal xyz, Project.most_recent_channel(@storage_id, 'xyz')
    assert_equal hidden, Project.most_recent_channel(@storage_id, 'abc', true)
    assert_nil Project.most_recent_channel(@other_storage_id, 'abc')
  end

  test 'soft_delete_all_for_storage deletes only that storage and counts only undeleted projects' do
    other_channel_id = Project.create_channel(@other_storage_id, {}, ip: 123)
    channel_ids = Array.new(2) {Project.create_channel(@storage_id, {}, ip: 123)}
    Project.delete_channel(@storage_id, channel_ids.first)

    deleted_at = Time.utc(2026, 10, 3)
    assert_equal 1, Timecop.freeze(deleted_at) {Project.soft_delete_all_for_storage(@storage_id)}
    assert_equal(%w(deleted deleted), channel_ids.map {|channel_id| project_for(channel_id).state})
    assert_equal deleted_at, project_for(channel_ids.last).updated_at
    assert_equal 'active', project_for(other_channel_id).state
  end

  test 'restore_for_storage_if_deleted_after restores projects deleted since the given time' do
    deleted_at = Time.utc(2026, 10, 1)
    early, late = Array.new(2) {Project.create_channel(@storage_id, {}, ip: 123)}
    other = Project.create_channel(@other_storage_id, {}, ip: 123)
    Timecop.freeze(deleted_at) {Project.delete_channel(@storage_id, early)}
    Timecop.freeze(deleted_at + 1.hour) do
      Project.delete_channel(@storage_id, late)
      Project.delete_channel(@other_storage_id, other)
    end

    assert_equal 1, Project.restore_for_storage_if_deleted_after(@storage_id, deleted_at + 30.minutes)
    assert_equal 'deleted', project_for(early).state
    assert_equal 'active', project_for(late).state
    assert_equal 'deleted', project_for(other).state
  end

  test 'increment_abuse adds to the score, except on frozen projects unless overridden' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    assert_equal 10, Project.increment_abuse(channel_id, 10)
    assert_equal 15, Project.increment_abuse(channel_id, 5)
    assert_equal 15, Project.abuse_score_for(channel_id)

    frozen_channel_id = Project.create_channel(@storage_id, {frozen: true}, ip: 123)
    assert_equal 0, Project.increment_abuse(frozen_channel_id, 10)
    assert_equal 10, Project.increment_abuse(frozen_channel_id, 10, true)
  end

  test 'reset_abuse zeroes the score, even one already at zero' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    Project.increment_abuse(channel_id, 10)
    assert_equal 0, Project.reset_abuse(channel_id)
    assert_equal 0, Project.abuse_score_for(channel_id)
    assert_equal 0, Project.reset_abuse(channel_id)
  end

  test 'abuse writes skip deleted projects but abuse_score_for still reads them' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    Project.increment_abuse(channel_id, 10)
    Project.delete_channel(@storage_id, channel_id)

    assert_raises(Projects::NotFound) {Project.increment_abuse(channel_id, 10)}
    assert_raises(Projects::NotFound) {Project.reset_abuse(channel_id)}
    assert_equal 10, Project.abuse_score_for(channel_id)
  end

  test 'remix_ancestry walks remix parents up to the given depth' do
    grandparent = Project.create_channel(@storage_id, {}, ip: 123)
    parent = Project.create_channel(@storage_id, {}, ip: 123, remix_parent_id: project_for(grandparent).id)
    child = Project.create_channel(@other_storage_id, {}, ip: 123, remix_parent_id: project_for(parent).id)

    assert_equal [parent], Project.remix_ancestry(child)
    assert_equal [parent, grandparent], Project.remix_ancestry(child, depth: 5)
    assert_equal [], Project.remix_ancestry(grandparent)
    assert_equal [], Project.remix_ancestry('garbage')
  end

  test 'storage_id_and_project_id resolves encrypted and uuid channel ids' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    project = project_for(channel_id)

    assert_equal [@storage_id, project.id], Project.storage_id_and_project_id(channel_id)
    assert_equal [@storage_id, project.id], Project.storage_id_and_project_id(project.uuid)
    assert_raises(ArgumentError) {Project.storage_id_and_project_id(SecureRandom.uuid)}
    assert_raises(ArgumentError) {Project.storage_id_and_project_id(nil)}
  end

  test 'channel_id_for returns the uuid only when project-uuid-in-url is on' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    project = project_for(channel_id)
    assert_equal channel_id, Project.channel_id_for(@storage_id, project.id)

    DCDO.stubs(:get).with('project-uuid-in-url', false).returns(true)
    assert_equal project.uuid, Project.channel_id_for(@storage_id, project.id)
    assert_queries(0) do
      assert_equal project.uuid, Project.channel_id_for(@storage_id, project.id, uuid: project.uuid)
    end
    assert_raises(ArgumentError) {Project.channel_id_for(nil, project.id)}
  end

  test 'channel_sharing_disabled? follows the owner setting for viewers who neither own, teach nor pair' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    viewer_id = create(:student).id
    Project.stubs(:teaches_student?).returns(false)
    refute Project.channel_sharing_disabled?(channel_id, @owner.id)

    Project.stubs(:get_user_sharing_disabled).with(@owner.id).returns(false)
    refute Project.channel_sharing_disabled?(channel_id, viewer_id)

    Project.stubs(:get_user_sharing_disabled).with(@owner.id).returns(true)
    assert Project.channel_sharing_disabled?(channel_id, viewer_id)

    Project.stubs(:teaches_student?).with(@owner.id, viewer_id).returns(true)
    refute Project.channel_sharing_disabled?(channel_id, viewer_id)

    assert Project.channel_sharing_disabled?('garbage', viewer_id)
  end

  test 'teacher_of_owner? asks whether the viewer teaches the project owner' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    Project.expects(:teaches_student?).with(@owner.id, 200).returns(true)
    assert Project.teacher_of_owner?(channel_id, 200)

    Project.expects(:teaches_student?).with(@owner.id, 300).returns(false)
    refute Project.teacher_of_owner?(channel_id, 300)
  end

  test 'users_paired_on_level? needs a channel token and a driver/navigator pair on its level' do
    project_id = project_for(Project.create_channel(@storage_id, {}, ip: 123)).id
    viewer = create(:student)
    level = create(:level)
    refute Project.users_paired_on_level?(project_id, viewer.id, @owner.id, @storage_id)

    channel_token = create(:channel_token, storage_app_id: project_id, storage_id: @storage_id, level: level)
    driver = create(:user_level, user: @owner, level: level)
    navigator = create(:user_level, user: viewer, level: level)
    refute Project.users_paired_on_level?(project_id, viewer.id, @owner.id, @storage_id)

    PairedUserLevel.create!(driver_user_level_id: driver.id, navigator_user_level_id: navigator.id)
    assert Project.users_paired_on_level?(project_id, viewer.id, @owner.id, @storage_id)
    refute Project.users_paired_on_level?(project_id, @owner.id, viewer.id, @storage_id)

    [channel_token, driver, navigator].each(&:destroy)
    assert Project.users_paired_on_level?(project_id, viewer.id, @owner.id, @storage_id)
  end

  test 'plain ActiveRecord queries replace the Sequel dataset helpers' do
    active = project_for(Project.create_channel(@storage_id, {}, ip: 123))
    deleted_channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    Project.delete_channel(@storage_id, deleted_channel_id)
    deleted = project_for(deleted_channel_id)
    other = project_for(Project.create_channel(@other_storage_id, {}, ip: 123))

    # Projects#get_active_projects
    assert_equal [active], Project.where(storage_id: @storage_id).active.to_a
    # Projects#get_projects_with_state
    assert_equal [deleted], Project.where(storage_id: @storage_id, state: 'deleted').to_a
    # Projects#get_all_project_ids
    assert_equal [active.id, deleted.id], Project.where(storage_id: @storage_id).order(:id).pluck(:id)
    # Projects.get_by_ids
    assert_equal [active, other], Project.where(id: [active.id, other.id]).order(:id).to_a
    # Callers index Sequel rows by column symbol; records answer the same way.
    assert_equal active.value, active[:value]
  end

  test 'hot paths issue as many queries as their Sequel versions' do
    channel_id = Project.create_channel(@storage_id, {}, ip: 123)
    assert_queries(1) {Project.get_channel(@storage_id, channel_id)}
    assert_queries(2) {Project.update_channel(@storage_id, channel_id, {}, '127.0.0.1')}
    assert_queries(1) {Project.abuse_score_for(channel_id)}
    assert_queries(1) {Project.delete_channel(@storage_id, channel_id)}
  end

  private def project_for(channel_id)
    Project.find(storage_decrypt_channel_id(channel_id).last)
  end
end

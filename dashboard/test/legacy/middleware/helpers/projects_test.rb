require 'test_helper'
require 'testing/projects_backends'

class ProjectsTest < ActiveSupport::TestCase
  include ProjectsBackends

  setup do
    @owner_id = create(:student).id
    @storage_id = create_storage_id_for_user(@owner_id)
    @other_storage_id = create_storage_id_for_user(create(:student).id)
    @anonymous_storage_id = create_storage_id_for_user
    @projects = Projects.new(@storage_id)
  end

  test 'create returns an encrypted channel id unless project-uuid-in-url is on' do
    channel_id = Projects.new(@anonymous_storage_id).create({projectType: 'artist'}, ip: 123)
    refute_match Project::UUID_FORMAT, channel_id
    assert_equal @anonymous_storage_id, storage_decrypt_channel_id(channel_id).first

    DCDO.stubs(:get).with('project-uuid-in-url', false).returns(true)
    channel_id = Projects.new(@anonymous_storage_id).create({projectType: 'artist'}, ip: 123)
    assert_match Project::UUID_FORMAT, channel_id
    assert_equal @anonymous_storage_id, row_for(channel_id)[:storage_id]
  end

  test 'create writes every column' do
    parent_id = row_for(@projects.create({}, ip: 123))[:id]
    published_at = Time.utc(2026, 1, 2, 3, 4, 5)

    row = row_for(
      @projects.create(
        {'name' => 'remix'},
        ip: 123,
        type: 'applab',
        published_at: published_at,
        remix_parent_id: parent_id,
        standalone: false
      )
    )

    assert_equal({'name' => 'remix'}, JSON.parse(row[:value]))
    assert_equal '123', row[:updated_ip]
    assert_equal 'active', row[:state]
    assert_equal 0, row[:abuse_score]
    assert_equal 'applab', row[:project_type]
    assert_equal published_at, row[:published_at]
    assert_equal parent_id, row[:remix_parent_id]
    assert_equal false, row[:skip_content_moderation]
    assert_equal false, row[:standalone]
    assert_equal row[:created_at], row[:updated_at]
    assert_match Project::UUID_FORMAT, row[:uuid]
  end

  test 'create prefers type over the level project type' do
    level = mock
    level.expects(:project_type).never
    channel_id = @projects.create({}, ip: 123, type: 'actual_type', level: level)
    assert_equal 'actual_type', @projects.get(channel_id)[:projectType]
  end

  test 'create falls back to the level project type' do
    level = mock
    level.expects(:project_type).returns('test_type').once
    channel_id = @projects.create({}, ip: 123, level: level)
    assert_equal 'test_type', @projects.get(channel_id)[:projectType]
  end

  test 'create allows a nil project type' do
    assert_nil @projects.get(@projects.create({}, ip: 123))[:projectType]
  end

  test 'create validates the thumbnail url' do
    assert_raises(Projects::ValidationError) {@projects.create({'thumbnailUrl' => 'bad.com'}, ip: 123)}

    thumbnail_url = '/v3/files/parentChannelId123/.metadata/thumbnail.png'
    channel_id = @projects.create({'thumbnailUrl' => thumbnail_url}, ip: 123)
    assert_equal thumbnail_url, @projects.get(channel_id)['thumbnailUrl']
  end

  test 'get hides age-restricted projects made without an account from other storage' do
    signed_out = Projects.new(@anonymous_storage_id)

    channel_id = signed_out.create({projectType: 'applab'}, ip: 123)
    assert_raises(Projects::NotFound) {@projects.get(channel_id)}
    signed_out.get(channel_id)

    @projects.get(signed_out.create({projectType: 'artist'}, ip: 123))
    signed_out.get(@projects.create({projectType: 'applab'}, ip: 123))
  end

  test 'get raises NotFound for channel ids it cannot resolve' do
    assert_raises(Projects::NotFound) {@projects.get('garbage')}
    assert_raises(Projects::NotFound) {@projects.get(SecureRandom.uuid)}
  end

  test 'get reports isOwner only to the owning storage' do
    channel_id = @projects.create({}, ip: 123)
    assert_equal true, @projects.get(channel_id)[:isOwner]
    assert_equal false, Projects.new(@other_storage_id).get(channel_id)[:isOwner]
  end

  test 'get returns four-byte characters intact' do
    channel_id = @projects.create({'emoticon' => "\u{1F44D}"}, ip: 123)
    assert_equal "\u{1F44D}", @projects.get(channel_id)['emoticon']
  end

  test 'update moves updatedAt but not createdAt' do
    created_at = Time.utc(2026, 10, 1, 12)
    channel_id = Timecop.freeze(created_at) {@projects.create({'abc' => 123}, ip: 123)}
    value = @projects.get(channel_id)
    assert_equal created_at, value[:createdAt]
    assert_equal created_at, value[:updatedAt]

    updated_at = created_at + 1.day
    returned = Timecop.freeze(updated_at) {@projects.update(channel_id, {'abc' => 456}, '127.0.0.1')}
    assert_equal 456, returned['abc']
    assert_equal channel_id, returned[:id]
    assert_equal true, returned[:isOwner]
    assert_equal updated_at, returned[:updatedAt]

    value = @projects.get(channel_id)
    assert_equal 456, value['abc']
    assert_equal created_at, value[:createdAt]
    assert_equal updated_at, value[:updatedAt]
  end

  test 'update sets project_type only when given' do
    channel_id = @projects.create({}, ip: 123)
    @projects.update(channel_id, {}, '127.0.0.1')
    assert_nil row_for(channel_id)[:project_type]

    @projects.update(channel_id, {}, '127.0.0.1', project_type: 'gamelab')
    assert_equal 'gamelab', row_for(channel_id)[:project_type]
  end

  test 'update gives a project without a uuid one' do
    channel_id = @projects.create({}, ip: 123)
    update_rows(:projects, {id: row_for(channel_id)[:id]}, {uuid: nil})

    @projects.update(channel_id, {}, '127.0.0.1')
    assert_match Project::UUID_FORMAT, row_for(channel_id)[:uuid]
  end

  test 'update validates the thumbnail url' do
    channel_id = @projects.create({}, ip: 123)
    assert_raises(Projects::ValidationError) {@projects.update(channel_id, {'thumbnailUrl' => 'bad.com'}, '127.0.0.1')}

    thumbnail_url = "/v3/files/#{channel_id}/.metadata/thumbnail.png"
    assert_equal thumbnail_url, @projects.update(channel_id, {'thumbnailUrl' => thumbnail_url}, '127.0.0.1')['thumbnailUrl']
  end

  test 'update skips the profanity check when the name is unchanged' do
    channel_id = @projects.create({'name' => 'old'}, ip: 123)
    ShareFiltering.expects(:find_name_failure).never
    @projects.update(channel_id, {'name' => 'old'}, '127.0.0.1')
  end

  test 'update rejects a new name that fails the profanity check' do
    channel_id = @projects.create({'name' => 'old'}, ip: 123)
    ShareFiltering.expects(:find_name_failure).with('rude', 'fr').
      returns(ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'rude'))

    error = assert_raises(ProfanityPrivacyError) do
      @projects.update(channel_id, {'name' => 'rude'}, '127.0.0.1', locale: 'fr')
    end
    assert_equal 'rude', error.flagged_text
    assert_equal 'old', @projects.get(channel_id)['name']
  end

  test 'delete hides a project until restore' do
    channel_id = @projects.create({projectType: 'applab'}, ip: 123)

    assert_equal true, @projects.delete(channel_id)
    assert_equal 'deleted', row_for(channel_id)[:state]
    assert_raises(Projects::NotFound) {@projects.get(channel_id)}

    assert_equal true, @projects.restore(channel_id)
    assert_equal 'active', row_for(channel_id)[:state]
    @projects.get(channel_id)
  end

  test 'writes require the owning storage' do
    channel_id = @projects.create({}, ip: 123)
    other = Projects.new(@other_storage_id)

    assert_raises(Projects::NotFound) {other.update(channel_id, {}, '127.0.0.1')}
    assert_raises(Projects::NotFound) {other.delete(channel_id)}
    assert_raises(Projects::NotFound) {other.restore(channel_id)}
    assert_raises(Projects::NotFound) {other.publish(channel_id, 'applab', nil)}
    assert_raises(Projects::NotFound) {other.unpublish(channel_id)}
    assert_equal 'active', row_for(channel_id)[:state]
  end

  test 'updates skip deleted projects' do
    channel_id = @projects.create({}, ip: 123)
    @projects.delete(channel_id)

    assert_raises(Projects::NotFound) {@projects.update(channel_id, {}, '127.0.0.1')}
    assert_raises(Projects::NotFound) {@projects.publish(channel_id, 'applab', nil)}
    assert_raises(Projects::NotFound) {@projects.unpublish(channel_id)}
  end

  test 'publish and unpublish set and clear published_at' do
    channel_id = @projects.create({}, ip: 123)
    published_at = Time.utc(2026, 10, 2)
    assert_equal 1, Timecop.freeze(published_at) {@projects.publish(channel_id, 'applab', nil)}
    assert_equal 'applab', row_for(channel_id)[:project_type]
    assert_equal published_at, row_for(channel_id)[:published_at]

    @projects.unpublish(channel_id)
    assert_nil row_for(channel_id)[:published_at]
    # MySQL reports matched rather than changed rows (FOUND_ROWS), so a no-op unpublish is not NotFound.
    @projects.unpublish(channel_id)
  end

  test 'project_type_from_channel_id looks in the column, then the value, then the level' do
    assert_equal 'unknown', @projects.project_type_from_channel_id(@projects.create({}, ip: 123))
    assert_equal 'applab', @projects.project_type_from_channel_id(@projects.create({}, ip: 123, type: 'applab'))
    assert_equal 'gamelab', @projects.project_type_from_channel_id(@projects.create({projectType: 'gamelab'}, ip: 123))
    assert_equal 'weblab', @projects.project_type_from_channel_id(@projects.create({level: '/projects/weblab'}, ip: 123))
  end

  test 'to_a lists undeleted projects and skips malformed values' do
    kept = @projects.create({'name' => 'kept'}, ip: 123)
    @projects.delete(@projects.create({}, ip: 123))
    insert_row(:projects, {storage_id: @storage_id, value: '{', updated_ip: '127.0.0.1', updated_at: Time.now})
    Projects.new(@other_storage_id).create({}, ip: 123)

    channels = @projects.to_a
    assert_equal [kept], channels.pluck(:id)
    assert_equal 'kept', channels.first['name']
    assert_equal true, channels.first[:isOwner]
  end

  test 'most_recent skips hidden and frozen projects unless asked for hidden ones' do
    start = Time.utc(2026, 10, 1)
    abc = Timecop.freeze(start) {@projects.create({level: 'projects/abc'}, ip: 123)}
    xyz = Timecop.freeze(start + 1.minute) {@projects.create({level: 'projects/xyz'}, ip: 123)}
    hidden = Timecop.freeze(start + 2.minutes) {@projects.create({hidden: true, level: 'projects/abc'}, ip: 123)}
    Timecop.freeze(start + 3.minutes) {@projects.create({frozen: true, level: 'projects/xyz'}, ip: 123)}
    Timecop.freeze(start + 4.minutes) {@projects.create({}, ip: 123)}

    assert_equal abc, @projects.most_recent('abc')
    assert_equal xyz, @projects.most_recent('xyz')
    assert_equal hidden, @projects.most_recent('abc', true)
    assert_nil Projects.new(@other_storage_id).most_recent('abc')
  end

  test 'listing methods select by storage and state' do
    start = Time.utc(2026, 10, 1)
    older, newer = [start, start + 1.minute].map {|time| Timecop.freeze(time) {row_for(@projects.create({}, ip: 123))[:id]}}
    deleted_channel_id = @projects.create({}, ip: 123)
    @projects.delete(deleted_channel_id)
    deleted = row_for(deleted_channel_id)[:id]
    other = row_for(Projects.new(@other_storage_id).create({}, ip: 123))[:id]

    assert_equal [older, newer], @projects.get_active_projects.pluck(:id).sort
    assert_equal [newer, older], @projects.get_projects_with_state(state: 'active').pluck(:id)
    assert_equal [deleted], @projects.get_projects_with_state(state: 'deleted').pluck(:id)
    assert_equal [older, newer, deleted], @projects.get_all_project_ids.sort
    assert_equal [older, other], Projects.get_by_ids([older, other]).pluck(:id).sort
  end

  test 'soft_delete_all deletes only this storage and counts only undeleted projects' do
    other_channel_id = Projects.new(@other_storage_id).create({}, ip: 123)
    channel_ids = Array.new(2) {@projects.create({}, ip: 123)}
    @projects.delete(channel_ids.first)

    deleted_at = Time.utc(2026, 10, 3)
    assert_equal 1, Timecop.freeze(deleted_at) {@projects.soft_delete_all}
    assert_equal(%w(deleted deleted), channel_ids.map {|channel_id| row_for(channel_id)[:state]})
    assert_equal deleted_at, row_for(channel_ids.last)[:updated_at]
    assert_equal 'active', row_for(other_channel_id)[:state]
  end

  test 'restore_if_deleted_after restores projects deleted since the given time' do
    deleted_at = Time.utc(2026, 10, 1)
    early, late = Array.new(2) {@projects.create({}, ip: 123)}
    other_projects = Projects.new(@other_storage_id)
    other = other_projects.create({}, ip: 123)
    Timecop.freeze(deleted_at) {@projects.delete(early)}
    Timecop.freeze(deleted_at + 1.hour) do
      @projects.delete(late)
      other_projects.delete(other)
    end

    assert_equal 1, @projects.restore_if_deleted_after(deleted_at + 30.minutes)
    assert_equal 'deleted', row_for(early)[:state]
    assert_equal 'active', row_for(late)[:state]
    assert_equal 'deleted', row_for(other)[:state]
  end

  test 'increment_abuse adds to the score, except on frozen projects unless overridden' do
    channel_id = @projects.create({}, ip: 123)
    assert_equal 10, @projects.increment_abuse(channel_id, 10)
    assert_equal 15, @projects.increment_abuse(channel_id, 5)
    assert_equal 15, Projects.get_abuse(channel_id)

    frozen_channel_id = @projects.create({frozen: true}, ip: 123)
    assert_equal 0, @projects.increment_abuse(frozen_channel_id, 10)
    assert_equal 10, @projects.increment_abuse(frozen_channel_id, 10, true)
  end

  test 'reset_abuse zeroes the score, even one already at zero' do
    channel_id = @projects.create({}, ip: 123)
    @projects.increment_abuse(channel_id, 10)
    assert_equal 0, @projects.reset_abuse(channel_id)
    assert_equal 0, Projects.get_abuse(channel_id)
    assert_equal 0, @projects.reset_abuse(channel_id)
  end

  test 'abuse writes skip deleted projects but get_abuse still reads them' do
    channel_id = @projects.create({}, ip: 123)
    @projects.increment_abuse(channel_id, 10)
    @projects.delete(channel_id)

    assert_raises(Projects::NotFound) {@projects.increment_abuse(channel_id, 10)}
    assert_raises(Projects::NotFound) {@projects.reset_abuse(channel_id)}
    assert_equal 10, Projects.get_abuse(channel_id)
  end

  test 'remix_ancestry walks remix parents up to the given depth' do
    grandparent = @projects.create({}, ip: 123)
    parent = @projects.create({}, ip: 123, remix_parent_id: row_for(grandparent)[:id])
    child = Projects.new(@other_storage_id).create({}, ip: 123, remix_parent_id: row_for(parent)[:id])

    assert_equal [parent], Projects.remix_ancestry(child)
    assert_equal [parent, grandparent], Projects.remix_ancestry(child, depth: 5)
    assert_equal [], Projects.remix_ancestry(grandparent)
    assert_equal [], Projects.remix_ancestry('garbage')
  end

  test 'users_paired_on_level? needs a channel token and a driver/navigator pair on its level' do
    project_id = row_for(@projects.create({}, ip: 123))[:id]
    navigator_id = create(:student).id
    level_id = 1
    refute @projects.users_paired_on_level?(project_id, navigator_id, @owner_id, @storage_id)

    now = Time.now
    insert_row(:channel_tokens, {storage_app_id: project_id, storage_id: @storage_id, level_id: level_id, deleted_at: now})
    driver_level = insert_row(:user_levels, {user_id: @owner_id, level_id: level_id, deleted_at: now})
    navigator_level = insert_row(:user_levels, {user_id: navigator_id, level_id: level_id, deleted_at: now})
    refute @projects.users_paired_on_level?(project_id, navigator_id, @owner_id, @storage_id)

    insert_row(
      :paired_user_levels,
      {driver_user_level_id: driver_level, navigator_user_level_id: navigator_level, created_at: now, updated_at: now}
    )
    # Soft-deleted channel tokens and user levels count; Sequel never filtered on deleted_at.
    assert @projects.users_paired_on_level?(project_id, navigator_id, @owner_id, @storage_id)
    refute @projects.users_paired_on_level?(project_id, @owner_id, navigator_id, @storage_id)
  end

  test 'get_sharing_disabled follows the owner setting for viewers who neither own, teach nor pair' do
    channel_id = @projects.create({}, ip: 123)
    viewer_id = create(:student).id
    Projects.any_instance.stubs(:teaches_student?).returns(false)
    refute @projects.get_sharing_disabled(channel_id, @owner_id)

    Projects.any_instance.stubs(:get_user_sharing_disabled).with(@owner_id).returns(false)
    refute @projects.get_sharing_disabled(channel_id, viewer_id)

    Projects.any_instance.stubs(:get_user_sharing_disabled).with(@owner_id).returns(true)
    assert @projects.get_sharing_disabled(channel_id, viewer_id)

    Projects.any_instance.stubs(:teaches_student?).with(@owner_id, viewer_id).returns(true)
    refute @projects.get_sharing_disabled(channel_id, viewer_id)

    assert @projects.get_sharing_disabled('garbage', viewer_id)
  end

  test 'get_is_teacher_of_project_owner asks whether the viewer teaches the project owner' do
    channel_id = @projects.create({projectType: 'spritelab'}, ip: 123)
    @projects.expects(:teaches_student?).with(@owner_id, 200).returns(true)
    assert @projects.get_is_teacher_of_project_owner(channel_id, 200)

    @projects.expects(:teaches_student?).with(@owner_id, 300).returns(false)
    refute @projects.get_is_teacher_of_project_owner(channel_id, 300)
  end

  # Reads the row through the backend under test: a Sequel hash or a Project, both indexed by column.
  private def row_for(channel_id)
    Projects.get_by_ids(get_storage_id_and_project_id(channel_id).last).first
  end
end

class ProjectsActiveRecordTest < ProjectsTest
  self.projects_backend = :active_record
end

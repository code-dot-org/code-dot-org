require_relative '../middleware_test_helper'
require_relative '../../../middleware/helpers/projects'
require_relative '../../../../../shared/middleware/helpers/storage_id'

class ProjectsTest < Minitest::Test
  include SetupTest

  def test_get_anonymous_age_restricted_app
    signedout_storage_id = create_storage_id_for_user(nil)
    signedin_storage_id = create_storage_id_for_user(20)

    # Create an applab project as signed out user
    # Other users should not be able to access app
    channel_id = Projects.new(signedout_storage_id).create({projectType: 'applab'}, ip: 123)
    assert_raises Projects::NotFound do
      Projects.new(signedin_storage_id).get(channel_id)
    end

    # can still get your own channel
    Projects.new(signedout_storage_id).get(channel_id)

    # Create an artist project as signed out user
    # Other users should be able to access it
    channel_id = Projects.new(signedout_storage_id).create({projectType: 'artist'}, ip: 123)
    Projects.new(signedin_storage_id).get(channel_id)

    # Create an applab project as a signed in user
    # Other users should be able to access app
    channel_id = Projects.new(signedin_storage_id).create({projectType: 'applab'}, ip: 123)
    Projects.new(signedout_storage_id).get(channel_id)
  end

  def test_users_paired_on_level_when_no_level
    signedin_storage_id = create_storage_id_for_user(123)
    project = Projects.new(signedin_storage_id)

    mock_where = mock
    mock_where.expects(:first).returns(nil).once
    mock_table = mock
    mock_table.expects(:where).returns(mock_where).once
    DASHBOARD_DB.expects(:[]).with(:channel_tokens).returns(mock_table).once

    # If there is no level associated with the channel, it's not possible for it to be paired.
    refute project.users_paired_on_level?(12345, 123, 124, 67890)
  end

  def test_users_paired_on_level_with_level_not_paired
    signedin_storage_id = create_storage_id_for_user(123)
    project = Projects.new(signedin_storage_id)

    mock_where = mock
    mock_where.expects(:first).returns(nil).once
    mock_table = mock
    mock_table.expects(:where).returns(mock_where).once
    DASHBOARD_DB.expects(:[]).with(:paired_user_levels).returns(mock_table).once

    mock_select = mock
    mock_select.expects(:where).returns(123).twice
    mock_table = mock
    mock_table.expects(:select).returns(mock_select).twice
    DASHBOARD_DB.expects(:[]).with(:user_levels).returns(mock_table).once

    mock_where = mock
    mock_where.expects(:first).returns({level_id: 123}).once
    mock_table = mock
    mock_table.expects(:where).returns(mock_where).once
    DASHBOARD_DB.expects(:[]).with(:channel_tokens).returns(mock_table).once

    # If there is no paired_user_level, it's not possible for it to be paired.
    refute project.users_paired_on_level?(12345, 123, 124, 67890)
  end

  def test_users_paired_on_level_with_level_paired
    signedin_storage_id = create_storage_id_for_user(123)
    project = Projects.new(signedin_storage_id)

    mock_where = mock
    mock_where.expects(:first).returns({paired: true}).once
    mock_table = mock
    mock_table.expects(:where).returns(mock_where).once
    DASHBOARD_DB.expects(:[]).with(:paired_user_levels).returns(mock_table).once

    mock_select = mock
    mock_select.expects(:where).returns(123).twice
    mock_table = mock
    mock_table.expects(:select).returns(mock_select).twice
    DASHBOARD_DB.expects(:[]).with(:user_levels).returns(mock_table).once

    mock_where = mock
    mock_where.expects(:first).returns({level_id: 123}).once
    mock_table = mock
    mock_table.expects(:where).returns(mock_where).once
    DASHBOARD_DB.expects(:[]).with(:channel_tokens).returns(mock_table).once

    # If there is a paired_user_level, then the level was paired.
    assert project.users_paired_on_level?(12345, 123, 124, 67890)
  end

  def test_derive_project_type
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)

    # Create without type
    typeless = project.create({}, ip: 123)
    assert_equal 'unknown', project.project_type_from_channel_id(typeless)

    # Create with type argument
    type_in_column = project.create({}, ip: 123, type: 'applab')
    assert_equal 'applab', project.project_type_from_channel_id(type_in_column)

    # Create with type in value JSON blob
    type_in_json = project.create({projectType: 'gamelab'}, ip: 123)
    assert_equal 'gamelab', project.project_type_from_channel_id(type_in_json)

    # Create with type that can be derived from the level property in the JSON blob
    type_in_level = project.create({level: '/projects/weblab'}, ip: 123)
    assert_equal 'weblab', project.project_type_from_channel_id(type_in_level)
  end

  def test_content_moderation_disabled?
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)

    # Create a new typeless project
    # content_moderation_disabled should be false by default on project creation for projects of any type.
    new_project_channel_id = project.create({}, ip: 123)
    assert_equal false, project.content_moderation_disabled?(new_project_channel_id)
  end

  def test_set_content_moderation
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)

    # Create a new typeless project
    # skip_content_moderation should be false by default on project creation for projects of any type.
    new_project_channel_id = project.create({}, ip: 123)
    assert_equal false, project.content_moderation_disabled?(new_project_channel_id)

    # Set content_moderation_disabled to true.
    project.set_content_moderation(new_project_channel_id, true)
    assert_equal true, project.content_moderation_disabled?(new_project_channel_id)

    # Set skip_content_moderation back to false.
    project.set_content_moderation(new_project_channel_id, false)
    assert_equal false, project.content_moderation_disabled?(new_project_channel_id)
  end

  def test_restore
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)

    # Create a new project
    new_project_channel_id = project.create({projectType: 'applab'}, ip: 123)

    # Delete the project
    assert_equal true, project.delete(new_project_channel_id)

    # Should not be able to fetch deleted project
    assert_raises Projects::NotFound do
      project.get(new_project_channel_id)
    end

    # Restore project
    assert_equal true, project.restore(new_project_channel_id)

    # Can get restored project
    project.get(new_project_channel_id)
  end

  def test_buffer_abuse_score
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)

    # Create a new typeless project
    # abuse_score should be 0 by default on project creation for projects of any type.
    new_project_channel_id = project.create({}, ip: 123)
    assert_equal 0, Projects.get_abuse(new_project_channel_id)
    project.buffer_abuse_score(new_project_channel_id)
    assert_equal(-50, Projects.get_abuse(new_project_channel_id))
  end

  def test_uses_type_over_level_project_type
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)

    mock_level = mock
    mock_level.expects(:project_type).returns('test_type').never

    channel_id = project.create({}, ip: 123, type: 'actual_type', level: mock_level)
    assert_equal 'actual_type', project.get(channel_id)[:projectType]
  end

  def test_uses_level_project_type_if_no_type
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)

    mock_level = mock
    mock_level.expects(:project_type).returns('test_type').once

    channel_id = project.create({}, ip: 123,  level: mock_level)
    assert_equal 'test_type', project.get(channel_id)[:projectType]
  end

  def test_can_have_nil_project_type
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)
    channel_id = project.create({}, ip: 123)
    assert_nil project.get(channel_id)[:projectType]
  end

  def test_project_throws_on_update_with_invalid_thumbnail_url
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)
    channel_id = project.create({}, ip: 123)

    assert_raises Projects::ValidationError do
      project.update(channel_id, {'thumbnailUrl' => 'bad.com'}, 123)
    end
  end

  def test_project_update_succeeds_with_valid_thumbnail_url
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)
    channel_id = project.create({}, ip: 123)

    expected_thumbnail_url = "/v3/files/#{channel_id}/.metadata/thumbnail.png"
    updated_value = project.update(channel_id, {'thumbnailUrl' => expected_thumbnail_url}, 123)
    assert_equal expected_thumbnail_url, updated_value['thumbnailUrl']
  end

  def test_project_throws_on_create_with_invalid_thumbnail_url
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)

    assert_raises Projects::ValidationError do
      project.create({'thumbnailUrl' => 'bad.com'}, ip: 123)
    end
  end

  def test_project_create_succeeds_with_valid_thumbnail_url
    signedin_storage_id = create_storage_id_for_user(20)
    project = Projects.new(signedin_storage_id)

    expected_thumbnail_url = '/v3/files/parentChannelId123/.metadata/thumbnail.png'
    channel_id = project.create({'thumbnailUrl' => expected_thumbnail_url}, ip: 123)

    assert_equal expected_thumbnail_url, project.get(channel_id)['thumbnailUrl']
  end
end

require 'test_helper'

class Services::ChannelIdTest < ActiveSupport::TestCase
  test 'storage_and_project_id_from_token supports uuid' do
    project = create(:project)

    storage_id, project_id = Services::ChannelId.storage_and_project_id_from_token(project.uuid)

    assert_equal project.storage_id, storage_id
    assert_equal project.id, project_id
  end

  test 'storage_and_project_id_from_token supports legacy channel tokens' do
    project = create(:project)
    legacy_channel = storage_encrypt_channel_id(project.storage_id, project.id)

    storage_id, project_id = Services::ChannelId.storage_and_project_id_from_token(legacy_channel)

    assert_equal project.storage_id, storage_id
    assert_equal project.id, project_id
  end

  test 'channel_id_for returns uuid when present' do
    project = create(:project)

    assert_equal project.uuid, Services::ChannelId.channel_id_for(storage_id: project.storage_id, project_id: project.id)
  end

  test 'channel_id_for encrypts when uuid is missing' do
    project = create(:project)
    project.update_column(:uuid, nil)

    channel = Services::ChannelId.channel_id_for(storage_id: project.storage_id, project_id: project.id)
    storage_id, project_id = storage_decrypt_channel_id(channel)

    assert_equal project.storage_id, storage_id
    assert_equal project.id, project_id
  end

  test 'project_from_channel_id! raises on invalid channel id' do
    assert_raises(ActiveRecord::RecordNotFound) do
      Services::ChannelId.project_from_channel_id!('invalid-channel')
    end
  end
end

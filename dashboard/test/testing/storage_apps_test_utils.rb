require_relative '../../../shared/middleware/helpers/storage_apps'

# Tools that help test storage apps
# To be included in any dashboard test that needs them.
module StorageAppsTestUtils
  # @param [User] owner - may be nil for anonymous channel
  def with_channel_for(owner)
    with_storage_id_for owner do |storage_id|
      encrypted_channel_id = StorageApps.new(storage_id).create({projectType: 'applab'}, ip: 123)
      _, storage_app_id = storage_decrypt_channel_id encrypted_channel_id
      yield storage_app_id, storage_id
    ensure
      storage_apps.where(id: storage_app_id).delete if storage_app_id
    end
  end

  # @param [User] user - may be nil for anonymous storage id
  def with_storage_id_for(user)
    owns_storage_id = false
    user_id = user&.id

    storage_id = user_storage_ids.where(user_id: user_id).first&.[](:id)
    unless storage_id
      storage_id = user_storage_ids.insert(user_id: user_id)
      owns_storage_id = true
    end

    yield storage_id
  ensure
    user_storage_ids.where(id: storage_id).delete if owns_storage_id
  end

  def with_anonymous_channel(&block)
    with_channel_for(nil, &block)
  end

  def storage_apps
    PEGASUS_DB[:storage_apps]
  end

  def user_storage_ids
    PEGASUS_DB[:user_storage_ids]
  end
end

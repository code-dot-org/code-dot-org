require_relative '../../../shared/middleware/helpers/storage_apps'

# Tools that help test storage apps
# To be included in any dashboard test that needs them.
module StorageAppsTestUtils
  def with_channel_for(owner)
    with_storage_id_for owner do |storage_id|
      encrypted_channel_id = StorageApps.new(storage_id).create({projectType: 'applab'}, ip: 123)
      _, id = storage_decrypt_channel_id encrypted_channel_id
      yield id, storage_id
    ensure
      storage_apps.where(id: id).delete if id
    end
  end

  def with_storage_id_for(user)
    owns_storage_id = false

    storage_id = user_storage_ids.where(user_id: user.id).first&.[](:id)
    unless storage_id
      storage_id = user_storage_ids.insert(user_id: user.id)
      owns_storage_id = true
    end

    yield storage_id
  ensure
    user_storage_ids.where(id: storage_id).delete if owns_storage_id
  end

  def storage_apps
    PEGASUS_DB[:storage_apps]
  end

  def user_storage_ids
    PEGASUS_DB[:user_storage_ids]
  end
end

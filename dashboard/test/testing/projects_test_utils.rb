require_relative '../../../dashboard/legacy/middleware/helpers/projects'
require_relative '../../../shared/middleware/helpers/storage_id'

# Tools that help test projects
# To be included in any dashboard test that needs them.
module ProjectsTestUtils
  # @param [User] owner - may be nil for anonymous channel
  def with_channel_for(owner)
    with_storage_id_for owner do |storage_id|
      encrypted_channel_id = Projects.new(storage_id).create({projectType: 'applab'}, ip: 123)
      _, project_id = storage_decrypt_channel_id encrypted_channel_id
      yield project_id, storage_id
    ensure
      projects_table.where(id: project_id).delete if project_id
    end
  end

  # @param [User] user - may be nil for anonymous storage id
  def with_storage_id_for(user)
    owns_storage_id = false
    user_id = user&.id

    storage_id = storage_id_for_user_id(user_id)
    unless storage_id
      storage_id = create_storage_id_for_user(user_id)
      owns_storage_id = true
    end

    yield storage_id
  ensure
    delete_storage_id_for_user(user_id) if owns_storage_id
  end

  def with_anonymous_channel(&block)
    with_channel_for(nil, &block)
  end

  def projects_table
    Projects.table
  end
end

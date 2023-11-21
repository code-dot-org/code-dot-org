# == Schema Information
#
# Table name: projects
#
#  id                      :integer          not null, primary key
#  storage_id              :integer
#  value                   :text(16777215)
#  updated_at              :datetime         not null
#  updated_ip              :string(39)       not null
#  state                   :string(50)       default("active"), not null
#  created_at              :datetime
#  abuse_score             :integer
#  project_type            :string(255)
#  published_at            :datetime
#  standalone              :boolean          default(TRUE)
#  remix_parent_id         :integer
#  skip_content_moderation :boolean
#
# Indexes
#
#  storage_apps_project_type_index      (project_type)
#  storage_apps_published_at_index      (published_at)
#  storage_apps_standalone_index        (standalone)
#  storage_apps_storage_id_index        (storage_id)
#  storage_apps_storage_id_state_index  (storage_id,state)
#
class Project < ApplicationRecord
  belongs_to :project_storage, foreign_key: 'storage_id', optional: true
  # Note: owner is nil for projects that are owned by users without an account
  has_one :owner, class_name: 'User', through: :project_storage, source: :user
  has_one :channel_token

  # Finds a project by channel id. Like `find`, this method raises an
  # ActiveRecord::RecordNotFound error if the corresponding project cannot
  # be found.
  def self.find_by_channel_id(channel_id)
    begin
      _, project_id = storage_decrypt_channel_id(channel_id)
    rescue
      raise ActiveRecord::RecordNotFound.new("Invalid channel_id: #{channel_id}")
    end

    Project.find(project_id)
  end

  def channel_id
    storage_encrypt_channel_id(storage_id, id)
  end

  # Returns the user_id of the owner of this project. Returns nil if the project
  # is owned by a user without an account. This should always return the same
  # value as project.owner.id but is more efficient if only the user_id is needed.
  def owner_id
    project_storage.user_id
  end

  def apply_project_age_publish_limits?
    # Four cases where we override and always allow publishing:
    # 1) project was created via free play levels on Hour of Code tutorials
    # 2) admin who has project validator permissions
    # 3) user teaches a section with followers added within the past year
    # 4) user is in a section, and was added within past year
    return false if channel_token&.script&.hoc?
    return false if owner&.permission?(UserPermission::PROJECT_VALIDATOR)
    return false if owner&.followers&.any? {|follower| follower.created_at > Time.now - 1.year}
    return false if owner&.followeds&.any? {|followed| followed.created_at > Time.now - 1.year}
    true
  end

  def owner_existed_long_enough_to_publish?
    return false unless owner
    Time.now > owner.created_at + 7.days
  end

  def existed_long_enough_to_publish?
    Time.now > created_at + 30.minutes
  end
end

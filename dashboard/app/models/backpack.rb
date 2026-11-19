# == Schema Information
#
# Table name: backpacks
#
#  id             :bigint           not null, primary key
#  user_id        :integer          not null
#  storage_app_id :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  game_id        :integer
#
# Indexes
#
#  index_backpacks_on_storage_app_id       (storage_app_id) UNIQUE
#  index_backpacks_on_user_id_and_game_id  (user_id,game_id) UNIQUE
#
class Backpack < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :game, optional: true

  # The projects table used to be named storage_apps. This column has not been renamed
  # to reflect the new table name, so an alias is used to clarify which table this ID maps to.
  alias_attribute :project_id, :storage_app_id

  # A backpack with no game_id belongs to no lab.
  def self.find_or_create(user_id, game_id, ip)
    backpack = find_by(user_id: user_id, game_id: game_id)
    return backpack if backpack
    return create_with_project(user_id, game_id, ip) if game_id

    # The unique index on (user_id, game_id) does not constrain rows whose game_id
    # is NULL, because MySQL permits any number of them. Serialize creation of the
    # lab-independent backpack on the user row instead, and look again once we hold
    # the lock in case another request created it first.
    User.find(user_id).with_lock do
      find_by(user_id: user_id, game_id: nil) || create_with_project(user_id, nil, ip)
    end
  end

  def channel
    get_project_channel_id(storage_id_for_user_id(user_id), project_id)
  end

  # Channels of every backpack of one user, keyed by app type, with one storage
  # id lookup and one projects read shared by all of them.
  def self.channels_by_app_type(user_id)
    backpacks = where(user_id: user_id).order(:id).includes(:game).to_a
    return {} if backpacks.empty?

    storage_id = storage_id_for_user_id(user_id)
    uuids = Projects.get_by_ids(backpacks.map(&:project_id)).select_hash(:id, :uuid)
    backpacks.each_with_object({}) do |backpack, channels|
      app_type = backpack.game_id ? backpack.game&.name&.downcase : SharedConstants::UNIVERSAL_APP_TYPE
      # A backpack whose game no longer exists cannot be keyed by app type.
      next unless app_type
      channels[app_type] = get_project_channel_id_from_row(
        storage_id: storage_id, id: backpack.project_id, uuid: uuids[backpack.project_id]
      )
    end
  end

  private_class_method def self.create_with_project(user_id, game_id, ip)
    project = Projects.new(storage_id_for_user_id(user_id))
    encrypted_id = project.create({hidden: true}, ip: ip, type: 'backpack')
    _, project_id = get_storage_id_and_project_id(encrypted_id)
    create!(user_id: user_id, game_id: game_id, project_id: project_id)
  end
end

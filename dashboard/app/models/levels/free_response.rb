# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(16777215)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#

class FreeResponse < Level
  serialized_attrs %w(
    title
    height
    placeholder
    encrypted_solution
    allow_user_uploads
    skip_dialog
    skip_sound
    submittable
    peer_reviewable
    optional
  )

  before_validation do
    self.skip_dialog = true
    self.skip_sound = true
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.free_response, level_num: 'custom'))
  end

  def peer_reviewable?
    try(:peer_reviewable).to_bool
  end

  def icon
    'fa fa-list-ul'
  end

  # FND-985 Create shared API to get localized level properties.
  # get_property takes a given level property_name and returns the localized
  # version of it.
  def get_property(property_name)
    # Return the default English string from the database model if we shouldn't
    # localize this property or we couldn't find a localized value.
    default = try(property_name)
    return default unless should_localize?

    I18n.t(
      name,
      scope: [:data, property_name],
      default: default,
      smart: true
    )
  end
end

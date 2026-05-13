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
#  properties            :text(4294967295)
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
#  index_levels_on_type       (type)
#
class Sketchlab < Level
  serialized_attrs %w(
    start_sources
    exemplar_sources
    starter_assets
  )

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.sketchlab,
        level_num: 'custom',
      )
    )
  end

  def uses_lab2?
    true
  end

  # Add a starter asset mapping from friendly filename to UUID filename.
  def add_starter_asset!(friendly_name, uuid_name)
    self.starter_assets ||= {}
    self.starter_assets[friendly_name] = uuid_name
    save!
  end

  # Remove a starter asset mapping by friendly filename.
  def remove_starter_asset!(friendly_name)
    return true unless starter_assets
    starter_assets.delete(friendly_name)
    save!
  end
end

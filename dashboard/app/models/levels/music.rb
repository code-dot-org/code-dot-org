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
#

# Music uses level_data, which is actual JSON in each .level file, and
# currently contains the following top-level fields:
#
#   text: instructions text
#   toolbox: an object containing blockly toolbox categories and member blocks
#   sounds: an object containing sound categories and member sounds
#   validations: an array containing validation conditions, responses, and actions.
#   startSources: an object used as starter content for blockly

class Music < Blockly
  serialized_attrs %w(
    hide_share_and_remix
    is_project_level
    submittable
    background
    level_data
    validations
  )

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.music,
        level_num: 'custom',
        properties: {}
      )
    )
  end

  def uses_google_blockly?
    true
  end

  def uses_lab2?
    true
  end

  def enable_scrolling?
    # ensures we have the small footer
    true
  end
end

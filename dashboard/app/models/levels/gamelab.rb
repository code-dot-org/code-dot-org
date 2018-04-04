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
#  ideal_level_source_id :integer
#  user_id               :integer
#  properties            :text(65535)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

require 'cdo/shared_constants'

class Gamelab < Blockly
  before_save :update_palette

  serialized_attrs %w(
    free_play
    text_mode_at_start
    hide_animation_mode
    start_in_animation_tab
    all_animations_single_frame
    show_d_pad
    soft_buttons
    submittable
    data_properties
    hide_view_data_button
    show_debug_watch
    expand_debugger
    watchers_prepopulated
    debugger_disabled
    pause_animations_by_default
    start_animations
    teacher_markdown
    auto_run_setup
  )

  # List of possible skins, the first is used as a default.
  def self.skins
    ['gamelab']
  end

  # List of possible palette categories
  def self.palette_categories
    %w(gamelab sprites groups input control math variables functions)
  end

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.gamelab,
        level_num: 'custom',
        properties: {
          code_functions: JSON.parse(palette),
          show_d_pad: true,
          show_debug_watch: true
        }
      )
    )
  end

  # By default, level types that inherit from Blockly will try to store a bunch
  # of fields as normalized xml, discarding anything that's not actually XML.
  # Gamelab doesn't use blockly, so don't do that to any of our fields.
  def xml_blocks
    %w()
  end

  def update_palette
    if code_functions.present? && code_functions.is_a?(String)
      self.code_functions = JSON.parse(code_functions)
    end
  rescue JSON::ParserError => e
    errors.add(:code_functions, "#{e.class.name}: #{e.message}")
    return false
  end

  def uses_droplet?
    true
  end

  def age_13_required?
    true
  end

  def self.palette
    SharedConstants::GAMELAB_BLOCKS
  end
end

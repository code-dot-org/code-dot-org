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
          edit_code: true,
          show_debug_watch: true
        }
      )
    )
  end

  def common_blocks(type)
    <<-XML.chomp
<category name="Start">
  <block type="when_run" />
</category>
<category name="Variables" custom="VARIABLE" />
<category name="Sprites">
  <block type="gamelab_makeNewSprite" />
</category>
<category name="Math">
  <block type="math_number" />
  <block type="math_change">
    <value name="DELTA">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="math_random_int">
    <value name="FROM">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
    <value name="TO">
      <block type="math_number">
        <title name="NUM">100</title>
      </block>
    </value>
  </block>
  <block type="math_arithmetic" />
</category>
    XML
  end

  def toolbox(type)
    return common_blocks(type) unless type == 'toolbox_blocks'
    <<-XML.chomp
<category name="Category">
  <block type="category"></block>
</category>
#{common_blocks(type)}
    XML
  end

  def update_palette
    if code_functions.present? && code_functions.is_a?(String)
      self.code_functions = JSON.parse(code_functions)
    end
  rescue JSON::ParserError => e
    errors.add(:code_functions, "#{e.class.name}: #{e.message}")
    return false
  end

  def self.palette
    SharedConstants::GAMELAB_BLOCKS
  end
end

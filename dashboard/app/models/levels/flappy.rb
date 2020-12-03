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
#  ideal_level_source_id :integer          unsigned
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
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

class Flappy < Blockly
  serialized_attrs %w(
    app_specific_fail_error
    success_condition
    failure_condition
    default_flap
    free_play
    ground
    obstacles
    score
    shareable
    goal
    scale
  )

  def self.flap_amounts
    %w(
      VERY_SMALL
      SMALL
      NORMAL
      LARGE
      VERY_LARGE
    )
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    %w(flappy)
  end

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.custom_flappy,
        level_num: 'custom',
      )
    )
  end

  def self.default_scale
    <<-JS.strip_heredoc.chomp
      {
        snapRadius: 1,
        stepSpeed: 33
      }
    JS
  end

  def self.default_goal
    <<-JS.strip_heredoc.chomp
      {
        startX: 0,
        startY: 0,
        moving: false,
      }
    JS
  end

  def toolbox(type)
    <<-XML.strip_heredoc.chomp
      <block type="flappy_flap"></block>
      <block type="flappy_flap_height"></block>
      <block type="flappy_endGame"></block>
      <block type="flappy_playSound"></block>
      <block type="flappy_incrementPlayerScore"></block>
      <block type="flappy_setSpeed"></block>
      <block type="flappy_setBackground"></block>
      <block type="flappy_setGapHeight"></block>
      <block type="flappy_setPlayer"></block>
      <block type="flappy_setObstacle"></block>
      <block type="flappy_setGround"></block>
      <block type="flappy_setGravity"></block>
      <block type="flappy_setScore"></block>
    XML
  end
end

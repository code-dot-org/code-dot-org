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
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

class Bounce < Grid
  serialized_attrs %w(
    ball_direction
    fail_on_ball_exit
    failure_condition
    goal
    min_workspace_height
    scale
    soft_buttons
    success_condition
    theme
    timeout_failure_tick
    use_flag_goal
    free_play
  )

  validate :validate_skin_and_theme

  def validate_skin_and_theme
    return unless skin && theme
    # the sports skin can have any theme except retro
    sport_skin_non_sport_theme = (
      skin === "sports" && theme === "retro"
    )

    # the bounce and basketball skins can only have retro or basketball themes
    sport_theme_non_sport_skin = (
      %(bounce basketball).include?(skin) &&
      !%(retro basketball).include?(theme)
    )

    errors.add(:theme, "#{skin} skin and #{theme} theme are incompatible") if
      sport_skin_non_sport_theme || sport_theme_non_sport_skin
  end

  def self.soft_buttons
    %w(
      leftButton
      rightButton
      downButton
      upButton
    )
  end

  def self.themes
    ["", "retro", "basketball", "soccer", "hockey", "football"]
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    %w(bounce basketball sports)
  end

  def self.create_from_level_builder(params, level_params)
    puts params
    puts level_params
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.bounce,
        level_num: 'custom',
      )
    )
  end

  def self.parse_maze(maze_json, _ = nil)
    maze_json = maze_json.to_json if maze_json.is_a? Array
    {'maze' => JSON.parse(maze_json).map {|row| row.map {|cell| Integer(cell['tileType'])}}.to_json}
  end

  def toolbox(type)
    <<-XML.strip_heredoc.chomp
      <block type="bounce_moveLeft"></block>
      <block type="bounce_moveRight"></block>
      <block type="bounce_bounceBall"></block>
      <block type="bounce_playSound"></block>
      <block type="bounce_incrementPlayerScore"></block>
      <block type="bounce_incrementOpponentScore"></block>
      <block type="bounce_launchBall"></block>
      <block type="bounce_setTeam"></block>
      <block type="bounce_setPaddleSpeed"></block>
      <block type="bounce_setPaddleDropdown"></block>
      <block type="bounce_setBackground"></block>
      <block type="bounce_setBall"></block>
      <block type="bounce_setPaddle"></block>
      <block type="bounce_setBallSpeed"></block>
    XML
  end
end

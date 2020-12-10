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

class StudioEC < Studio
  before_save :update_palette, :update_goal_override

  serialized_attrs %w(
    autocomplete_palette_apis_only
    text_mode_at_start
  )

  def self.create_from_level_builder(params, level_params)
    level = new(
      level_params.merge(
        user: params[:user],
        game: Game.studio_ec,
        level_num: 'custom',
        properties: {
          code_functions: JSON.parse(palette),
          goal_override: JSON.parse(goal_override),
        }
      )
    )
    level.create_maze(level_params, params)
    level
  end

  def xml_blocks
    %w()
  end

  # List of possible palette categories
  def self.palette_categories
    %w(commands events)
  end

  def update_palette
    if code_functions.present? && code_functions.is_a?(String)
      self.code_functions = JSON.parse(code_functions)
    end
  end

  def self.palette
    <<-JSON.strip_heredoc.chomp
      {
        // Playlab
        "moveEast": null,
        "moveNorth": null,
        "moveSouth": null,
        "moveWest": null
      }
    JSON
  end

  def update_goal_override
    if goal_override.present? && goal_override.is_a?(String)
      self.goal_override = JSON.parse(goal_override)
    end
  end

  def self.goal_override
    <<-JSON.strip_heredoc.chomp
      {
        "goalAnimation": null
      }
    JSON
  end

  def uses_droplet?
    true
  end
end

# Another name for this class to match the capitalization conventions of the annotation gem.
StudioEc = StudioEC

# == Schema Information
#
# Table name: levels
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)      not null
#  created_at               :datetime
#  updated_at               :datetime
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean          default(FALSE), not null
#  notes                    :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#

class StudioEC < Studio
  before_save :update_palette, :update_goal_override

  serialized_attrs %w(
    autocomplete_palette_apis_only
    text_mode_at_start
  )

  def self.create_from_level_builder(params, level_params)
    level = new(level_params.merge(
        user: params[:user],
        game: Game.studio_ec,
        level_num: 'custom',
        properties: {
          code_functions: JSON.parse(palette),
          goal_override: JSON.parse(goal_override),
          edit_code: true
        }
    ))
    level.create_maze(level_params, params)
    level
  end

  def xml_blocks
    %w()
  end

  def update_palette
    if self.code_functions.present? && self.code_functions.is_a?(String)
      self.code_functions = JSON.parse(self.code_functions)
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
    if self.goal_override.present? && self.goal_override.is_a?(String)
      self.goal_override = JSON.parse(self.goal_override)
    end
  end

  def self.goal_override
    <<-JSON.strip_heredoc.chomp
      {
        "goalAnimation": null
      }
    JSON
  end

end

# Another name for this class to match the capitalization conventions of the annotation gem.
StudioEc = StudioEC

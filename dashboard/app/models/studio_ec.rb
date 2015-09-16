class StudioEC < Studio
  before_save :update_palette

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
end

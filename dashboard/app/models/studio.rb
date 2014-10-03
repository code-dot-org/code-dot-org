class Studio < Maze
  serialized_attrs %w(
    first_sprite_index
    protaganist_sprite_index
    success_condition
    failure_condition
    timeout_failure_tick
    soft_buttons
  )

  def self.create_from_level_builder(params, level_params)
    level = new(level_params.merge(user: params[:user], game: Game.custom_studio, level_num: 'custom'))
    level.create_maze(level_params, params)
    level
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    ['studio']
  end

  def toolbox(type)
    # TODO
  end
end

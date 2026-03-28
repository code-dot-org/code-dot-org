class Sketchlab2 < Level
  serialized_attrs %w(
    start_sources
    exemplar_sources
  )

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.sketchlab2,
        level_num: 'custom',
      )
    )
  end

  def uses_lab2?
    true
  end

  def add_starter_asset!(_, _)
    true
  end
end

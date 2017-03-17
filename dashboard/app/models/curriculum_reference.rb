class CurriculumReference < Level
  serialized_attrs %w(
    reference
  )

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.curriculum_reference,
        level_num: 'custom',
      )
    )
  end

  # Get the URL of the studio.code.org/docs routes (that serves as a proxy to
  # our docs.code.org route)
  def href
    return nil unless properties['reference']
    "/docs#{properties['reference']}"
  end
end

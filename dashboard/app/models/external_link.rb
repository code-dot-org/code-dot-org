class ExternalLink < Level
  def disclaimer
    'Danger! Danger Will Robinson!'
  end

  serialized_attrs %w(
    link_title
    markdown_instructions
    url
  )

  def icon
    'fa-globe'
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.external_link, level_num: 'custom'))
  end
end

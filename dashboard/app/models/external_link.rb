class ExternalLink < Level
  serialized_attrs %w(
    link_title
    url
  )

  def icon
    'fa-globe'
  end

  before_validation do
    unless url.start_with? 'http://'
      url.prepend 'http://'
    end
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.external_link, level_num: 'custom'))
  end
end

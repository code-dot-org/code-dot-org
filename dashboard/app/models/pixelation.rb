class Pixelation < Widget
  serialized_attrs %w(
    version
    data
    hex
  )

  before_validation do
    self.href = 'pixelation/pixelation.html'
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.pixelation, level_num: 'custom'))
  end
end

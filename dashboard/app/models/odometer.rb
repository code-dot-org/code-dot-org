class Odometer < Widget

  before_validation do
    self.href = 'odometer/odometer.html'
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.odometer, level_num: 'custom'))
  end
end

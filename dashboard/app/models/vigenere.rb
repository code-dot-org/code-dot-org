class Vigenere < Widget

  before_validation do
    self.href = 'vigenere/vigenere.html'
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.vigenere, level_num: 'custom'))
  end
end

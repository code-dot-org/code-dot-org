class TextCompression < Widget
  serialized_attrs %w(
    poems
    dictionary
  )

  before_validation do
    self.href = 'text-compression/text-compression.html'
  end

  before_save do
    self.poems = poems.select(&:present?) unless poems.nil?
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.text_compression, level_num: 'custom'))
  end
end

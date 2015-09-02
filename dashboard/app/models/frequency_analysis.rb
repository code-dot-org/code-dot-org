class FrequencyAnalysis < Widget
  serialized_attrs %w(
    version
  )

  before_validation do
    self.href = 'frequency/frequency.html'
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.frequency_analysis, level_num: 'custom'))
  end
end

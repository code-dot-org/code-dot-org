# == Schema Information
#
# Table name: levels
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)      not null
#  created_at               :datetime
#  updated_at               :datetime
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean          default(FALSE), not null
#  notes                    :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#

class TextCompression < Widget
  serialized_attrs %w(
    poems
    dictionary
  )

  before_validation do
    self.href = 'text-compression/text-compression.html'
  end

  before_save do
    unless poems.nil?
      self.poems = poems.select(&:present?)
      self.poems = nil if poems.count == 0
    end
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.text_compression, level_num: 'custom'))
  end
end

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
#  index_levels_on_name     (name)
#

class CurriculumReference < External
  def dsl_default
    <<-TEXT.strip_heredoc.chomp
    # Update the following lines to give you level a unique name and point at
    # the appropriate url on docs.code.org
    name '#{name || 'unique level name here'}'
    reference '/csd/maker_leds/index.html'
    TEXT
  end

  # Get the URL of the studio.code.org/docs routes (that serves as a proxy to
  # our docs.code.org route)
  def href
    return nil unless properties['reference']
    "/docs#{properties['reference']}"
  end
end

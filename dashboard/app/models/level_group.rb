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

class LevelGroup < DSLDefined

  def dsl_default
    <<ruby
name 'unique level name here'
submittable 'true'

page
level 'level1'
level 'level2'

page
level 'level 3'
level 'level 4'
ruby
  end

  # Returns a flattened array of all the Levels in this LevelGroup, in order.
  def levels
    level_names = []
    properties["pages"].each do |page|
      page["levels"].each do |page_level_name|
        level_names << page_level_name
      end
    end

    Level.where(name: level_names)
  end

end

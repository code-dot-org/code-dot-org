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
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#

class LevelGroup < DSLDefined

  def dsl_default
    <<ruby
name 'unique level name here'
title 'title'
description 'description here'
level 'level1'
level 'level2'
ruby
  end

end

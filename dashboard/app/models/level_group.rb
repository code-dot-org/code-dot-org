# == Schema Information
#
# Table name: level_groups
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean
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

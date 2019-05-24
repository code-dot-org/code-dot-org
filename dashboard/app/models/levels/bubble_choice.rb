# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :integer
#  user_id               :integer
#  properties            :text(65535)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

class BubbleChoice < DSLDefined
  def dsl_default
    <<ruby
name 'unique level name here'
title 'level title here'
description 'level description here'

sublevels
level 'level1'
level 'level2'
ruby
  end

  # Returns all of the sublevels for this BubbleChoice level in order.
  def sublevels
    Level.where(name: properties['sublevels']).sort_by {|l| properties['sublevels'].index(l.name)}
  end
end

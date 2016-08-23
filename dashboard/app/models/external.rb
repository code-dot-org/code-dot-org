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

class External < DSLDefined
  # Check if the level has a hand-written submit button. Once all submit buttons are removed from markdown, this can go away.
  def has_submit_button?
    properties['markdown'].try(:include?, 'next-stage') && properties['markdown'].try(:include?, 'submitButton')
  end

  def dsl_default
    <<-TEXT.strip_heredoc.chomp
    name '#{self.name || 'unique level name here'}'
    title 'title'
    description 'description here'
    href 'path/to/html/in/asset/folder'
    TEXT
  end

  def icon
    'fa-file-text'
  end
end

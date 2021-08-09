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
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(16777215)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#

class External < DSLDefined
  # This string gets replaced with the user's id in markdown.
  USER_ID_REPLACE_STRING = '<user_id/>'.freeze

  serialized_attrs %w(
    associated_blocks
  )

  # Check if the level has a hand-written submit button. Once all submit buttons are removed from markdown, this can go away.
  def has_submit_button?
    (properties['markdown'].try(:include?, 'next-stage') || properties['markdown'].try(:include?, 'next-lesson')) && properties['markdown'].try(:include?, 'submitButton')
  end

  def supports_markdown?
    true
  end

  def dsl_default
    <<~TEXT
      name '#{name || DEFAULT_LEVEL_NAME}'
      title 'title'
      description 'description here'
    TEXT
  end

  def icon
    'fa-file-text'
  end

  def concept_level?
    true
  end

  # returns a version of the markdown for this level in which
  # USER_ID_REPLACE_STRING is replaced by the current user's id
  def localized_replaced_markdown(user)
    user_id = user.try(:id).to_s
    localized_markdown = localized_property('markdown')
    return localized_markdown.gsub(USER_ID_REPLACE_STRING, user_id)
  end

  def associated_blocks
    properties['associated_blocks']
  end

  def self.possible_associated_blocks
    %w(bounce flappy jigsaw maze studio turtle)
  end

  def summarize_for_lesson_show(can_view_teacher_markdown)
    super.merge(
      {
        markdown: localized_property('markdown')
      }
    )
  end
end

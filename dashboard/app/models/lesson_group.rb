# == Schema Information
#
# Table name: lesson_groups
#
#  id          :integer          not null, primary key
#  key         :string(255)      not null
#  script_id   :integer          not null
#  user_facing :boolean          default(TRUE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  position    :integer
#  properties  :text(65535)
#
# Indexes
#
#  index_lesson_groups_on_script_id_and_key  (script_id,key) UNIQUE
#

class LessonGroup < ApplicationRecord
  include SerializedProperties

  belongs_to :script
  has_many :lessons, -> {order('absolute_position ASC')}

  validates :position, numericality: {greater_than: 0}

  validates_uniqueness_of :key, scope: :script_id

  validates :key,
    presence: {
      message: 'Expect all levelbuilder created lesson groups to have key.'
    },
    if: proc {|a| a.user_facing}

  serialized_attrs %w(
    display_name
  )

  def localized_display_name
    I18n.t("data.script.name.#{script.name}.lesson_groups.#{key}.display_name", default: 'Content')
  end

  # This method is not currently used outside of summarize_for_edit but will be used
  # soon as we move the position of lessons to be based on their lesson group instead
  # of the script (dmcavoy - May 2020)
  def summarize(include_lessons = true, user = nil, include_bonus_levels = false)
    summary = {
      id: id,
      key: key,
      display_name: localized_display_name,
      user_facing: user_facing,
      position: position
    }

    # Filter out lessons that have a visible_after date in the future
    filtered_lessons = lessons.select {|lesson| lesson.published?(user)}
    summary[:lessons] = filtered_lessons.map {|lesson| lesson.summarize(include_bonus_levels)} if include_lessons

    summary
  end

  def summarize_for_edit
    include_lessons = false
    summary = summarize(include_lessons)
    summary[:lessons] = lessons.map(&:summarize_for_edit)
    summary
  end
end

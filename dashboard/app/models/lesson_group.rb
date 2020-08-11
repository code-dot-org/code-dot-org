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
  has_many :lessons, -> {order(:absolute_position)}, dependent: :destroy
  has_many :script_levels, through: :lessons
  has_many :levels, through: :script_levels

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

  Counters = Struct.new(:lockable_count, :non_lockable_count, :lesson_position, :chapter)

  # Finds or creates Lesson Groups with the correct position.
  # In addition it check for 3 things:
  # 1. That all the lesson groups specified by the editor have a key and
  # display name.
  # 2. If the lesson group key is an existing key that the given display name
  # for that key matches the already saved display name
  # 3. PLC courses use certain lesson group keys for module types. We reserve those
  # keys so they can only map to the display_name for their PLC purpose
  def self.add_lesson_groups(raw_lesson_groups, script, new_suffix, editor_experiment)
    lesson_group_position = 0

    counters = Counters.new(0, 0, 0, 0)

    raw_lesson_groups&.map do |raw_lesson_group|
      if raw_lesson_group[:key].nil?
        lesson_group = LessonGroup.find_or_create_by(
          key: '',
          script: script,
          user_facing: false,
          position: 1
        )
      else
        LessonGroup.prevent_changing_plc_display_name(raw_lesson_group)
        LessonGroup.prevent_blank_display_name(raw_lesson_group)

        lesson_group = LessonGroup.find_or_create_by(
          key: raw_lesson_group[:key],
          script: script,
          user_facing: true
        )

        lesson_group.assign_attributes(position: lesson_group_position += 1, properties: {display_name: raw_lesson_group[:display_name]})
        lesson_group.save! if lesson_group.changed?
      end

      LessonGroup.prevent_lesson_group_with_no_lessons(lesson_group, raw_lesson_group[:lessons].length)

      new_lessons = Lesson.add_lessons(script, lesson_group, raw_lesson_group[:lessons], counters, new_suffix, editor_experiment)
      lesson_group.lessons = new_lessons
      lesson_group.save!

      lesson_group
    end
  end

  def self.prevent_blank_display_name(raw_lesson_group)
    if raw_lesson_group[:display_name].blank?
      raise "Expect all lesson groups to have display names. The following lesson group does not have a display name: #{raw_lesson_group[:key]}"
    end
  end

  def self.prevent_changing_plc_display_name(raw_lesson_group)
    Plc::LearningModule::RESERVED_LESSON_GROUPS_FOR_PLC.each do |reserved_lesson_group|
      if reserved_lesson_group[:key] == raw_lesson_group[:key] && reserved_lesson_group[:display_name] != raw_lesson_group[:display_name]
        raise "The key #{reserved_lesson_group[:key]} is a reserved key. It must have the display name: #{reserved_lesson_group[:display_name]}."
      end
    end
  end

  # All lesson groups should have lessons in them
  def self.prevent_lesson_group_with_no_lessons(lesson_group, num_lessons)
    raise "Every lesson group should have at least one lesson. Lesson Group #{lesson_group.key} has no lessons." if num_lessons < 1
  end

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

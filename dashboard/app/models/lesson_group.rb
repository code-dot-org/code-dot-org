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

  # Finds or creates Lesson Groups with the correct position.
  # In addition it check for 3 things:
  # 1. That all the lesson groups specified by the editor have a key and
  # display name.
  # 2. If the lesson group key is an existing key that the given display name
  # for that key matches the already saved display name
  # 3. PLC courses use certain lesson group keys for module types. We reserve those
  # keys so they can only map to the display_name for their PLC purpose
  def self.add_lesson_groups(raw_lesson_groups, script, new_suffix, editor_experiment)
    script_lesson_groups = []
    script_lessons = []
    lockable_count = 0
    non_lockable_count = 0
    lesson_position = 0

    raw_lesson_groups&.each_with_index do |raw_lesson_group, index|
      # We want a script to either have all of its lessons have lesson groups
      # or none of the lessons have lesson groups. We know we have hit this case if
      # there are more than one lesson group for a script but the lesson group key
      # for the first lesson is blank
      if raw_lesson_groups[0][:key].nil?
        if raw_lesson_groups.length > 1
          raise "Expect if one lesson has a lesson group all lessons have lesson groups. Lesson #{raw_lesson_groups[0][:lessons][0][:name]} does not have a lesson group."
        end
        lesson_group = LessonGroup.find_or_create_by(
          key: '',
          script: script,
          user_facing: false,
          position: 1
        )
      else
        LessonGroup.prevent_changing_plc_display_name(raw_lesson_group)
        LessonGroup.prevent_blank_display_name(raw_lesson_group)

        new_lesson_group = false

        lesson_group = LessonGroup.find_or_create_by(
          key: raw_lesson_group[:key],
          script: script,
          user_facing: true
        ) do
          # if you got in here, this is a new lesson_group
          new_lesson_group = true
        end

        LessonGroup.prevent_changing_display_name(new_lesson_group, raw_lesson_group, lesson_group)

        lesson_group.assign_attributes(position: index + 1, properties: {display_name: raw_lesson_group[:display_name]})
        lesson_group.save! if lesson_group.changed?
      end

      new_lessons = Lesson.add_lessons(script, lesson_group, raw_lesson_group[:lessons], lockable_count, non_lockable_count, lesson_position, new_suffix, editor_experiment)
      lesson_position += lesson_group.lessons.length
      new_lessons.each do |lesson|
        lesson.lockable ? lockable_count += 1 : non_lockable_count += 1
        script_lessons << lesson
      end

      LessonGroup.prevent_lesson_group_with_no_lessons(lesson_group)
      script_lesson_groups << lesson_group
    end
    [script_lesson_groups, script_lessons]
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

  def self.prevent_changing_display_name(new_lesson_group, raw_lesson_group, lesson_group)
    if !new_lesson_group && lesson_group.localized_display_name != raw_lesson_group[:display_name]
      raise "Expect key and display name to match. The Lesson Group with key: #{raw_lesson_group[:key]} has display_name: #{lesson_group&.localized_display_name}"
    end
  end

  # All lesson groups should have lessons in them
  def self.prevent_lesson_group_with_no_lessons(lesson_group)
    raise "Every lesson group should have at least one lesson. Lesson Group #{lesson_group.key} has no lessons." if lesson_group.lessons.count < 1
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

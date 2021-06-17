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
    description
    big_questions
  )

  Counters = Struct.new(:numbered_lesson_count, :unnumbered_lesson_count, :lesson_position, :chapter)

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
        LessonGroup.prevent_changing_stable_i18n_key(script, raw_lesson_group)

        lesson_group = LessonGroup.find_or_create_by(
          key: raw_lesson_group[:key],
          script: script,
          user_facing: true
        )

        lesson_group.assign_attributes(
          position: lesson_group_position += 1,
          properties: {
            display_name: raw_lesson_group[:display_name],
            description: raw_lesson_group[:description],
            big_questions: raw_lesson_group[:big_questions]
          }
        )
        lesson_group.save! if lesson_group.changed?
      end

      LessonGroup.prevent_lesson_group_with_no_lessons(lesson_group, raw_lesson_group[:lessons].length)

      new_lessons = Lesson.add_lessons(script, lesson_group, raw_lesson_group[:lessons], counters, new_suffix, editor_experiment)
      lesson_group.lessons = new_lessons
      lesson_group.save!

      lesson_group
    end
  end

  def self.prevent_changing_stable_i18n_key(script, raw_lesson_group)
    if script.is_stable && ScriptConstants.i18n?(script.name) && I18n.t("data.script.name.#{script.name}.lesson_groups.#{raw_lesson_group[:key]}").include?('translation missing:')
      raise "Adding new keys or update existing keys for lesson groups in scripts that are marked as stable and included in the i18n sync is not allowed. Offending Lesson Group Key: #{raw_lesson_group[:key]}"
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

  def localized_description
    I18n.t("data.script.name.#{script.name}.lesson_groups.#{key}.description", default: description)
  end

  def localized_big_questions
    I18n.t("data.script.name.#{script.name}.lesson_groups.#{key}.big_questions", default: big_questions)
  end

  def summarize
    {
      id: id,
      key: key,
      display_name: localized_display_name,
      description: localized_description,
      big_questions: localized_big_questions,
      user_facing: user_facing,
      position: position
    }
  end

  def summarize_for_unit_edit
    summary = summarize
    summary[:description] = description
    summary[:big_questions] = big_questions
    summary[:lessons] = lessons.map(&:summarize_for_unit_edit)
    summary
  end

  def summarize_for_lesson_dropdown(is_student = false)
    {
      key: key,
      displayName: localized_display_name,
      userFacing: user_facing,
      lessons: lessons.select(&:has_lesson_plan).map {|lesson| lesson.summarize_for_lesson_dropdown(is_student)}
    }
  end

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated objects are needed, then data from
  # the seeding_keys of those objects should be included as well.
  # Ideally should correspond to a unique index for this model's table.
  # See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context)
    my_key = {'lesson_group.key': key}

    raise "No Script found for #{self.class}: #{my_key}" unless seed_context.script
    script_seeding_key = seed_context.script.seeding_key(seed_context)

    my_key.merge!(script_seeding_key) {|key, _, _| raise "Duplicate key when generating seeding_key: #{key}"}
    my_key.stringify_keys
  end

  # This method takes chapter data exported from curriculum builder and updates
  # corresponding fields of this LessonGroup to match it. Only fields on this
  # LessonGroup will be updated. Lessons themselves are not updated here.
  # The expected input format is as follows:
  # {
  #   "title": "CB Chapter Title",
  #   "number": 1,
  #   "questions": "Big Questions markdown",
  #   "description": "Description markdown"
  # }
  #
  # @param [Hash] cb_chapter_data - Chapter data to import.
  # @return [Boolean] - Whether any changes to this lesson group were saved.
  def update_from_curriculum_builder(cb_chapter_data)
    # In the future, only levelbuilder should be added to this list.
    raise unless [:development, :adhoc, :levelbuilder].include? rack_env

    cb_questions = cb_chapter_data['questions']
    if cb_questions.present? && big_questions.blank?
      self.big_questions = cb_questions
    end

    cb_description = cb_chapter_data['description']
    if cb_description.present? && description.blank?
      self.description = cb_description
    end

    changed = changed?
    save! if changed?
    changed
  end

  def i18n_hash
    if display_name
      {
        script.name => {
          'lesson_groups' => {
            key => {
              'display_name' => display_name
            }
          }
        }
      }
    else
      {}
    end
  end

  def copy_to_script(destination_script, new_level_suffix = nil)
    return if script == destination_script
    raise 'Both lesson group and script must be migrated' unless script.is_migrated? && destination_script.is_migrated?
    raise 'Destination script and lesson group must be in a course version' if destination_script.get_course_version.nil? || script.get_course_version.nil?

    copied_lesson_group = dup
    copied_lesson_group.script = destination_script
    copied_lesson_group.lessons = []
    copied_lesson_group.position = destination_script.lesson_groups.count + 1
    copied_lesson_group.save!

    lessons.each do |original_lesson|
      copied_lesson = original_lesson.copy_to_script(destination_script, new_level_suffix)
      raise 'Something went wrong: copied lesson should be in new lesson group' unless copied_lesson.lesson_group == copied_lesson_group
    end
    Script.merge_and_write_i18n(copied_lesson_group.i18n_hash, destination_script.name)
    copied_lesson_group
  end
end

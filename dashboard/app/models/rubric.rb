# == Schema Information
#
# Table name: rubrics
#
#  id         :bigint           not null, primary key
#  lesson_id  :integer
#  level_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Rubric < ApplicationRecord
  has_many :learning_goals, -> {order(:position)}, dependent: :destroy
  belongs_to :level
  belongs_to :lesson

  def serialize
    {
      learning_goals: learning_goals.map(&:serialize),
      level_name: level&.name
    }
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    object_to_serialize = serialize
    dirname = File.dirname(serialized_file_path)
    unless File.directory?(dirname)
      FileUtils.mkdir_p(dirname)
    end
    File.write(serialized_file_path, JSON.pretty_generate(object_to_serialize))
  end

  def self.seed_all
    # collect all existing ids
    record_ids_to_remove = all.pluck(:id)
    Dir.glob(Rails.root.join("config/rubrics/**/*.json")).each do |path|
      # for each file, seed the reference guide and remove from the original set the found ids
      # (new ids won't change anything)
      record_ids_to_remove -= [seed_record(path).id]
    end
    # the remaining ids that were not seeded should be removed
    where(id: record_ids_to_remove).destroy_all
  end

  def self.seed_record(file_path)
    properties = JSON.parse(File.read(file_path))

    unit_name = File.basename(File.dirname(file_path))
    lesson_key = File.basename(file_path, '.json')
    unit = Unit.find_by(name: unit_name)
    lesson = Lesson.find_by(key: lesson_key, script_id: unit.id)
    level = Level.find_by(name: properties['level_name'])
    raise "Level for rubric must be in the rubric's lesson" unless lesson.levels.any? {|l| l.name == level.name}

    rubric = Rubric.find_or_create_by!(lesson_id: lesson.id, level_id: level.id)
    properties['learning_goals'].each do |learning_goal_properties|
      learning_goal_properties.symbolize_keys!
      learning_goal = LearningGoal.find_or_create_by!(rubric_id: rubric.id, key: learning_goal_properties[:key])
      learning_goal.assign_attributes(learning_goal_properties.except(:learning_goal_evidence_levels))
      learning_goal.save! if learning_goal.changed?

      learning_goal_properties[:learning_goal_evidence_levels].each do |evidence_level_properties|
        evidence_level_properties.symbolize_keys!
        evidence_level = LearningGoalEvidenceLevel.find_or_create_by!(learning_goal_id: learning_goal.id, understanding: evidence_level_properties[:understanding])
        evidence_level.assign_attributes(evidence_level_properties)
        evidence_level.save! if evidence_level.changed?
      end
    end
    rubric
  end

  def serialized_file_path
    Rails.root.join("config/rubrics/#{lesson.script.name}/#{lesson.key}.json")
  end
end

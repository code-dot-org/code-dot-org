# == Schema Information
#
# Table name: practice_problems
#
#  id           :bigint           not null, primary key
#  key          :string(255)      not null
#  problem_type :string(255)      not null
#  active       :boolean          default(FALSE), not null
#  problem_text :text(65535)      not null
#  solution     :json
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_practice_problems_on_key  (key) UNIQUE
#
class PracticeProblem < ApplicationRecord
  has_and_belongs_to_many :objectives, join_table: :objectives_practice_problems
  validates :key, presence: true, uniqueness: true
  validates :problem_type, inclusion: {in: SharedConstants::PRACTICE_PROBLEM_TYPES.values}

  def summarize
    {
      id: id,
      key: key,
      problem_type: problem_type,
      active: active,
      problem_text: problem_text,
      solution: solution,
      objectives: objectives&.map {|o| {id: o.id, description: o.description}},
      created_at: created_at,
      updated_at: updated_at,
    }
  end

  # Shape consumed by the lesson editor's Tutor Deep Dive section. When a
  # lesson is given, objectiveIds is scoped to that lesson's objectives so the
  # editor only surfaces (and only mutates) associations it is responsible for.
  def summarize_for_lesson_edit(lesson = nil)
    scoped = lesson ? objectives.where(lesson_id: lesson.id) : objectives
    {
      id: id,
      key: key,
      problemType: problem_type,
      active: active,
      problemText: problem_text,
      solution: solution,
      objectiveIds: scoped.pluck(:id),
    }
  end

  def file_path
    Rails.root.join("config/practice_problems/#{key}.json")
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    FileUtils.mkdir_p(File.dirname(file_path))
    File.write(
      file_path,
      JSON.pretty_generate(
        key: key,
        problem_type: problem_type,
        active: active,
        problem_text: problem_text,
        solution: solution,
        objective_keys: objectives.map(&:key),
      )
    )
  end

  def self.seed_all(root_dir: Rails.root, glob: "config/practice_problems/*.json")
    Dir.glob(root_dir.join(glob)).each do |path|
      seed_record(path)
    rescue => exception
      CDO.log.error "Failed to seed practice problem #{path}: #{exception.message}"
    end
  end

  def self.properties_from_file(content)
    JSON.parse(content).symbolize_keys
  end

  def self.seed_record(file_path)
    properties = properties_from_file(File.read(file_path))
    objective_keys = Array(properties.delete(:objective_keys))

    problem = find_or_initialize_by(key: properties[:key])
    problem.update!(properties)

    problem.objectives = Objective.where(key: objective_keys)

    problem.key
  end
end

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
  validates :problem_text, presence: true
  validate :solution_is_answerable

  TYPES = SharedConstants::PRACTICE_PROBLEM_TYPES

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

  # Destroys records whose file is gone, unless a file failed to seed: its
  # key is unknown, and destroying would delete a live problem.
  def self.seed_all(root_dir: Rails.root, glob: "config/practice_problems/*.json")
    seeded_keys = []
    failed = false
    Dir.glob(root_dir.join(glob)).each do |path|
      seeded_keys << seed_record(path)
    rescue => exception
      failed = true
      CDO.log.error "Failed to seed practice problem #{path}: #{exception.message}"
    end
    where.not(key: seeded_keys).destroy_all unless failed
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

  # The student UI cannot complete a problem that fails these rules.
  private def solution_is_answerable
    entries = solution
    unless entries.is_a?(Array) && entries.size >= 2 && entries.all?(Hash)
      return errors.add(:solution, 'must have at least two options')
    end
    entries = entries.map(&:stringify_keys)
    errors.add(:solution, 'options must not be blank') if entries.any? {|e| e['option'].to_s.blank?}

    correct = entries.map {|e| e['correct']}
    case problem_type
    when TYPES[:MULTIPLE_CHOICE_SINGLE]
      errors.add(:solution, 'must have exactly one correct option') unless correct.count(true) == 1
    when TYPES[:MULTIPLE_CHOICE_MULTI]
      errors.add(:solution, 'must have at least one correct option') unless correct.include?(true)
    when TYPES[:MATCH]
      errors.add(:solution, 'every option needs a match') if correct.any? {|c| c.to_s.blank?}
    when TYPES[:SORT]
      errors.add(:solution, 'every option needs a category') if correct.any? {|c| c.to_s.blank?}
    when TYPES[:SCRAMBLE]
      unless correct.all?(Integer) && correct.sort == (0...correct.size).to_a
        errors.add(:solution, 'scramble positions must be 0 through n-1, each used once')
      end
    end
  end
end

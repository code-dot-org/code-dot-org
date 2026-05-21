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
class PracticeProblem < ApplicationRecord
  has_and_belongs_to_many :objectives, join_table: :objectives_practice_problems
  validates :problem_type, inclusion: {in: SharedConstants::PRACTICE_PROBLEM_TYPES.values}

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

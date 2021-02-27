# == Schema Information
#
# Table name: programming_expressions
#
#  id                         :bigint           not null, primary key
#  name                       :string(255)      not null
#  category                   :string(255)
#  properties                 :text(65535)
#  programming_environment_id :bigint           not null
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_programming_expressions_on_programming_environment_id  (programming_environment_id)
#
class ProgrammingExpression < ApplicationRecord
  belongs_to :programming_environment
  has_and_belongs_to_many :lessons, join_table: :lessons_programming_expressions

  def self.properties_from_file(path, content)
    expression_config = JSON.parse(content)

    environment_name = File.basename(File.dirname(path)) == 'GamelabJr' ? 'spritelab' : ''
    programming_environment = ProgrammingEnvironment.find_by(name: environment_name)

    {
      name: expression_config['config']['func'] || expression_config['config']['name'],
      programming_environment_id: programming_environment.id,
      category: expression_config['category']
    }
  end

  def self.seed_all(blob="config/blocks/GamelabJr/*.json")
    removed_records = all.pluck(:name)
    Dir.glob(Rails.root.join(blob)).each do |path|
      removed_records -= [ProgrammingExpression.seed_record(path)]
    end
    where(name: removed_records).destroy_all
  end

  def self.seed_record(file_path)
    properties = properties_from_file(file_path, File.read(file_path))
    record = ProgrammingExpression.find_or_initialize_by(name: properties[:name], programming_environment_id: properties[:programming_environment_id])
    record.update! properties
    record.name
  end
end

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
#  key                        :string(255)      not null
#
# Indexes
#
#  index_programming_expressions_on_name_and_category           (name,category)
#  index_programming_expressions_on_programming_environment_id  (programming_environment_id)
#  programming_environment_key                                  (programming_environment_id,key) UNIQUE
#
class ProgrammingExpression < ApplicationRecord
  include SerializedProperties

  belongs_to :programming_environment
  has_and_belongs_to_many :lessons, join_table: :lessons_programming_expressions
  has_many :lessons_programming_expressions

  validates_uniqueness_of :key, scope: :programming_environment_id

  serialized_attrs %w(
    color
    syntax
  )

  def self.properties_from_file(path, content)
    expression_config = JSON.parse(content)

    environment_name = File.basename(File.dirname(path)) == 'GamelabJr' ? 'spritelab' : File.basename(File.dirname(path))
    programming_environment = ProgrammingEnvironment.find_by(name: environment_name)

    syntax = ProgrammingExpression.get_syntax(expression_config)

    if environment_name == 'spritelab'
      {
        key: expression_config['config']['docFunc'] || expression_config['config']['func'] || expression_config['config']['name'],
        name: expression_config['config']['func'] || expression_config['config']['name'],
        programming_environment_id: programming_environment.id,
        category: expression_config['category'],
        color: expression_config['config']['color'],
        syntax: expression_config['config']['func'] || expression_config['config']['name']
      }
    else
      {
        key: expression_config['docFunc'] || expression_config['func'],
        name: expression_config['func'],
        programming_environment_id: programming_environment.id,
        category: expression_config['category'],
        color: ProgrammingExpression.get_category_color(expression_config['category']),
        syntax: syntax
      }
    end
  end

  def self.get_syntax(config)
    syntax = config['func']
    if config['syntax']
      syntax = config['syntax']
    elsif config['paletteParams']
      syntax = config['func'] + "(" + config['paletteParams'].join(', ') + ")"
    elsif config['block']
      syntax = config['block']
    end

    syntax
  end

  def self.get_category_color(category)
    case category
    # General
    when 'Advanced'
      '#19c3e1'
    when 'Control'
      '#64B5F6'
    when 'Functions'
      '#68D995'
    when 'Math'
      '#FFB74D'
    when 'Variables'
      '#BB77C7'
    # Applab
    when 'Canvas'
      '#f78183'
    when 'Data'
      '#d3e965'
    when 'Turtle'
      '#4dd0e1'
    when 'UI controls'
      '#fff176'
    # Applab - Maker
    when 'Circuit'
      "#f78183"
    when 'Maker'
      "#4dd0e1"
    when 'micro:bit'
      "#f78183"
    # Game lab
    when 'Animations'
      "#f78183"
    when 'Drawing'
      "#4dd0e1"
    when 'Groups'
      "#f78183"
    when 'Sprites'
      "#f78183"
    when 'World'
      "#fff176"
    end
  end

  def self.seed_all
    removed_records = all.pluck(:name)
    Dir.glob(Rails.root.join("config/programming_expressions/{applab,gamelab,weblab,spritelab}/*.json")).each do |path|
      removed_records -= [ProgrammingExpression.seed_record(path)]
    end
    Dir.glob(Rails.root.join("config/blocks/GamelabJr/*.json")).each do |path|
      removed_records -= [ProgrammingExpression.seed_record(path)]
    end
    where(name: removed_records).destroy_all
  end

  def self.seed_record(file_path)
    properties = properties_from_file(file_path, File.read(file_path))
    record = ProgrammingExpression.find_or_initialize_by(key: properties[:key], programming_environment_id: properties[:programming_environment_id])
    record.assign_attributes(properties)
    record.save! if record.changed?
    record.name
  end

  def documentation_path
    "/docs/#{programming_environment.name}/#{key}/"
  end

  def summarize_for_lesson_edit
    {
      id: id,
      category: category,
      color: color,
      key: key,
      name: name,
      link: documentation_path,
      programmingEnvironmentName: programming_environment.name,
      uniqueKey: [key, programming_environment.name].join('/')
    }
  end

  def summarize_for_lesson_show
    {name: name, color: color, syntax: syntax, link: documentation_path}
  end
end

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

  validates_uniqueness_of :key, scope: :programming_environment_id, case_sensitive: false
  validate :key_format

  serialized_attrs %w(
    color
    syntax
    image_url
    short_description
    external_documentation
    content
    return_value
    tips
    palette_params
    examples
    video_key
    block_name
  )

  def key_format
    if key.blank?
      errors.add(:base, 'Key must not be blank')
      return false
    end

    if key[0] == '.' || key[-1] == '.'
      errors.add(:base, 'Key cannot start or end with period')
      return false
    end

    key_char_re = /[A-Za-z0-9\-\_\.]/
    key_re = /\A#{key_char_re}+\Z/
    unless key_re.match?(key)
      errors.add(:base, "must only be letters, numbers, dashes, underscores, and periods. Got ${key}")
      return false
    end
    return true
  end

  def self.properties_from_file(path, content)
    expression_config = JSON.parse(content)

    environment_name = File.basename(File.dirname(path)) == 'GamelabJr' ? 'spritelab' : File.basename(File.dirname(path))
    programming_environment = ProgrammingEnvironment.find_by(name: environment_name)
    throw "Cannot find ProgrammingEnvironment #{environment_name}" unless programming_environment
    expression_config.symbolize_keys.merge(
      {
        programming_environment_id: programming_environment.id,
        color: environment_name == 'spritelab' ? expression_config['color'] : ProgrammingExpression.get_category_color(expression_config['category'])
      }
    )
  end

  def self.get_syntax(config)
    syntax = config['func']
    if config['syntax']
      syntax = config['syntax']
    elsif config['paletteParams']
      syntax = config['func'] + "(" + config['paletteParams'].map {|p| p['name']} .join(', ') + ")"
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
      syntax: syntax,
      link: documentation_path,
      programmingEnvironmentName: programming_environment.name,
      uniqueKey: [key, programming_environment.name].join('/')
    }
  end

  def summarize_for_edit
    {
      id: id,
      key: key,
      name: name,
      blockName: block_name,
      category: category,
      programmingEnvironmentName: programming_environment.name,
      environmentEditorType: programming_environment.editor_type,
      imageUrl: image_url,
      videoKey: video_key,
      shortDescription: short_description || '',
      externalDocumentation: external_documentation || '',
      content: content || '',
      syntax: syntax || '',
      returnValue: return_value || '',
      tips: tips || '',
      parameters: palette_params || [],
      examples: examples || []
    }
  end

  def summarize_for_show
    {
      name: name,
      blockName: block_name,
      category: category,
      color: get_color,
      externalDocumentation: external_documentation,
      content: content,
      syntax: syntax,
      returnValue: return_value,
      tips: tips,
      parameters: palette_params,
      examples: examples,
      programmingEnvironmentName: programming_environment.name,
      video: Video.current_locale.find_by_key(video_key)&.summarize(false),
      imageUrl: image_url
    }
  end

  def summarize_for_lesson_show
    {
      name: name,
      blockName: block_name,
      color: color,
      syntax: syntax,
      link: documentation_path
    }
  end

  def get_blocks
    return unless block_name
    return unless programming_environment.block_pool_name
    Block.for(programming_environment.block_pool_name)
  end

  def get_color
    if programming_environment.name == 'spritelab'
      color
    else
      ProgrammingExpression.get_category_color(category)
    end
  end

  def serialize
    {
      key: key,
      name: name,
      category: category,
    }.merge(properties.except('color').sort.to_h)
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    file_path = Rails.root.join("config/programming_expressions/#{programming_environment.name}/#{key.parameterize(preserve_case: true)}.json")
    object_to_serialize = serialize
    File.write(file_path, JSON.pretty_generate(object_to_serialize))
  end
end

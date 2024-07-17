# == Schema Information
#
# Table name: programming_expressions
#
#  id                                  :bigint           not null, primary key
#  name                                :string(255)      not null
#  category                            :string(255)
#  properties                          :text(65535)
#  programming_environment_id          :bigint           not null
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  key                                 :string(255)      not null
#  programming_environment_category_id :integer
#
# Indexes
#
#  index_programming_expressions_on_environment_category_id     (programming_environment_category_id)
#  index_programming_expressions_on_name_and_category           (name,category)
#  index_programming_expressions_on_programming_environment_id  (programming_environment_id)
#  programming_environment_key                                  (programming_environment_id,key) UNIQUE
#
require 'honeybadger/ruby'

class ProgrammingExpression < ApplicationRecord
  include CurriculumHelper
  include SerializedProperties
  include Rails.application.routes.url_helpers

  belongs_to :programming_environment, optional: true
  belongs_to :programming_environment_category, optional: true
  has_and_belongs_to_many :lessons, join_table: :lessons_programming_expressions
  has_many :lessons_programming_expressions

  validates_uniqueness_of :key, scope: :programming_environment_id, case_sensitive: false
  validate :validate_key_format

  after_destroy :remove_serialization
  before_destroy :check_unused

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

  def self.properties_from_file(path, content)
    expression_config = JSON.parse(content)

    environment_name = File.basename(File.dirname(path)) == 'GamelabJr' ? 'spritelab' : File.basename(File.dirname(path))
    programming_environment = ProgrammingEnvironment.find_by(name: environment_name)
    throw "Cannot find ProgrammingEnvironment #{environment_name}" unless programming_environment
    env_category = programming_environment.categories.find_by_key(expression_config['category_key'])
    color =
      if env_category
        nil
      else
        environment_name == 'spritelab' ? expression_config['color'] : ProgrammingExpression.get_category_color(expression_config['category'])
      end
    expression_config.symbolize_keys.except(:category_key, :parameters).merge(
      {
        programming_environment_id: programming_environment.id,
        programming_environment_category_id: env_category&.id,
        color: color
      }
    )
  end

  def self.get_syntax(config)
    syntax = config['func']
    if config['syntax']
      syntax = config['syntax']
    elsif config['paletteParams']
      syntax = config['func'] + "(" + config['paletteParams'].map {|p| p['name']}.join(', ') + ")"
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

  def self.seed_all(root_dir: Rails.root)
    removed_records = all.pluck(:id)
    Dir.glob(root_dir.join("config/programming_expressions/**/*.json")).each do |path|
      removed_records -= [ProgrammingExpression.seed_record(path)]
    end
    where(id: removed_records).destroy_all
  end

  def self.seed_record(file_path)
    properties = properties_from_file(file_path, File.read(file_path))
    record = ProgrammingExpression.find_or_initialize_by(key: properties[:key], programming_environment_id: properties[:programming_environment_id])
    record.assign_attributes(properties)
    record.save! if record.changed?
    record.id
  end

  def cb_documentation_path
    "/docs/#{programming_environment.name}/#{key}/"
  end

  def studio_documentation_path
    programming_environment_programming_expression_path(programming_environment.name, key)
  end

  def documentation_path
    studio_documentation_path
  end

  def summarize_for_lesson_edit
    {
      id: id,
      category: category,
      color: get_color,
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
      categoryKey: programming_environment_category&.key,
      programmingEnvironmentName: programming_environment.name,
      environmentLanguageType: programming_environment.editor_language,
      imageUrl: image_url,
      videoKey: video_key,
      shortDescription: short_description || '',
      externalDocumentation: external_documentation || '',
      content: content || '',
      syntax: syntax || '',
      returnValue: return_value || '',
      tips: tips || '',
      parameters: palette_params || [],
      examples: examples || [],
      showPath: studio_documentation_path
    }
  end

  def summarize_for_show
    {
      id: id,
      name: name,
      blockName: block_name,
      category: get_localized_property(
        :name,
        [:data,
         :programming_environments,
         programming_environment&.name,
         :categories,
         programming_environment_category&.key],
        programming_environment_category&.name
      ),
      color: get_color,
      externalDocumentation: external_documentation,
      content: get_localized_property(:content, expression_scope, content),
      syntax: get_localized_property(:syntax, expression_scope, syntax),
      returnValue: get_localized_property(:return_value, expression_scope, return_value),
      tips: get_localized_property(:tips,  expression_scope, tips),
      parameters: get_localized_params,
      examples: get_localized_examples,
      video: video_key.blank? ? nil : Video.current_locale.find_by_key(video_key)&.summarize(false),
      imageUrl: image_url
    }
  end

  def summarize_for_lesson_show
    {
      name: name,
      blockName: block_name,
      color: get_color,
      syntax: syntax,
      link: documentation_path
    }
  end

  def summarize_for_navigation
    {
      id: id,
      key: key,
      name: name,
      blockName: block_name,
      color: get_color,
      syntax: syntax,
      link: studio_documentation_path
    }
  end

  def summarize_for_all_code_docs
    {
      id: id,
      key: key,
      name: name,
      environmentId: programming_environment.id,
      environmentTitle: programming_environment.title,
      categoryName: programming_environment_category&.name,
      deletable: lessons.empty?,
      editPath: edit_programming_expression_path(self)
    }
  end

  def expression_scope
    [:data,
     :programming_environments,
     programming_environment&.name,
     :categories,
     programming_environment_category&.key,
     :expressions,
     key]
  end

  def get_localized_examples
    localized_examples = examples.deep_dup
    i18n_examples = I18n.t(
      :examples,
      scope: expression_scope,
      default: examples,
      smart: true
    )
    if i18n_examples != localized_examples
      localized_examples&.each do |example|
        if example['name'].nil?
          report_error_get_localized_examples_no_name(example)
          next
        end
        example_key = example['name'].to_sym
        unless i18n_examples[example_key].nil?
          example['name'] = i18n_examples[example_key][:name] unless i18n_examples[example_key][:name].nil?
          # code sections are not translated until expression names are marked "do not translate" in crowdin.
          # example['code'] = i18n_examples[example_key][:code] unless i18n_examples[example_key][:code].nil?
          example['description'] = i18n_examples[example_key][:description] unless i18n_examples[example_key][:description].nil?
        end
      end
    end
    localized_examples
  end

  def report_error_get_localized_examples_no_name(example)
    Honeybadger.notify(
      "example needs a unique 'name', otherwise a translation cannot be shown",
      context: {
        example: example
      }
    )
  end

  def get_localized_params
    localized_params = palette_params.deep_dup
    i18n_params = I18n.t(
      :palette_params,
      scope: expression_scope,
      default: nil,
      smart: true
    )
    unless i18n_params.nil?
      localized_params&.each do |param|
        param_key = param['name'].to_sym
        unless i18n_params[param_key].nil?
          # parameter names are not translated since they are part of the code
          # param['name'] = i18n_params[param_key][:name] unless i18n_params[param_key][:name].nil?
          param['type'] = i18n_params[param_key][:type] unless i18n_params[param_key][:type].nil?
          param['description'] = i18n_params[param_key][:description] unless i18n_params[param_key][:description].nil?
        end
      end
    end
    localized_params
  end

  def get_localized_property(property_name,  scope, default_value)
    I18n.t(
      property_name,
      scope: scope,
      default: default_value,
      smart: true
    )
  end

  def get_blocks
    return unless block_name
    return unless programming_environment.block_pool_name
    Block.for(programming_environment.block_pool_name)
  end

  def get_color
    if programming_environment_category
      programming_environment_category.color
    elsif programming_environment.name == 'spritelab'
      color
    else
      ProgrammingExpression.get_category_color(category)
    end
  end

  def file_path
    Rails.root.join("config/programming_expressions/#{programming_environment.name}/#{key.parameterize(preserve_case: false)}.json")
  end

  def serialize
    {
      key: key,
      name: name,
      category: category,
      category_key: programming_environment_category&.key
    }.merge(properties.except('color').sort.to_h)
  end

  def write_serialization
    return unless Rails.application.config.levelbuilder_mode
    object_to_serialize = serialize
    directory_name = File.dirname(file_path)
    FileUtils.mkdir_p(directory_name)
    File.write(file_path, JSON.pretty_generate(object_to_serialize))
  end

  def remove_serialization
    return unless Rails.application.config.levelbuilder_mode
    FileUtils.rm_f(file_path)
  end

  def check_unused
    return if lessons.empty?
    errors.add(:base, 'Cannot delete programming expressions that are introduced in existing lessons')
    throw(:abort)
  end

  def clone_to_programming_environment(environment_name, new_category_key = nil)
    new_env = ProgrammingEnvironment.find_by_name(environment_name)
    raise "Cannot find programming environment with name #{environment_name}" unless new_env

    # Find the category for the new expressions:
    # - if new_category_key is provided, use that
    # - if not, try to find a category with the same key as the original expression's category
    # - if that doesn't exist, search for a category with the same name as the original expression's category
    # As there's no (current) problem with an expression not having a category,
    # stop there. It won't appear in navigation but will still be valid
    new_category = nil
    if new_category_key
      new_category = new_env.categories.find_by_key(new_category_key)
    else
      new_category ||= new_env.categories.find_by_key(programming_environment_category&.key)
      new_category ||= new_env.categories.find_by_name(programming_environment_category&.name)
    end

    new_exp = dup
    new_exp.programming_environment_id = new_env.id
    new_exp.programming_environment_category_id = new_category&.id

    new_exp.save!
    new_exp.write_serialization

    new_exp
  end

  def self.get_from_cache(programming_environment_name, key)
    Rails.cache.fetch("programming_expression/#{programming_environment_name}/#{key}", force: !Unit.should_cache?) do
      env = ProgrammingEnvironment.find_by_name(programming_environment_name)
      ProgrammingExpression.includes([:programming_environment, :programming_environment_category]).find_by(programming_environment_id: env.id, key: key)
    end
  end
end

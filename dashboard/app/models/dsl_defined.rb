# Levels defined using a text-based ruby DSL syntax.
# See #BaseDSL for the DSL format implementation.
class DSLDefined < Level
  include Seeded
  after_destroy :delete_level_file

  def dsl_default
    "Enter the level definition here.\n"
  end

  def self.setup(data)
    level = find_or_create_by({ name: data[:name] })
    level.update!(name: data[:name], game_id: Game.find_by(name: self.to_s).id, properties: data[:properties])
    level
  end

  def self.dsl_class
    "#{self}DSL".constantize
  end

  # Use DSL class to parse file
  def self.parse_file(filename, name=nil)
    parse(File.read(filename), filename, name)
  end

  # Use DSL class to parse string
  def self.parse(str, filename, name=nil)
    dsl_class.parse(str,filename,name)
  end

  def self.create_from_level_builder(params, level_params)
    text = level_params[:dsl_text] || params[:dsl_text]
    transaction do
      yml_file = Rails.root.join("config/locales/#{self.to_s.underscore}.en.yml")
      i18n_strings = File.exists?(yml_file) ? YAML.load_file(yml_file) : {}
      data, i18n = dsl_class.parse(text, '')
      level = setup data
      i18n_strings.deep_merge! i18n
      File.write(yml_file, i18n_strings.to_yaml(:line_width => -1))
      File.write(Rails.root.join(level.filename), text)
      level
    end
  end

  def filename
    # Find a file in config/scripts/**/*.[class]* containing the string "name '[name]'"
    grep_string = "grep -lir \"name '#{name}'\" --include=*.#{self.class.to_s.underscore}* config/scripts"
    `#{grep_string}`.chomp.presence || "config/scripts/#{name.parameterize.underscore}.#{self.class.to_s.underscore}"
  end

  def update(params)
    if params[:dsl_text].present?
      self.class.create_from_level_builder({dsl_text: params[:dsl_text]}, {name: name})
    else
      super(params)
    end
  end

  private
  def delete_level_file
    level_file = Rails.root.join(filename)
    File.delete(level_file) if File.exists?(level_file)
  end

end

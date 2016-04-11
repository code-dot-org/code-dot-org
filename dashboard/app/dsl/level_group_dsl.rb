class LevelGroupDSL < BaseDSL
  def initialize
    super
    @id = nil
    @title = nil
    @description_short = nil
    @description = nil
    @hash[:pages] = []
    @current_page_level_names = []
    @level_names = []
    @i18n_strings = Hash.new({})
  end

  integer :id
  string :title
  string :description_short
  string :description

  def parse_output
    {name: @name, properties: @hash}
  end

  def title(text) @hash[:title] = text end

  def page
    @current_page_level_names = []
    @hash[:pages] << {levels: @current_page_level_names}
  end

  def level(name)
    # Ensure level name hasn't already been used.
    if @level_names.include? name
      raise "Don't use the same level twice in a LevelGroup (#{name})."
    end
    @level_names << name

    # Ensure level is appropriate type.
    level = Level.find_by_name(name)
    level_class = level.class.to_s.underscore
    if !['multi', 'text_match'].include? level_class
      raise "LevelGroup can only contain multi and text_match levels. (#{name} #{level_class})"
    end

    @current_page_level_names << name
  end

  def submittable(text)
    @hash[:submittable] = text
  end

  def i18n_strings
    @i18n_strings['title'] = @title if @title
    @i18n_strings['description_short'] = @description_short if @description_short
    @i18n_strings['description'] = @description if @description
    {'name'=> {@name => @i18n_strings}}
  end

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.level_group'))
  end
end

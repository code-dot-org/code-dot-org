class LevelGroupDSL < BaseDSL
  def initialize
    super
    @id = nil
    @title = nil
    @description_short = nil
    @description = nil
    @hash[:pages] = []
    @hash[:texts] = []
    @hash[:options] = {skip_dialog: true, skip_sound: true}
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

  def text(name)
    # Ensure level is appropriate type.
    level = Script.cache_find_level(name)
    if level.nil?
      raise "Unable to locate level '#{name}'"
    end
    level_class = level.class.to_s.underscore
    unless level_class == "external"
      raise "LevelGroup text must be a level of type external. (#{name})"
    end

    # Record the name of the external level, as well as the index of the actual level
    # it appears immediately before.
    @hash[:texts] << {level_name: name, index: @level_names.length}
  end

  def level(name)
    # Ensure level name hasn't already been used.
    if @level_names.include? name
      raise "Don't use the same level twice in a LevelGroup (#{name})."
    end
    @level_names << name

    # Ensure level is appropriate type.
    level = Level.where(name: name).first # For some reason find_by_name doesn't always work here!
    if level.nil?
      raise "Unable to locate level '#{name}'"
    end
    if level.is_a?(FreeResponse) && level.allow_user_uploads?
      raise "User uploads aren't supported in a LevelGroup (due to global channel) '#{name}'"
    end
    level_class = level.class.to_s.underscore
    unless %w(multi text_match free_response evaluation_multi).include? level_class
      raise "LevelGroup cannot contain level type #{level_class}"
    end

    @current_page_level_names << name
  end

  def submittable(text)
    @hash[:submittable] = text
  end

  # An anonymous LevelGroup is used for student surveys.  The results can only be viewed
  # in an anonymized form in the teacher dashboard, and teachers may not see individual
  # students' submissions for such levels.
  def anonymous(text)
    @hash[:anonymous] = text
  end

  def i18n_strings
    @i18n_strings['title'] = @title if @title
    @i18n_strings['description_short'] = @description_short if @description_short
    @i18n_strings['description'] = @description if @description
    {'name' => {@name => @i18n_strings}}
  end

  def self.serialize(level)
    properties = level.properties
    new_dsl = "name '#{level.name}'"
    new_dsl << "\ntitle '#{properties['title']}'" if properties['title']
    new_dsl << "\nsubmittable '#{properties['submittable']}'" if properties['submittable']
    new_dsl << "\nanonymous '#{properties['anonymous']}'" if properties['anonymous']

    texts = properties['texts'] || []
    level.pages.each do |page|
      new_dsl << "\n\npage"
      page.levels.each_with_index do |sublevel, index|
        texts.select {|text| text['index'] == page.offset + index}.each do |text|
          new_dsl << "\ntext '#{text['level_name']}'"
        end
        new_dsl << "\nlevel '#{sublevel.name}'"
      end
    end
    new_dsl
  end

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.level_group'))
  end
end

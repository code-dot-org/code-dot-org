class LevelGroupDSL < LevelDSL
  def initialize
    super
    @id = nil
    @title = nil
    @description_short = nil
    @description = nil
    @hash[:options] = {skip_dialog: true, skip_sound: true}
    @current_page_level_and_text_names = []
    @level_and_text_names = []
    @pages = []
  end

  # @override
  def parse_output
    super.merge(pages: @pages)
  end

  # @override
  def self.i18n_fields
    super + %w(
      description
      description_short
      title
    )
  end

  integer :id
  string :title
  string :description_short
  string :description

  def title(text) @hash[:title] = text end

  def page
    @current_page_level_and_text_names = []
    @pages << {levels: @current_page_level_and_text_names}
  end

  def text(name)
    # Ensure level name hasn't already been used.
    if @level_and_text_names.include? name
      raise "Don't use the same level twice in a LevelGroup (#{name})."
    end
    @level_and_text_names << name

    # Ensure level is appropriate type.
    level = Script.cache_find_level(name)
    if level.nil?
      raise "Unable to locate level '#{name}'"
    end
    level_class = level.class.to_s.underscore
    unless level_class == "external"
      raise "LevelGroup text must be a level of type external. (#{name})"
    end

    @current_page_level_and_text_names << name
  end

  def level(name)
    # Ensure level name hasn't already been used.
    if @level_and_text_names.include? name
      raise "Don't use the same level twice in a LevelGroup (#{name})."
    end
    @level_and_text_names << name

    # Ensure level is appropriate type.
    level = Level.where(name: name).first # For some reason find_by_name doesn't always work here!
    if level.nil?
      raise "Unable to locate level '#{name}'"
    end
    if level.is_a?(FreeResponse) && level.allow_user_uploads?
      raise "User uploads aren't supported in a LevelGroup (due to global channel) '#{name}'"
    end
    level_class = level.class.to_s.underscore
    unless %w(multi match text_match free_response evaluation_multi).include? level_class
      raise "LevelGroup cannot contain level type #{level_class}"
    end

    @current_page_level_and_text_names << name
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

  def self.serialize(level)
    properties = level.properties
    new_dsl = "name '#{level.name}'"
    new_dsl << "\ntitle '#{properties['title']}'" if properties['title']
    new_dsl << "\nsubmittable '#{properties['submittable']}'" if properties['submittable']
    new_dsl << "\nanonymous '#{properties['anonymous']}'" if properties['anonymous']

    level.pages.each do |page|
      new_dsl << "\n\npage"
      page.levels_and_texts.each do |sublevel|
        command = sublevel.is_a?(External) ? 'text' : 'level'
        new_dsl << "\n#{command} '#{sublevel.name}'"
      end
    end
    new_dsl
  end

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.level_group'))
  end
end

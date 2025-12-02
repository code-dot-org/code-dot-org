class BubbleChoiceDSL < ContentDSL
  def initialize
    super
    @hash[:display_name] = nil
    @hash[:description] = nil
    @hash[:sublevels] = []
  end

  # @override
  def self.i18n_fields
    super + %w(description display_name)
  end

  def display_name(text) @hash[:display_name] = text end

  def description(text) @hash[:description] = text end

  def standalone
    unless @hash[:uses_lab2]
      raise "BubbleChoice standalone projects are only available with Lab2."
    end
    @hash[:is_project_level] = true
  end

  def sublevels
    @hash[:sublevels]
  end

  def level(name)
    # Ensure level name hasn't already been used.
    if @hash[:sublevels].include?(name)
      raise "Don't use the same level twice in a BubbleChoice (#{name})."
    end

    # Ensure level exists.
    if Level.find_by(name: name).nil?
      raise "Unable to locate level '#{name}'."
    end

    @hash[:sublevels] << name
  end

  def custom_mode(text)
    valid_modes = SharedConstants::BUBBLE_CHOICE_CUSTOM_MODES.values
    unless valid_modes.include?(text)
      raise "custom_mode must be one of [#{valid_modes.join(', ')}]"
    end
    @hash[:custom_mode] = text
  end

  def navigation_type(type)
    valid_types = SharedConstants::BUBBLE_CHOICE_NAVIGATION_TYPES.values
    unless valid_types.include?(type)
      raise "Invalid navigation_type '#{type}'. Valid types are: #{valid_types.join(', ')}"
    end
    @hash[:navigation_type] = type
  end

  def finish_dialog(text) @hash[:finish_dialog] = text end

  def hide_share_and_remix(value) @hash[:hide_share_and_remix] = value end

  def self.serialize(level)
    new_dsl = "name '#{escape(level.name)}'"
    new_dsl += "\neditor_experiment '#{level.editor_experiment}'" if level.editor_experiment.present?
    new_dsl += "\ndisplay_name '#{escape(level.display_name)}'" if level.display_name.present?
    new_dsl += "\ndescription '#{escape(level.description)}'" if level.description.present?

    new_dsl += "\n\nsublevels" if level.sublevels.any?
    level.sublevels.each do |sublevel|
      new_dsl += "\nlevel '#{sublevel.name}'"
    end

    new_dsl += "\n"
    new_dsl
  end

  def self.escape(str)
    str.gsub("'", "\\\\'")
  end
end

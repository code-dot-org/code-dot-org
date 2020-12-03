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

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.bubble_choice'))
  end

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

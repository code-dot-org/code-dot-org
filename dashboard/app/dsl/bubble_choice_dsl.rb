class BubbleChoiceDSL < LevelDSL
  def initialize
    super
    @hash[:display_name] = nil
    @hash[:description] = nil
    @hash[:sublevels] = []
    @i18n_strings = Hash.new({})
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

  def i18n_strings
    @i18n_strings['display_name'] = @hash[:display_name] if @hash[:display_name]
    @i18n_strings['description'] = @hash[:description] if @hash[:description]
    @i18n_strings
  end

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.bubble_choice'))
  end
end

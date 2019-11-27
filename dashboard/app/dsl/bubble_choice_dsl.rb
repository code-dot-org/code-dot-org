class BubbleChoiceDSL < LevelDSL
  def initialize
    super
    @hash[:display_name] = nil
    @hash[:description] = nil
    @hash[:sublevels] = []
  end

  def self.non_i18n_fieldnames
    super + %w(display_name sublevels)
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
end

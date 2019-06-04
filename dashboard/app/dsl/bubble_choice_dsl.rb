class BubbleChoiceDSL < BaseDSL
  def initialize
    super
    @hash[:title] = nil
    @hash[:description] = nil
    @hash[:sublevels] = []
    @i18n_strings = Hash.new({})
  end

  def parse_output
    {name: @name, properties: @hash}
  end

  def title(text) @hash[:title] = text end

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
    @i18n_strings['title'] = @hash[:title] if @hash[:title]
    @i18n_strings['description'] = @hash[:description] if @hash[:description]
    {'name' => {@name => @i18n_strings}}
  end

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.bubble_choice'))
  end
end

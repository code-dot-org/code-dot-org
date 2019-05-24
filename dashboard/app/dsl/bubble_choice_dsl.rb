class BubbleChoiceDSL < BaseDSL
  def initialize
    super
    @hash[:sublevels] = []
    @i18n_strings = Hash.new({})
  end

  def parse_output
    {name: @name, properties: @hash}
  end

  def sublevels
    @hash[:sublevels]
  end

  def level(name)
    # Ensure level name hasn't already been used.
    if @hash[:sublevels].include?(name)
      raise "Don't use the same level twice in a BubbleChoice: (#{name})."
    end

    # Ensure level exists.
    if Level.find_by(name: name).nil?
      raise "Unable to locate level '#{name}'."
    end

    @hash[:sublevels] << name
  end

  def i18n_strings
    {'name' => {@name => @i18n_strings}}
  end

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.bubble_choice'))
  end
end

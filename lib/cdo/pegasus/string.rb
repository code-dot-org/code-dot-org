class String

  # Returns true if the string ends with the string passed
  def ends_with?(s)
    self[-s.length..-1] == s
  end

  # Returns true if the string contains any one of the strings passed
  def include_one_of?(*items)
    items.flatten.each do |item|
      return true if self.include?(item)
    end
    false
  end

  # Converts a string to a boolean
  unless method_defined?(:to_bool) # May be provided by Rails
    def to_bool()
      return true if self =~ (/^(true|t|yes|y|1)$/i)
      return false if self.empty? || self =~ (/^(false|f|no|n|0)$/i)
      raise ArgumentError.new("'#{self}' is not convertable to true/false.")
    end
  end

  # Returns each instance of left concatted with each instance of right.
  # So: ['a','b'], ['c','d'] becomes ['ac', 'ad', 'bc', 'bd']
  def self.multiply_concat(left,right)
    left = [left] unless left.is_a?(Enumerable)
    right = [right] unless right.is_a?(Enumerable)
    left.map{|l| right.map{|r| l.to_s + r.to_s}}.flatten
  end

  # squish and squish! copied from rails:
  # https://github.com/rails/rails/blob/cada218f539265c6c44002833dc41b36be7738d3/activesupport/lib/active_support/core_ext/string/filters.rb#L11

  # Returns the string, first removing all whitespace on both ends of
  # the string, and then changing remaining consecutive whitespace
  # groups into one space each.
  #
  # Note that it handles both ASCII and Unicode whitespace like mongolian vowel separator (U+180E).
  #
  #   %{ Multi-line
  #      string }.squish                   # => "Multi-line string"
  #   " foo   bar    \n   \t   boo".squish # => "foo bar boo"
  def squish
    dup.squish!
  end

  # Performs a destructive squish. See String#squish.
  def squish!
    gsub!(/\A[[:space:]]+/, '')
    gsub!(/[[:space:]]+\z/, '')
    gsub!(/[[:space:]]+/, ' ')
    self
  end

end

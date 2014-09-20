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

end

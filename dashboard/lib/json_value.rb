# Utility for formatting JSON values from string input
class JSONValue
  def self.numeric?(val)
    !Float(val).nil? rescue false
  end

  def self.integral?(val)
    !Integer(val).nil? rescue false
  end

  def self.boolean?(val)
    val == boolean_string_true || val == boolean_string_false
  end

  def self.value(val)
    if integral?(val)
      Integer(val)
    elsif numeric?(val)
      Float(val)
    elsif boolean?(val)
      val == boolean_string_true
    else
      val
    end
  end

  def self.boolean_string_true
    'true'
  end

  def self.boolean_string_false
    'false'
  end

end

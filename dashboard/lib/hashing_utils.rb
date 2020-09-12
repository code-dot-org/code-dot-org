require 'digest'

module HashingUtils
  def self.hash_values(values)
    string_values = values.map(&:to_s)
    delimiter = '|'
    if string_values.any? {|v| v.include?(delimiter)}
      raise "Values cannot contain delimiter #{delimiter}: #{string_values}"
    end

    return Digest::MD5.hexdigest(string_values.join(delimiter))
  end
end
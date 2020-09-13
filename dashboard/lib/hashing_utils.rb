require 'digest'

module HashingUtils
  def self.hash_values(values)
    string_values = values.map(&:to_s)
    return Digest::MD5.hexdigest(string_values.join('|'))
  end
end

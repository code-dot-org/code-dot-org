require 'digest'

module HashingUtils
  def self.hash_values(values)
    string_values = values.map(&:to_s)
    return Digest::MD5.hexdigest(string_values.join('|'))
  end

  def self.seeding_key_from_ruby_hash(hash)
    stringified_entries = JSON.generate(hash.entries.sort_by {|k, _| k})
    Digest::MD5.hexdigest(stringified_entries)
  end
end

require 'digest'
require 'json'

module HashingUtils
  # Generates an MD5 hash for the given ruby hash (the data structure, aka hashmap). Only supports simple
  # types (strings, numbers, booleans, nil) and arrays of simple types.
  #
  # @param [Hash] ruby_hash - A ruby hash.
  # @return [String] an MD5 hash which can uniquely identify the given ruby hash.
  def self.ruby_hash_to_md5_hash(ruby_hash)
    # sort the entries to ensure that ordering in the hash doesn't matter -
    # {a: 1, b: 2} and {b: 2, a: 1} should produce the same output
    stringified_hash = JSON.generate(ruby_hash.entries.sort_by(&:first))
    Digest::MD5.hexdigest(stringified_hash)
  end
end

# == Schema Information
#
# Table name: level_sources
#
#  id         :integer          not null, primary key
#  level_id   :integer
#  md5        :string(32)       not null
#  data       :string(20000)    not null
#  created_at :datetime
#  updated_at :datetime
#  hidden     :boolean          default(FALSE)
#
# Indexes
#
#  index_level_sources_on_level_id_and_md5  (level_id,md5)
#

require 'digest/md5'

# A specific solution attempt for a specific level
class LevelSource < ActiveRecord::Base
  # TODO(asher): At some point, the following string appeared in program XML.
  #   XMLNS_STRING = ' xmlns="http://www.w3.org/1999/xhtml"'
  # It remains in some old LevelSource.data. Migrate any existing LevelSource
  # with this string to a LevelSource without via
  #   data = self.data.gsub(XMLNS_STRING, '')
  # For more context, see https://github.com/code-dot-org/code-dot-org/pull/13579.
  belongs_to :level
  has_one :level_source_image
  has_many :activities

  validates_length_of :data, maximum: 20000
  validates :data, no_utf8mb4: true

  before_save :recompute_md5

  def recompute_md5
    self.md5 = Digest::MD5.hexdigest(data)
  end

  def self.cache_key(level_id, md5)
    "#{level_id}-#{md5}"
  end

  # Returns an obfuscated ID (URL) from which the LevelSource can be accessed.
  # @param [Integer] user_id The ID of the user to obfuscate the LevelSource ID with. Note that the
  #   user_id is a source for obfuscation only, not authorization or authentication.
  # @return [String] The /c/ link, incorporating the user ID and the level source ID.
  def c_link_from_user_id(user_id)
    raise unless user_id
    Base64.urlsafe_encode64 "#{id}:#{user_id}"
  end

  # Returns the LevelSource ID associated with an unobfuscated or obfuscated /c/ link. If the link
  # is obfuscated and verify_user is true, returns nil if the obfuscated user does not exist and in various edge (error) cases.
  # @param [String] c_link The /c/ link, unobfuscated or obfuscated.
  # @param [Boolean] verify_user Whether the user's existence should be verified.
  # @return [Integer, nil] The associated LevelSource ID.
  def self.level_source_id_from_c_link(c_link, verify_user:)
    # The /c/ link is not obfuscated, so simply return it.
    return c_link.to_i if c_link == c_link.to_i.to_s

    # The /c/ link is obfuscated, so decode it, verifying the existence of the obfuscated user as
    # appropriate.
    begin
      level_source_id_and_user_id = Base64.urlsafe_decode64 c_link
    rescue ArgumentError
      return nil
    end
    level_source_id, user_id = level_source_id_and_user_id.split(':').map(&:to_i)

    if verify_user
      associated_user = User.find_by_id user_id
      return nil unless associated_user
    end

    level_source_id
  end

  def self.find_identical_or_create(level, data)
    md5 = Digest::MD5.hexdigest(data)

    Rails.cache.fetch(cache_key(level.id, md5)) do
      LevelSource.where(level: level, md5: md5).first_or_create do |ls|
        ls.data = data
      end
    end
  end
end

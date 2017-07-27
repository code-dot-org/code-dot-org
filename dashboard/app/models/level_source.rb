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

  def self.find_identical_or_create(level, data)
    md5 = Digest::MD5.hexdigest(data)

    Rails.cache.fetch(cache_key(level.id, md5)) do
      LevelSource.where(level: level, md5: md5).first_or_create do |ls|
        ls.data = data
      end
    end
  end
end

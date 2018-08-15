# == Schema Information
#
# Table name: concepts
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime
#  updated_at :datetime
#  video_id   :integer
#
# Indexes
#
#  index_concepts_on_video_id  (video_id)
#

# A Concept contains a set of Levels
# A Video can be associated with a Concept
# Trophies are awarded based on percentage completion of Concepts
class Concept < ActiveRecord::Base
  include Seeded
  has_and_belongs_to_many :levels
  belongs_to :video
  # Can't call static from filter. Leaving in place for fixing later
  #after_save :expire_cache

  def self.by_name(name)
    (@@name_cache ||= Concept.all.index_by(&:name))[name].try(:id)
  end

  def self.cached
    @@all_cache ||= Concept.all
  end

  def self.expire_cache
    @@all_cache = nil
    @@name_cache = nil
  end

  CONCEPT_NAMES_BY_INDEX = %w(
    sequence
    if
    if_else
    loop_times
    loop_until
    loop_while
    loop_for
    function parameters
  ).freeze

  def self.setup
    setup_with_concepts(CONCEPT_NAMES_BY_INDEX)
  end

  def self.setup_with_concepts(concepts_by_index)
    videos_by_concept = Video.where(key: concepts_by_index).index_by(&:key)
    concepts = concepts_by_index.map.with_index(1) do |concept, id|
      {id: id, name: concept, video_id: videos_by_concept[concept]&.id}
    end
    transaction do
      reset_db
      Concept.import! concepts
    end
  end
end

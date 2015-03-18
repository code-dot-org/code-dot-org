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

  CONCEPT_NAMES_BY_INDEX = %w(sequence if if_else loop_times loop_until loop_while loop_for function parameters)

  def self.setup
    self.setup_with_concepts(CONCEPT_NAMES_BY_INDEX)
  end

  def self.setup_with_concepts(concepts_by_index)
    transaction do
      reset_db
      concepts_by_index.each_with_index do |concept, id|
        Concept.create!(id: id + 1, name: concept, video: Video.find_by_key(concept))
      end
    end
  end
end

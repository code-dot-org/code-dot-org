# == Schema Information
#
# Table name: concepts
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  created_at :datetime
#  updated_at :datetime
#  video_key  :string(255)
#
# Indexes
#
#  index_concepts_on_video_key  (video_key)
#

# A Concept contains a set of Levels
# A Video can be associated with a Concept
# Trophies are awarded based on percentage completion of Concepts
class Concept < ApplicationRecord
  include Seeded
  has_and_belongs_to_many :levels

  def self.by_name(name)
    Rails.cache.fetch("concepts/names/#{name}") do
      Concept.find_by_name(name).try(:id)
    end
  end

  def self.cached
    Rails.cache.fetch("concepts/all") do
      Concept.all
    end
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
      {id: id, name: concept, video_key: videos_by_concept[concept]&.key}
    end
    transaction do
      reset_db
      Concept.import! concepts
    end
  end

  def related_video
    Rails.cache.fetch("concepts/videos/#{video_key}/#{I18n.locale}") do
      Video.current_locale.find_by_key(video_key)
    end
  end
end

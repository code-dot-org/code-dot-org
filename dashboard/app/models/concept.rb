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

  def self.by_name(name)
    (@@name_cache ||= Concept.all.index_by(&:name))[name].try(:id)
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
    transaction do
      reset_db
      concepts_by_index.each_with_index do |concept, id|
        Concept.create!(id: id + 1, name: concept, video: Video.find_by_key(concept))
      end
    end
  end
end

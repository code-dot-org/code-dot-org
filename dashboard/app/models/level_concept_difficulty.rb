# == Schema Information
#
# Table name: level_concept_difficulties
#
#  id                    :integer          not null, primary key
#  level_id              :integer
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  sequencing            :integer
#  debugging             :integer
#  repeat_loops          :integer
#  repeat_until_while    :integer
#  for_loops             :integer
#  events                :integer
#  variables             :integer
#  functions             :integer
#  functions_with_params :integer
#  conditionals          :integer
#
# Indexes
#
#  index_level_concept_difficulties_on_level_id  (level_id)
#

class LevelConceptDifficulty < ActiveRecord::Base
  include ConceptDifficulties
  belongs_to :level
  validates :level, presence: true

  def serializable_hash(options=nil)
    super.compact.delete_if do |key, _|
      %w(id level_id updated_at created_at).include? key
    end
  end

  # All unspecified attributes default to nil; otherwise, attempting to remove
  # an already-assigned concept won't work.
  def assign_attributes(attrs)
    defaults = Hash[CONCEPTS.map { |concept| [concept, nil] }]
    super(defaults.merge(attrs))
  end
end

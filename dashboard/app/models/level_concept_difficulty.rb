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

class LevelConceptDifficulty < ApplicationRecord
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
    # Skip this behavior when first creating the record; it's not needed (there
    # is nothing to unset) and it interferes with setting up the association
    # with level, which requires multiple assign_attributes calls from deep
    # within ActiveRecord.
    return super if new_record?

    # Otherwise, make sure we write `nil` over unpassed attributes
    defaults = Hash[CONCEPTS.map {|concept| [concept, nil]}]
    super(defaults.merge(attrs))
  end

  # @return [String] a string representation of the row.
  def concept_difficulties_as_string
    concepts = []
    concepts << "seq: #{sequencing}" if sequencing
    concepts << "debug: #{debugging}" if debugging
    concepts << "repeat: #{repeat_loops}" if repeat_loops
    concepts << "repeat_until: #{repeat_until_while}" if repeat_until_while
    concepts << "for: #{for_loops}" if for_loops
    concepts << "events: #{events}" if events
    concepts << "vars: #{variables}" if variables
    concepts << "funcs: #{functions}" if functions
    concepts << "funcs_with_params: #{functions_with_params}" if functions_with_params
    concepts << "cond: #{conditionals}" if conditionals
    return concepts.join(', ')
  end
end

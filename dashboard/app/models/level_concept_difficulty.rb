# == Schema Information
#
# Table name: level_concept_difficulties
#
#  id                    :integer          not null, primary key
#  level_id              :integer
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  sequencing            :integer          default(0), not null
#  debugging             :integer          default(0), not null
#  repeat_loops          :integer          default(0), not null
#  repeat_until_while    :integer          default(0), not null
#  for_loops             :integer          default(0), not null
#  events                :integer          default(0), not null
#  variables             :integer          default(0), not null
#  functions             :integer          default(0), not null
#  functions_with_params :integer          default(0), not null
#  conditionals          :integer          default(0), not null
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
    super.delete_if { |key, _|
      %w(id level_id updated_at created_at).include? key
    }
  end
end

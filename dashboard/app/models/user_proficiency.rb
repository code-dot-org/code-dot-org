# == Schema Information
#
# Table name: user_proficiencies
#
#  id                             :integer          not null, primary key
#  user_id                        :integer          not null
#  created_at                     :datetime         not null
#  updated_at                     :datetime         not null
#  last_progress_at               :datetime
#  sequencing_d1_count            :integer          default(0)
#  sequencing_d2_count            :integer          default(0)
#  sequencing_d3_count            :integer          default(0)
#  sequencing_d4_count            :integer          default(0)
#  sequencing_d5_count            :integer          default(0)
#  debugging_d1_count             :integer          default(0)
#  debugging_d2_count             :integer          default(0)
#  debugging_d3_count             :integer          default(0)
#  debugging_d4_count             :integer          default(0)
#  debugging_d5_count             :integer          default(0)
#  repeat_loops_d1_count          :integer          default(0)
#  repeat_loops_d2_count          :integer          default(0)
#  repeat_loops_d3_count          :integer          default(0)
#  repeat_loops_d4_count          :integer          default(0)
#  repeat_loops_d5_count          :integer          default(0)
#  repeat_until_while_d1_count    :integer          default(0)
#  repeat_until_while_d2_count    :integer          default(0)
#  repeat_until_while_d3_count    :integer          default(0)
#  repeat_until_while_d4_count    :integer          default(0)
#  repeat_until_while_d5_count    :integer          default(0)
#  for_loops_d1_count             :integer          default(0)
#  for_loops_d2_count             :integer          default(0)
#  for_loops_d3_count             :integer          default(0)
#  for_loops_d4_count             :integer          default(0)
#  for_loops_d5_count             :integer          default(0)
#  events_d1_count                :integer          default(0)
#  events_d2_count                :integer          default(0)
#  events_d3_count                :integer          default(0)
#  events_d4_count                :integer          default(0)
#  events_d5_count                :integer          default(0)
#  variables_d1_count             :integer          default(0)
#  variables_d2_count             :integer          default(0)
#  variables_d3_count             :integer          default(0)
#  variables_d4_count             :integer          default(0)
#  variables_d5_count             :integer          default(0)
#  functions_d1_count             :integer          default(0)
#  functions_d2_count             :integer          default(0)
#  functions_d3_count             :integer          default(0)
#  functions_d4_count             :integer          default(0)
#  functions_d5_count             :integer          default(0)
#  functions_with_params_d1_count :integer          default(0)
#  functions_with_params_d2_count :integer          default(0)
#  functions_with_params_d3_count :integer          default(0)
#  functions_with_params_d4_count :integer          default(0)
#  functions_with_params_d5_count :integer          default(0)
#  conditionals_d1_count          :integer          default(0)
#  conditionals_d2_count          :integer          default(0)
#  conditionals_d3_count          :integer          default(0)
#  conditionals_d4_count          :integer          default(0)
#  conditionals_d5_count          :integer          default(0)
#  basic_proficiency_at           :datetime
#
# Indexes
#
#  index_user_proficiencies_on_user_id  (user_id)
#

class UserProficiency < ActiveRecord::Base
  include ConceptDifficulties
  belongs_to :user

  # WARNING: This class makes strong assumptions about the columns in the DB.

  # Returns the number of levels the user has shown proficiency in for the
  # indicated concept and difficulty or higher.
  def get_level_count(concept, difficulty_number)
    return 0 if !CONCEPTS.include? concept
    return 0 if !(1..MAXIMUM_CONCEPT_DIFFICULTY).cover? difficulty_number

    num_levels = 0
    (difficulty_number..MAXIMUM_CONCEPT_DIFFICULTY).each do |d|
      field_name = "#{concept}_d#{d}_count"
      num_levels += self.send(field_name).to_i
    end
    return num_levels
  end

  # Increments the number of levels the user has shown proficiency in for the
  # indicated concept and difficulty.
  def increment_level_count(concept, difficulty_number)
    field_name = "#{concept}_d#{difficulty_number}_count"
    self.attributes = {field_name => self.send(field_name).to_i + 1}
  end

  # As of April 2015, we define a user as having basic proficiency if they have
  # shown proficiency in three meta-concepts amongst sequencing, loops
  # (encompassing repeat_loops, repeat_until_while, and for_loops), events,
  # variables, functions (encompassing functions and functions_with_params), and
  # conditionals. A user demonstrates proficiency in a concept by having three
  # or more total D3, D4, or D5 levels.
  # WARNING (April 2015): This definition is expected to change, possibly with
  # an age-related bent.
  def basic_proficiency?
    concept_proficiency_count = 0
    # Meta-concepts with one sub-concept.
    %w(sequencing events variables conditionals).each do |concept|
      if get_level_count(concept, 3) >= 3
        concept_proficiency_count += 1
      end
    end
    # The loops meta-concept.
    if get_level_count('repeat_loops', 3) >= 3 ||
       get_level_count('repeat_until_while', 3) >= 3 ||
       get_level_count('for_loops', 3) >= 3
      concept_proficiency_count += 1
    end
    # The functions meta-concept.
    if get_level_count('functions', 3) >= 3 ||
       get_level_count('functions_with_params', 3) >= 3
      concept_proficiency_count += 1
    end

    return concept_proficiency_count >= 3
  end
end

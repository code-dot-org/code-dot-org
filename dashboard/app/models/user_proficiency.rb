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
#  index_user_proficiencies_on_user_id  (user_id) UNIQUE
#

class UserProficiency < ApplicationRecord
  include ConceptDifficulties
  belongs_to :user

  # WARNING: This class makes strong assumptions about the columns in the DB.

  # Returns the number of levels the user has shown proficiency in for the
  # indicated concept and difficulty or higher.
  # @param concept [String] the concept to retrieve.
  # @param difficulty [Integer] the difficulty level to retrieve.
  # @return [Integer] the number of levels the user has passed with the
  #   specified concept and the specified difficulty or higher.
  def get_level_count(concept, difficulty)
    if concept == ConceptDifficulties::SEQUENCING
      if difficulty == 1
        return sequencing_d1_count + sequencing_d2_count + sequencing_d3_count + sequencing_d4_count + sequencing_d5_count
      elsif difficulty == 2
        return sequencing_d2_count + sequencing_d3_count + sequencing_d4_count + sequencing_d5_count
      elsif difficulty == 3
        return sequencing_d3_count + sequencing_d4_count + sequencing_d5_count
      elsif difficulty == 4
        return sequencing_d4_count + sequencing_d5_count
      elsif difficulty == 5
        return sequencing_d5_count
      end
    elsif concept == ConceptDifficulties::DEBUGGING
      if difficulty == 1
        return debugging_d1_count + debugging_d2_count + debugging_d3_count + debugging_d4_count + debugging_d5_count
      elsif difficulty == 2
        return debugging_d2_count + debugging_d3_count + debugging_d4_count + debugging_d5_count
      elsif difficulty == 3
        return debugging_d3_count + debugging_d4_count + debugging_d5_count
      elsif difficulty == 4
        return debugging_d4_count + debugging_d5_count
      elsif difficulty == 5
        return debugging_d5_count
      end
    elsif concept == ConceptDifficulties::REPEAT_LOOPS
      if difficulty == 1
        return repeat_loops_d1_count + repeat_loops_d2_count + repeat_loops_d3_count + repeat_loops_d4_count + repeat_loops_d5_count
      elsif difficulty == 2
        return repeat_loops_d2_count + repeat_loops_d3_count + repeat_loops_d4_count + repeat_loops_d5_count
      elsif difficulty == 3
        return repeat_loops_d3_count + repeat_loops_d4_count + repeat_loops_d5_count
      elsif difficulty == 4
        return repeat_loops_d4_count + repeat_loops_d5_count
      elsif difficulty == 5
        return repeat_loops_d5_count
      end
    elsif concept == ConceptDifficulties::REPEAT_UNTIL_WHILE
      if difficulty == 1
        return repeat_until_while_d1_count + repeat_until_while_d2_count + repeat_until_while_d3_count + repeat_until_while_d4_count + repeat_until_while_d5_count
      elsif difficulty == 2
        return repeat_until_while_d2_count + repeat_until_while_d3_count + repeat_until_while_d4_count + repeat_until_while_d5_count
      elsif difficulty == 3
        return repeat_until_while_d3_count + repeat_until_while_d4_count + repeat_until_while_d5_count
      elsif difficulty == 4
        return repeat_until_while_d4_count + repeat_until_while_d5_count
      elsif difficulty == 5
        return repeat_until_while_d5_count
      end
    elsif concept == ConceptDifficulties::FOR_LOOPS
      if difficulty == 1
        return for_loops_d1_count + for_loops_d2_count + for_loops_d3_count + for_loops_d4_count + for_loops_d5_count
      elsif difficulty == 2
        return for_loops_d2_count + for_loops_d3_count + for_loops_d4_count + for_loops_d5_count
      elsif difficulty == 3
        return for_loops_d3_count + for_loops_d4_count + for_loops_d5_count
      elsif difficulty == 4
        return for_loops_d4_count + for_loops_d5_count
      elsif difficulty == 5
        return for_loops_d5_count
      end
    elsif concept == ConceptDifficulties::EVENTS
      if difficulty == 1
        return events_d1_count + events_d2_count + events_d3_count + events_d4_count + events_d5_count
      elsif difficulty == 2
        return events_d2_count + events_d3_count + events_d4_count + events_d5_count
      elsif difficulty == 3
        return events_d3_count + events_d4_count + events_d5_count
      elsif difficulty == 4
        return events_d4_count + events_d5_count
      elsif difficulty == 5
        return events_d5_count
      end
    elsif concept == ConceptDifficulties::VARIABLES
      if difficulty == 1
        return variables_d1_count + variables_d2_count + variables_d3_count + variables_d4_count + variables_d5_count
      elsif difficulty == 2
        return variables_d2_count + variables_d3_count + variables_d4_count + variables_d5_count
      elsif difficulty == 3
        return variables_d3_count + variables_d4_count + variables_d5_count
      elsif difficulty == 4
        return variables_d4_count + variables_d5_count
      elsif difficulty == 5
        return variables_d5_count
      end
    elsif concept == ConceptDifficulties::FUNCTIONS
      if difficulty == 1
        return functions_d1_count + functions_d2_count + functions_d3_count + functions_d4_count + functions_d5_count
      elsif difficulty == 2
        return functions_d2_count + functions_d3_count + functions_d4_count + functions_d5_count
      elsif difficulty == 3
        return functions_d3_count + functions_d4_count + functions_d5_count
      elsif difficulty == 4
        return functions_d4_count + functions_d5_count
      elsif difficulty == 5
        return functions_d5_count
      end
    elsif concept == ConceptDifficulties::FUNCTIONS_WITH_PARAMS
      if difficulty == 1
        return functions_with_params_d1_count + functions_with_params_d2_count + functions_with_params_d3_count + functions_with_params_d4_count + functions_with_params_d5_count
      elsif difficulty == 2
        return functions_with_params_d2_count + functions_with_params_d3_count + functions_with_params_d4_count + functions_with_params_d5_count
      elsif difficulty == 3
        return functions_with_params_d3_count + functions_with_params_d4_count + functions_with_params_d5_count
      elsif difficulty == 4
        return functions_with_params_d4_count + functions_with_params_d5_count
      elsif difficulty == 5
        return functions_with_params_d5_count
      end
    elsif concept == ConceptDifficulties::CONDITIONALS
      if difficulty == 1
        return conditionals_d1_count + conditionals_d2_count + conditionals_d3_count + conditionals_d4_count + conditionals_d5_count
      elsif difficulty == 2
        return conditionals_d2_count + conditionals_d3_count + conditionals_d4_count + conditionals_d5_count
      elsif difficulty == 3
        return conditionals_d3_count + conditionals_d4_count + conditionals_d5_count
      elsif difficulty == 4
        return conditionals_d4_count + conditionals_d5_count
      elsif difficulty == 5
        return conditionals_d5_count
      end
    end

    raise ArgumentError.new("invalid concept-difficulty (#{concept}, #{difficulty})")
  end

  # Increments by one the number of levels the user has shown proficiency in for
  # the indicated concept and difficulty.
  # @param concept [String] the concept to increment.
  # @param difficulty [Integer] the difficulty level to increment.
  def increment_level_count(concept, difficulty)
    if concept == ConceptDifficulties::SEQUENCING
      if difficulty == 1
        self.sequencing_d1_count += 1
      elsif difficulty == 2
        self.sequencing_d2_count += 1
      elsif difficulty == 3
        self.sequencing_d3_count += 1
      elsif difficulty == 4
        self.sequencing_d4_count += 1
      elsif difficulty == 5
        self.sequencing_d5_count += 1
      end
    elsif concept == ConceptDifficulties::DEBUGGING
      if difficulty == 1
        self.debugging_d1_count += 1
      elsif difficulty == 2
        self.debugging_d2_count += 1
      elsif difficulty == 3
        self.debugging_d3_count += 1
      elsif difficulty == 4
        self.debugging_d4_count += 1
      elsif difficulty == 5
        self.debugging_d5_count += 1
      end
    elsif concept == ConceptDifficulties::REPEAT_LOOPS
      if difficulty == 1
        self.repeat_loops_d1_count += 1
      elsif difficulty == 2
        self.repeat_loops_d2_count += 1
      elsif difficulty == 3
        self.repeat_loops_d3_count += 1
      elsif difficulty == 4
        self.repeat_loops_d4_count += 1
      elsif difficulty == 5
        self.repeat_loops_d5_count += 1
      end
    elsif concept == ConceptDifficulties::REPEAT_UNTIL_WHILE
      if difficulty == 1
        self.repeat_until_while_d1_count += 1
      elsif difficulty == 2
        self.repeat_until_while_d2_count += 1
      elsif difficulty == 3
        self.repeat_until_while_d3_count += 1
      elsif difficulty == 4
        self.repeat_until_while_d4_count += 1
      elsif difficulty == 5
        self.repeat_until_while_d5_count += 1
      end
    elsif concept == ConceptDifficulties::FOR_LOOPS
      if difficulty == 1
        self.for_loops_d1_count += 1
      elsif difficulty == 2
        self.for_loops_d2_count += 1
      elsif difficulty == 3
        self.for_loops_d3_count += 1
      elsif difficulty == 4
        self.for_loops_d4_count += 1
      elsif difficulty == 5
        self.for_loops_d5_count += 1
      end
    elsif concept == ConceptDifficulties::EVENTS
      if difficulty == 1
        self.events_d1_count += 1
      elsif difficulty == 2
        self.events_d2_count += 1
      elsif difficulty == 3
        self.events_d3_count += 1
      elsif difficulty == 4
        self.events_d4_count += 1
      elsif difficulty == 5
        self.events_d5_count += 1
      end
    elsif concept == ConceptDifficulties::VARIABLES
      if difficulty == 1
        self.variables_d1_count += 1
      elsif difficulty == 2
        self.variables_d2_count += 1
      elsif difficulty == 3
        self.variables_d3_count += 1
      elsif difficulty == 4
        self.variables_d4_count += 1
      elsif difficulty == 5
        self.variables_d5_count += 1
      end
    elsif concept == ConceptDifficulties::FUNCTIONS
      if difficulty == 1
        self.functions_d1_count += 1
      elsif difficulty == 2
        self.functions_d2_count += 1
      elsif difficulty == 3
        self.functions_d3_count += 1
      elsif difficulty == 4
        self.functions_d4_count += 1
      elsif difficulty == 5
        self.functions_d5_count += 1
      end
    elsif concept == ConceptDifficulties::FUNCTIONS_WITH_PARAMS
      if difficulty == 1
        self.functions_with_params_d1_count += 1
      elsif difficulty == 2
        self.functions_with_params_d2_count += 1
      elsif difficulty == 3
        self.functions_with_params_d3_count += 1
      elsif difficulty == 4
        self.functions_with_params_d4_count += 1
      elsif difficulty == 5
        self.functions_with_params_d5_count += 1
      end
    elsif concept == ConceptDifficulties::CONDITIONALS
      if difficulty == 1
        self.conditionals_d1_count += 1
      elsif difficulty == 2
        self.conditionals_d2_count += 1
      elsif difficulty == 3
        self.conditionals_d3_count += 1
      elsif difficulty == 4
        self.conditionals_d4_count += 1
      elsif difficulty == 5
        self.conditionals_d5_count += 1
      end
    end
  end

  # As of April 2015, we define a user as being proficient (at some difficulty)
  # if they have shown proficiency in three meta-concepts amongst sequencing,
  # loops (encompassing repeat_loops, repeat_until_while, and for_loops),
  # events, variables, functions (encompassing functions and functions_with_params),
  # and conditionals. A user demonstrates proficiency in a concept by having
  # solved three (or more) appropriate difficulty puzzles with optimal block
  # counts.
  # WARNING (April 2015): This definition is expected to change, possibly with
  # an age-related bent.
  # @param difficulty [Integer] the difficulty level at which to assess
  #   proficiency. Default is 3.
  # @return [Boolean] whether the user has achieved proficiency.
  def proficient?(difficulty: 3)
    concept_proficiency_count = 0
    # Meta-concepts with one sub-concept.
    [
      ConceptDifficulties::SEQUENCING,
      ConceptDifficulties::EVENTS,
      ConceptDifficulties::VARIABLES,
      ConceptDifficulties::CONDITIONALS
    ].each do |concept|
      if get_level_count(concept, difficulty) >= 3
        concept_proficiency_count += 1
      end
    end
    # The loops meta-concept.
    if get_level_count(ConceptDifficulties::REPEAT_LOOPS, difficulty) >= 3 ||
       get_level_count(ConceptDifficulties::REPEAT_UNTIL_WHILE, difficulty) >= 3 ||
       get_level_count(ConceptDifficulties::FOR_LOOPS, difficulty) >= 3
      concept_proficiency_count += 1
    end
    # The functions meta-concept.
    if get_level_count(ConceptDifficulties::FUNCTIONS, difficulty) >= 3 ||
       get_level_count(ConceptDifficulties::FUNCTIONS_WITH_PARAMS, difficulty) >= 3
      concept_proficiency_count += 1
    end

    concept_proficiency_count >= 3
  end
end

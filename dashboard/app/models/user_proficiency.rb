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
  # @param concept [String] the concept to retrieve.
  # @param difficulty [Integer] the difficulty level to retrieve.
  # @return [Integer] the number of levels the user has passed with the
  #   specified concept and the specified difficulty or higher.
  def get_level_count(concept, difficulty)
    unless CONCEPTS.include? concept
      raise ArgumentError.new("invalid concept (#{concept})")
    end
    unless (1..MAXIMUM_CONCEPT_DIFFICULTY).cover? difficulty
      raise ArgumentError.new("invalid difficulty (#{difficulty})")
    end

    num_levels = 0
    (difficulty..MAXIMUM_CONCEPT_DIFFICULTY).each do |difficulty_level|
      if concept == 'sequencing'
        if difficulty_level == 1
          num_levels += sequencing_d1_count
        elsif difficulty_level == 2
          num_levels += sequencing_d2_count
        elsif difficulty_level == 3
          num_levels += sequencing_d3_count
        elsif difficulty_level == 4
          num_levels += sequencing_d4_count
        elsif difficulty_level == 5
          num_levels += sequencing_d5_count
        end
      elsif concept == 'debugging'
        if difficulty_level == 1
          num_levels += debugging_d1_count
        elsif difficulty_level == 2
          num_levels += debugging_d2_count
        elsif difficulty_level == 3
          num_levels += debugging_d3_count
        elsif difficulty_level == 4
          num_levels += debugging_d4_count
        elsif difficulty_level == 5
          num_levels += debugging_d5_count
        end
      elsif concept == 'repeat_loops'
        if difficulty_level == 1
          num_levels += repeat_loops_d1_count
        elsif difficulty_level == 2
          num_levels += repeat_loops_d2_count
        elsif difficulty_level == 3
          num_levels += repeat_loops_d3_count
        elsif difficulty_level == 4
          num_levels += repeat_loops_d4_count
        elsif difficulty_level == 5
          num_levels += repeat_loops_d5_count
        end
      elsif concept == 'repeat_until_while'
        if difficulty_level == 1
          num_levels += repeat_until_while_d1_count
        elsif difficulty_level == 2
          num_levels += repeat_until_while_d2_count
        elsif difficulty_level == 3
          num_levels += repeat_until_while_d3_count
        elsif difficulty_level == 4
          num_levels += repeat_until_while_d4_count
        elsif difficulty_level == 5
          num_levels += repeat_until_while_d5_count
        end
      elsif concept == 'for_loops'
        if difficulty_level == 1
          num_levels += for_loops_d1_count
        elsif difficulty_level == 2
          num_levels += for_loops_d2_count
        elsif difficulty_level == 3
          num_levels += for_loops_d3_count
        elsif difficulty_level == 4
          num_levels += for_loops_d4_count
        elsif difficulty_level == 5
          num_levels += for_loops_d5_count
        end
      elsif concept == 'events'
        if difficulty_level == 1
          num_levels += events_d1_count
        elsif difficulty_level == 2
          num_levels += events_d2_count
        elsif difficulty_level == 3
          num_levels += events_d3_count
        elsif difficulty_level == 4
          num_levels += events_d4_count
        elsif difficulty_level == 5
          num_levels += events_d5_count
        end
      elsif concept == 'variables'
        if difficulty_level == 1
          num_levels += variables_d1_count
        elsif difficulty_level == 2
          num_levels += variables_d2_count
        elsif difficulty_level == 3
          num_levels += variables_d3_count
        elsif difficulty_level == 4
          num_levels += variables_d4_count
        elsif difficulty_level == 5
          num_levels += variables_d5_count
        end
      elsif concept == 'functions'
        if difficulty_level == 1
          num_levels += functions_d1_count
        elsif difficulty_level == 2
          num_levels += functions_d2_count
        elsif difficulty_level == 3
          num_levels += functions_d3_count
        elsif difficulty_level == 4
          num_levels += functions_d4_count
        elsif difficulty_level == 5
          num_levels += functions_d5_count
        end
      elsif concept == 'functions_with_params'
        if difficulty_level == 1
          num_levels += functions_with_params_d1_count
        elsif difficulty_level == 2
          num_levels += functions_with_params_d2_count
        elsif difficulty_level == 3
          num_levels += functions_with_params_d3_count
        elsif difficulty_level == 4
          num_levels += functions_with_params_d4_count
        elsif difficulty_level == 5
          num_levels += functions_with_params_d5_count
        end
      elsif concept == 'conditionals'
        if difficulty_level == 1
          num_levels += conditionals_d1_count
        elsif difficulty_level == 2
          num_levels += conditionals_d2_count
        elsif difficulty_level == 3
          num_levels += conditionals_d3_count
        elsif difficulty_level == 4
          num_levels += conditionals_d4_count
        elsif difficulty_level == 5
          num_levels += conditionals_d5_count
        end
      end
    end
    return num_levels
  end

  # Increments by one the number of levels the user has shown proficiency in for
  # the indicated concept and difficulty.
  # @param concept [String] the concept to increment.
  # @param difficulty [Integer] the difficulty level to increment.
  def increment_level_count(concept, difficulty)
    if concept == 'sequencing'
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
    elsif concept == 'debugging'
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
    elsif concept == 'repeat_loops'
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
    elsif concept == 'repeat_until_while'
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
    elsif concept == 'for_loops'
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
    elsif concept == 'events'
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
    elsif concept == 'variables'
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
    elsif concept == 'functions'
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
    elsif concept == 'functions_with_params'
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
    elsif concept == 'conditionals'
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

  # As of April 2015, we define a user as having basic proficiency if they have
  # shown proficiency in three meta-concepts amongst sequencing, loops
  # (encompassing repeat_loops, repeat_until_while, and for_loops), events,
  # variables, functions (encompassing functions and functions_with_params), and
  # conditionals. A user demonstrates proficiency in a concept by having three
  # or more total D3, D4, or D5 levels.
  # WARNING (April 2015): This definition is expected to change, possibly with
  # an age-related bent.
  # @return [Boolean] if the user has achieved basic proficiency.
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

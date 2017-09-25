module ConceptDifficulties
  # The set of concepts for which proficiency is computed.
  CONCEPTS = [
    SEQUENCING = 'sequencing'.freeze,
    DEBUGGING = 'debugging'.freeze,
    REPEAT_LOOPS = 'repeat_loops'.freeze,
    REPEAT_UNTIL_WHILE = 'repeat_until_while'.freeze,
    FOR_LOOPS = 'for_loops'.freeze,
    EVENTS = 'events'.freeze,
    VARIABLES = 'variables'.freeze,
    FUNCTIONS = 'functions'.freeze,
    FUNCTIONS_WITH_PARAMS = 'functions_with_params'.freeze,
    CONDITIONALS = 'conditionals'.freeze
  ].freeze

  # The maximum difficulty ranking for a concept.
  MAXIMUM_CONCEPT_DIFFICULTY = 5
end

module ConceptDifficulties
  # The set of concepts for which proficiency is computed.
  # WARNING: This list is tied to DB columns. DO NOT EDIT without a DB
  # migration.
  CONCEPTS = %w(
    sequencing
    debugging
    repeat_loops
    repeat_until_while
    for_loops
    events
    variables
    functions
    functions_with_params
    conditionals
  )

  # The maximum difficulty ranking for a concept.
  # NOTE: This number is tied to DB columns. DO NOT EDIT without a DB migration.
  MAXIMUM_CONCEPT_DIFFICULTY = 5

  # all unspecified attributes default to nil; otherwise, attempting to
  # remove an already-assigned concept won't work.
  def assign_attributes(attrs)
    defaults = Hash[CONCEPTS.map { |concept| [concept, nil] }]
    super(defaults.merge(attrs))
  end
end

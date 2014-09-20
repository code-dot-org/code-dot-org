require 'test_helper'

class ConceptTest < ActiveSupport::TestCase
  test 'Setup adds concepts' do
    Concept.setup
    assert_not_nil(Concept.find_by_name('sequence'))
  end

  test 'Setup clears existing concepts before add' do
    initial_concept_name = create(:concept).name
    Concept.setup
    assert_nil Concept.find_by_name(initial_concept_name)
  end

  test 'Setup adds concepts one-indexed' do
    Concept.setup
    assert_equal(1, Concept.find_by_name(Concept::CONCEPT_NAMES_BY_INDEX.first).id)
  end

  test 'Concepts already referenced in production should not change IDs' do
    Concept.setup
    assert_equal(9, Concept.find_by_name('parameters').id)
  end
end

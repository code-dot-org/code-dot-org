require 'test_helper'

class ConceptTest < ActiveSupport::TestCase
  test 'Setup adds concepts' do
    assert Concept.find_by_name('sequence')
  end

  test 'Setup adds concepts one-indexed' do
    assert_equal 1, Concept.find_by_name(Concept::CONCEPT_NAMES_BY_INDEX.first).id
  end

  test 'Concepts already referenced in production should not change IDs' do
    assert_equal 9, Concept.find_by_name('parameters').id
  end
end

require 'test_helper'

class UserProficiencyTest < ActiveSupport::TestCase
  setup do
    @proficiency = build :user_proficiency
  end

  test 'get_levels_count' do
    assert_equal 5,
      @proficiency.get_level_count(ConceptDifficulties::REPEAT_LOOPS, 1)
    assert_equal 5,
      @proficiency.get_level_count(ConceptDifficulties::REPEAT_LOOPS, 2)
    assert_equal 3,
      @proficiency.get_level_count(ConceptDifficulties::REPEAT_LOOPS, 3)
    assert_equal 3,
      @proficiency.get_level_count(ConceptDifficulties::REPEAT_LOOPS, 4)
    assert_equal 0,
      @proficiency.get_level_count(ConceptDifficulties::REPEAT_LOOPS, 5)
  end

  test 'get_levels_count_no_data' do
    assert_equal 0,
      @proficiency.get_level_count(ConceptDifficulties::FUNCTIONS, 3)
  end

  test 'get_levels_count_invalid_concept' do
    assert_raises ArgumentError do
      @proficiency.get_level_count('invalid_concept', 3)
    end
  end

  test 'get_levels_count_invalid_difficulty_number' do
    assert_raises ArgumentError do
      @proficiency.get_level_count(ConceptDifficulties::SEQUENCING, 0)
    end

    assert_raises ArgumentError do
      @proficiency.get_level_count(
        'sequencing', UserProficiency::MAXIMUM_CONCEPT_DIFFICULTY + 1
      )
    end
  end

  test 'increment_level_count' do
    # The factory creates user_proficiency with sequencing_d2_count = 0
    # and repeat_loops_d2_count = 2;
    user_proficiency = create(:user_proficiency)

    user_proficiency.increment_level_count(ConceptDifficulties::SEQUENCING, 2)
    assert_equal 1, user_proficiency.sequencing_d2_count

    user_proficiency.increment_level_count(ConceptDifficulties::REPEAT_LOOPS, 2)
    assert_equal 3, user_proficiency.repeat_loops_d2_count
    user_proficiency.increment_level_count(ConceptDifficulties::REPEAT_LOOPS, 2)
    assert_equal 4, user_proficiency.repeat_loops_d2_count
  end

  test 'increment_level_count and get_level_counts' do
    user_proficiency = UserProficiency.new

    ConceptDifficulties::CONCEPTS.each do |concept|
      (1..UserProficiency::MAXIMUM_CONCEPT_DIFFICULTY).each do |difficulty|
        user_proficiency.increment_level_count(concept, difficulty)
      end
    end

    ConceptDifficulties::CONCEPTS.each do |concept|
      (1..UserProficiency::MAXIMUM_CONCEPT_DIFFICULTY).each do |difficulty|
        assert_equal 6 - difficulty,
          user_proficiency.get_level_count(concept, difficulty)
      end
    end
  end

  test 'basic_proficiency' do
    # Proficiency in two concepts is insufficient for basic proficiency.
    refute @proficiency.proficient?

    # Adding a repeat sub-concept (within loops) does not help.
    @proficiency.repeat_until_while_d3_count = 3
    refute @proficiency.proficient?

    # Adding a third meta-concept gives basic proficiency.
    @proficiency.events_d3_count = 3
    assert @proficiency.proficient?
  end

  test 'basic_proficiency with difficulty' do
    @proficiency.sequencing_d1_count = 3
    assert @proficiency.proficient?(difficulty: 1)
    refute @proficiency.proficient?(difficulty: 5)
  end
end

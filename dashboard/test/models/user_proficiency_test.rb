require 'test_helper'

class UserProficiencyTest < ActiveSupport::TestCase
  setup do
    @proficiency = create(:user_proficiency)
  end

  test 'get_levels_count' do
    assert_equal 5, @proficiency.get_level_count('repeat_loops', 1)
    assert_equal 5, @proficiency.get_level_count('repeat_loops', 2)
    assert_equal 3, @proficiency.get_level_count('repeat_loops', 3)
    assert_equal 3, @proficiency.get_level_count('repeat_loops', 4)
    assert_equal 0, @proficiency.get_level_count('repeat_loops', 5)
  end

  test 'get_levels_count_no_data' do
    assert_equal 0, @proficiency.get_level_count('functions', 3)
  end

  test 'get_levels_count_invalid_concept' do
    assert_equal 0, @proficiency.get_level_count('invalid_concept', 3)
  end

  test 'get_levels_count_invalid_difficulty_number' do
    assert_equal 0, @proficiency.get_level_count('sequencing', 0)
    assert_equal 0, @proficiency.get_level_count(
      'sequencing', UserProficiency::MAXIMUM_CONCEPT_DIFFICULTY + 1)
  end

  test 'increment_leveL_count' do
    # The factory creates user_proficiency with sequencing_d2_count = 0
    # and repeat_loops_d2_count = 2;
    user_proficiency = create(:user_proficiency)

    user_proficiency.increment_level_count('sequencing', 2)
    assert_equal 1, user_proficiency.sequencing_d2_count

    user_proficiency.increment_level_count('repeat_loops', 2)
    assert_equal 3, user_proficiency.repeat_loops_d2_count
    user_proficiency.increment_level_count('repeat_loops', 2)
    assert_equal 4, user_proficiency.repeat_loops_d2_count
  end

  test 'basic_proficiency' do
    # Proficiency in two concepts is insufficient for basic proficiency.
    assert !@proficiency.basic_proficiency?

    # Adding a repeat sub-concept (within loops) does not help.
    @proficiency.repeat_until_while_d3_count = 3
    assert !@proficiency.basic_proficiency?

    # Adding a third meta-concept gives basic proficiency.
    @proficiency.events_d3_count = 3
    assert @proficiency.basic_proficiency?
  end
end

require_relative '../test_helper'
require 'cdo/safe_names'

class SafeNamesTest < Minitest::Test
  def test_get_safe_names
    # Uses first names if possible
    verify(['Laura Ferno', 'Natalie Ferno'], ['Laura', 'Natalie'])

    # Uses the minimum characters from the last name if necessary
    verify(['John Smith', 'John Stamos'], ['John Sm', 'John St'])

    # Handles a variety of combinations
    verify(
      ['Dick Smith', 'Dick Tracer', 'Harry Smith', 'Tom Clancy', 'Tom Saywer', 'Tom Smith'],
      ['Dick S', 'Dick T', 'Harry', 'Tom C', 'Tom Sa', 'Tom Sm']
    )

    # Handles abbreviated first names by defaulting back to the 'full'
    # name. Abbreviations are a single letter or a single letter
    # followed by a period; two-letter names are still allowed
    verify(
      ['Bo Burnham', 'J. Crew', 'T Bone'],
      ['Bo', 'J. Crew', 'T Bone']
    )

    # Handles names that have other names as their strict subset
    verify(['Thor', 'Thor Odinson'], ['Thor', 'Thor O'])

    # Preserves duplicate names
    verify(['John Smith', 'John Smith'], ['John', 'John'])

    # Sorted by name
    verify(['Beth A', 'Alex Able', 'Cathy', 'Alex Aaron'], ['Alex Aa', 'Alex Ab', 'Beth', 'Cathy'])
  end

  private

  SPLIT_NAME_PROC = ->(name) {name.split(/\s+/, 2)}
  def verify(actual, expected)
    result = SafeNames.get_safe_names(actual, SPLIT_NAME_PROC)
    assert_equal expected, result.map(&:first)
  end
end

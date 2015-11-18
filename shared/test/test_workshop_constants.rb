require 'minitest/autorun'
require 'rack/test'

require_relative '../../lib/cdo/workshop_constants'

class WorkshopConstantsTest < Minitest::Test
  include WorkshopConstants

  def test_find_program_type
    program_type = find_program_type(short_name: 'ECS')
    refute_nil program_type
    assert_equal 3, program_type[:id]
  end

  def test_find_phase
    phase = find_phase(short_name: 'Phase 3B')
    refute_nil phase
    assert_equal 5, phase[:id]
  end

  def test_complex
    phase = find_phase(short_name: 'Phase 2', long_name: 'Phase 2: Blended Summer Study')
    refute_nil phase
    assert_equal 2, phase[:id]
  end

  def test_nothing_to_find
    assert_nil find_program_type(short_name: 'nonexistent')
    assert_nil find_phase(short_name: 'nonexistent')
    assert_nil find_phase(nonexistent_field: 'doesntmatter')
  end
end

require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class OnlyOneRunningTest < Minitest::Unit::TestCase
  def test_initially_true
    assert only_one_running?(__FILE__)
  end

  def test_thereafter_false
    assert !only_one_running?(__FILE__)
  end
end

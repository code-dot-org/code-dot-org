require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class OnlyOneRunningTest < Minitest::Unit::TestCase
  def setup
    @name ||= "#{__FILE__}_#{rand(100000)}_#{Time.now.to_i}"
  end

  def test_initially_true
    assert only_one_running?(@name)
  end

  def test_thereafter_false
    assert only_one_running?(@name)
    assert !only_one_running?(@name)
  end
end

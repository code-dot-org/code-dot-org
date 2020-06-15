require_relative '../test_helper'
require 'cdo/only_one'

class OnlyOneTest < Minitest::Test
  def only_one?
    !!only_one_running?(__FILE__)
  end

  def test_only_one
    r, w = IO.pipe
    pid = fork do
      w.puts only_one? # true
      GC.start
      Process.wait(fork {w.puts only_one?}) # false
    end
    Process.wait pid
    w.puts only_one? # true
    w.close
    assert_equal %w[true false true], r.readlines(chomp: true)
  end
end

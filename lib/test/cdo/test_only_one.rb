require_relative '../test_helper'
require 'cdo/only_one'
require 'tempfile'

class OnlyOneTest < Minitest::Test
  def only_one?
    only_one_running?(__FILE__)
  end

  def test_only_one
    r, w = IO.pipe
    pid = fork do
      w.puts only_one? # true
      GC.start
      w.puts only_one? # false
      Process.wait(fork {w.puts only_one?}) # false
    end
    Process.wait pid
    Process.wait(fork {w.puts only_one?}) # true
    w.close
    assert_equal %w[true false false true], r.readlines(chomp: true)
  end

  def test_nested
    tmp1, tmp2 = Array.new(2) {Tempfile.new}

    assert only_one_running?(tmp1)
    assert only_one_running?(tmp2)

    GC.start

    refute only_one_running?(tmp1)
    refute only_one_running?(tmp2)
  end
end

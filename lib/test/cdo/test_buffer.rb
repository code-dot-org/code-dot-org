require_relative '../test_helper'
require 'cdo/buffer'

class BufferTest < Minitest::Test
  class BufferTestClass < Cdo::Buffer
    def flushed
      (@flushed ||= [])
    end

    def flush(events)
      flushed.push(events)
    end

    def flushes
      flushed.length
    end
  end

  def test_batch_events
    b = BufferTestClass.new(batch_events: 2)
    5.times {b.buffer('foo')}
    b.flush!
    assert_equal 3, b.flushes
  end

  def test_batch_size_given_small_data_should_succeed
    b = BufferTestClass.new(batch_size: 4)
    7.times {b.buffer('HI')}
    b.flush!
    assert_equal 4, b.flushes
  end

  def test_batch_size_given_too_large_string_should_raise_exception
    test_string = 'HI'
    assert_raises RuntimeError do
      b = BufferTestClass.new(batch_size: test_string.bytesize - 1)
      b.buffer(test_string)
    end
  end

  def test_batch_size_given_too_large_object_should_raise_exception
    max_size = 5
    assert_raises RuntimeError do
      b = BufferTestClass.new(batch_size: max_size)
      b.buffer([], max_size + 1)
    end
  end

  def test_batch_interval
    b = BufferTestClass.new(batch_interval: 0.1)
    7.times {b.buffer('bar')}
    assert_equal 0, b.flushes
    sleep 0.2
    assert_equal 1, b.flushes
    b.flush!
    assert_equal 1, b.flushes
  end

  def test_min_interval
    b = BufferTestClass.new(batch_events: 1, min_interval: 1.second.to_i)
    start = Concurrent.monotonic_time
    4.times {b.buffer('foo')}
    b.flush!
    finish = Concurrent.monotonic_time
    assert_equal 4, b.flushes
    time_taken = finish - start
    # Given a min_interval of 1 second and 4 flushes, assert the flush! takes 3-4 seconds.
    assert time_taken >= 3, "Expected time_taken(#{time_taken}) to be >= 3"
    assert time_taken < 4, "Expected time_taken(#{time_taken}) to be < 4"
  end
end

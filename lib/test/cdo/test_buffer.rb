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
    7.times {b.buffer('foo')}
    b.flush!
    assert_equal 4, b.flushes
  end

  def test_batch_size
    b = BufferTestClass.new(batch_size: 5)
    7.times {b.buffer('HI')}
    b.flush!
    assert_equal 4, b.flushes
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
end

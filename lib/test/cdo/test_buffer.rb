require_relative '../test_helper'
require 'cdo/buffer'
require 'benchmark'

class BufferTest < Minitest::Test
  class TestBuffer < Cdo::Buffer
    def initialize(**args)
      super(log: Logger.new('/dev/null'), **args)
    end

    def flushed
      (@flushed ||= [])
    end

    def flush(objects)
      raise "EMPTY" if objects.empty?
      flushed.push(objects)
    end

    def flushes
      flushed.length
    end

    def size(objects)
      objects.sum(&:size)
    end
  end

  def test_batch_count
    b = TestBuffer.new(batch_count: 2)
    7.times {b.buffer('foo')}
    b.flush!
    assert_equal 4, b.flushes
  end

  def test_batch_size_given_small_data_should_succeed
    b = TestBuffer.new(batch_size: 4)
    7.times {b.buffer('HI')}
    b.flush!
    assert_equal 4, b.flushes
  end

  def test_object_exceeding_batch_size_should_raise_exception
    max_size = 5
    e = assert_raises(ArgumentError) do
      TestBuffer.new(batch_size: max_size).buffer('x' * (max_size + 1))
    end
    assert_equal 'Object size (6) exceeds batch size (5)', e.message
  end

  def test_max_interval
    b = TestBuffer.new(max_interval: 0.1)
    7.times {b.buffer('bar')}
    assert_equal 0, b.flushes
    sleep 0.2
    assert_equal 1, b.flushes
    b.flush!
    assert_equal 1, b.flushes
  end

  class StdoutBuffer < TestBuffer
    def flush(objects)
      objects.each(&method(:puts))
    end
  end

  def test_fork
    b = StdoutBuffer.new
    output, err = capture_subprocess_io do
      $stdout.sync = true
      b.buffer 'foo2'
      pid = fork do
        b.buffer 'foo1'
        b.flush!
      end
      Process.wait(pid)
      b.buffer 'foo3'
      b.flush!
    end
    assert_empty err
    assert_equal "foo1\nfoo2\nfoo3\n", output
  end

  def test_min_interval
    n = 4
    interval = 0.1

    b = TestBuffer.new(batch_count: 1, min_interval: interval)
    time_taken = Benchmark.realtime do
      Array.new(n) {Thread.new {b.buffer('foo')}}.each(&:join)
      b.flush!
    end
    assert_equal n, b.flushes

    # Given a min_interval of 1 second and 4 flushes, assert the flush! takes 3-4 seconds.
    assert_operator time_taken, :>, 0.3
    assert_operator time_taken, :<, 0.4
  end

  def test_min_interval_no_flush
    b = TestBuffer.new(batch_count: 1, min_interval: 0.1)
    4.times {b.buffer('foo')}
    sleep 0.05
    assert_equal 1, b.flushes
    b.buffer('foo')
    sleep 0.3
    assert_equal 4, b.flushes
    sleep 0.1
    assert_equal 5, b.flushes
    sleep 0.1
    assert_equal 5, b.flushes
  end

  def test_log_repeat_flushes
    log_str = StringIO.new
    log = Logger.new(log_str)
    b = ReBuffer.new(log: log)
    b.buffer 'foo'
    b.flush!(0.1)
    assert_match(/(Flushing BufferTest.*){10}/m, log_str.string)
  end

  class ReBuffer < TestBuffer
    # Re-buffer objects endlessly.
    def flush(objects)
      super
      objects.map(&method(:buffer))
    end
  end

  # Help reproduce a thread-safety bug by prepending `sleep` to several methods.
  class ThreadSafeTestBuffer < TestBuffer
    %w(flush batch_ready buffer).each do |m|
      define_method(m) do |*args|
        sleep @max_interval
        super(*args)
      end
    end
  end

  def test_buffer_thread_safety
    duration = 0.1
    n = 500

    b = ThreadSafeTestBuffer.new(max_interval: duration.to_f / (n * 2))
    n.times {b.buffer('foo')}
    b.flush!
  end
end

require 'stringio'

# Testing methods for capturing Sequel SQL queries within a block.
module CaptureQueries
  def logger
    @output ||= StringIO.new
    @log ||= Logger.new(@output).tap do |l|
      l.level = Logger::DEBUG
      l.formatter = ->(*, msg) {"#{msg}\n"}
    end
  end

  def assert_queries(db, num, &block)
    return yield if num.nil?
    queries = capture_queries(db, &block)
    assert_equal num, queries.count, "Wrong query count:\n#{queries.join}\n"
  end

  def assert_cached_queries(db, num, &block)
    Retryable.retryable(on: Minitest::Assertion, tries: 2, sleep: 0) do
      assert_queries(db, num, &block)
    end
  end

  def capture_queries(*dbs)
    logger = self.logger
    dbs.each {|db| db.loggers.push(logger)}
    yield
    @output.string.lines
  ensure
    dbs.each {|db| db.loggers.delete(logger)}
    @output = nil
    @log = nil
  end
end

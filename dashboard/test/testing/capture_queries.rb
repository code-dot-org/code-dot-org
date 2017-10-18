require 'ostruct'
require 'stringio'

# Testing methods for capturing ActiveRecord SQL queries within a block.
module CaptureQueries
  # Use ActiveRecord's existing LogSubscriber implementation to
  # log SQL query events to a formatted string.
  class QueryLogger < ActiveRecord::LogSubscriber
    def self.log(duration, payload)
      new.tap do |q|
        q.sql(OpenStruct.new(duration: duration, payload: payload))
      end.output.string
    end

    attr_accessor :output

    def logger
      @output ||= StringIO.new
      @log ||= Logger.new(@output).tap do |l|
        l.level = Logger::DEBUG
        l.formatter = ->(*, msg) {msg}
      end
    end
  end

  def assert_queries(num, &block)
    queries = capture_queries(&block)
    assert_equal num, queries.count, "Wrong query count:\n#{queries.join("\n")}\n"
  end

  def assert_cached_queries(num, &block)
    Retryable.retryable(on: Minitest::Assertion, tries: 2, sleep: 0) do
      assert_queries(num, &block)
    end
  end

  def capture_queries(&block)
    queries = []
    query = lambda do |_name, start, finish, _id, payload|
      duration = finish - start
      next if payload[:name] === 'CACHE'
      queries << "#{QueryLogger.log(duration, payload)}\n#{Rails.backtrace_cleaner.clean(caller)[0..5].join("\n")}"
    end
    ActiveSupport::Notifications.subscribed(query, "sql.active_record", &block)
    queries
  end
end

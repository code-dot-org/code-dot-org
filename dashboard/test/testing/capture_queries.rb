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

  def assert_queries(num, *args, &block)
    return yield if num.nil?
    queries = capture_queries(*args, &block)
    assert_equal num, queries.count, "Wrong query count:\n#{queries.join("\n")}\n"
  end

  def assert_cached_queries(num, *args, &block)
    Retryable.retryable(on: Minitest::Assertion, tries: 2, sleep: 0) do
      assert_queries(num, *args, &block)
    end
  end

  IGNORE_FILTERS = [
    # Script/course-cache related queries don't count.
    /(script|course)\.rb.*get_from_cache/,
    # Level-cache queries don't count.
    /script\.rb.*cache_find_(script_level|level)/,
    # Ignore cached script id lookup
    /lesson_extras_script_ids/,
    # Ignore random updates to experiment cache.
    /experiment\.rb.*update_cache/
  ]

  def capture_queries(ignore_filters: IGNORE_FILTERS, capture_filters: [], &block)
    queries = []
    query = lambda do |_name, start, finish, _id, payload|
      duration = finish - start
      next if %w(CACHE SCHEMA).include? payload[:name]
      cleaner = Rails::BacktraceCleaner.new
      cleaner.add_silencer {|line| line.include?(__dir__.sub("#{Rails.root}/", ''))}
      cleaner.add_silencer {|line| line =~ /application_controller.*with_locale/}
      backtrace = cleaner.clean(caller)

      next if ignore_filters.any? {|filter| backtrace.any? {|line| line =~ filter}}
      next unless capture_filters.all? {|filter| backtrace.any? {|line| line =~ filter}}

      queries << "#{QueryLogger.log(duration, payload)}\n#{backtrace.join("\n")}"
    end
    ActiveRecord::Base.cache do
      ActiveSupport::Notifications.subscribed(query, "sql.active_record", &block)
    end
    queries
  end
end

module CaptureQueries
  def assert_queries(num, &block)
    queries = capture_queries(&block)
    assert_equal num, queries.count, "#{queries.count} queries, expected #{num}:\n#{queries.join("\n")}"
  end

  def assert_cached_queries(num, &block)
    Retryable.retryable(on: Minitest::Assertion, tries: 2, sleep: 0) do
      assert_queries(num, &block)
    end
  end

  def capture_queries(&block)
    queries = []
    query = lambda do |*, payload|
      next if payload[:name] === 'CACHE'
      queries << payload[:sql]
    end
    ActiveSupport::Notifications.subscribed(query, "sql.active_record", &block)
    queries
  end
end

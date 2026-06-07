# frozen_string_literal: true

require 'minitest/reporters'

class Minitest::Reporters::SlowestTestsReporter < Minitest::Reporters::BaseReporter
  attr_reader :limit, :min_time

  def initialize(limit: 10, min_time: 1.0, **options)
    super(**options)

    @limit    = limit
    @min_time = min_time
  end

  def report
    slow_tests = tests.select {|test| test.time && test.time >= min_time}.sort_by(&:time).reverse
    return if slow_tests.empty?

    slow_tests_count = slow_tests.size
    number_width = limit.to_s.length
    time_width = format('%.3f', slow_tests.first.time).length

    puts
    puts slow_tests_count > limit ? "TOP #{limit} SLOWEST TESTS:" : 'SLOWEST TESTS:'
    slow_tests.first(limit).each_with_index do |test, index|
      puts format(
        '  %*d. %*.3fs %s#%s',
        number_width,
        index + 1,
        time_width,
        test.time,
        test_class(test),
        test.name
      )
    end
  end
end

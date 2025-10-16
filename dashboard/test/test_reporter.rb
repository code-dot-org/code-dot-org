require 'minitest/reporters'

class CowReporter < Minitest::Reporters::ProgressReporter
  def report
    if passed? && ENV['TEST_COW']
      print `cowsay #{send(:green) {'success'}}`
    end
    super
  end
end

class ProfileReporter < Minitest::Reporters::BaseReporter
  def initialize(options = {})
    super
    @test_times = {}
  end

  def record(test)
    super
    @test_times[test] = test.time
  end

  def report
    super
    return unless ENV['PROFILE_TESTS']

    puts "\n\nTop 20 slowest tests:\n"
    sorted_tests = @test_times.sort_by {|_test, time| -time}.take(20)
    sorted_tests.each_with_index do |(test, time), index|
      puts "#{index + 1}. #{format('%.4f', time)}s - #{test.class}##{test.name}"
    end
    puts "\n"
  end
end

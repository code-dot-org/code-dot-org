# copy skeleton from lib/test/cdo/test_safe_names.rb
# bundle exec ruby lib/test/cdo/test_log_object.rb

require_relative '../test_helper'
require 'cdo/log_object'

class LogObjectTest < Minitest::Test
  def test_time_a_function
    lo = LogObject.new
    lo.time('increase once') {increase_by_one}
    repetition = 10000
    lo.time("increase #{repetition} times") {increase_by_one(repetition)}
    puts lo.to_s
  end

  private

  def increase_by_one(repetition = 1)
    result = 0
    repetition.times {result += 1}
    result
  end
end

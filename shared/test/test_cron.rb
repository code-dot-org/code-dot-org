require_relative 'test_helper'
require 'cdo/cron'
require 'timecop'

class CronTest < Minitest::Test
  # UTC output shifts based on local daylight saving time.
  def test_weekdays_at
    Timecop.freeze(Date.parse('2017-01-01')) do
      assert_equal '0 12 * * MON-FRI', Cdo::Cron.weekdays_at('4am')
    end
    Timecop.freeze(Date.parse('2017-04-01')) do
      assert_equal '0 11 * * MON-FRI', Cdo::Cron.weekdays_at('4am')
    end
  end

  def test_weekly_at
    Timecop.freeze(Date.parse('2017-01-01')) do
      assert_equal '0 4 * * SAT', Cdo::Cron.weekly_at('8pm Friday')
    end
    Timecop.freeze(Date.parse('2017-04-01')) do
      assert_equal '0 3 * * SAT', Cdo::Cron.weekly_at('8pm Friday')
    end
  end
end

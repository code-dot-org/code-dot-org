require_relative './test_helper'
require_relative '../../lib/cdo/pegasus'
require 'timecop'

class StaticModelsTest < Minitest::Test
  include CaptureQueries

  def test_static_models
    CDO.cache.clear
    StaticModels.stubs(:expires_in).returns(2.minutes)
    Timecop.freeze

    query = -> {PEGASUS_DB[:cdo_donors].all}
    query.call

    Timecop.travel 1.minute
    assert_empty(capture_queries(PEGASUS_DB, &query))

    Timecop.travel 2.minutes
    refute_empty(capture_queries(PEGASUS_DB, &query))

    Timecop.return
  end
end

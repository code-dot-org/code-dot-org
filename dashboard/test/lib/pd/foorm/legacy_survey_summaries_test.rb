require 'test_helper'

module Pd::Foorm
  class LegacySurveySummariesTest < ActiveSupport::TestCase
    test 'no errors if there are no summaries for the user' do
      facilitator = create :facilitator
      result = LegacySurveySummaries.get_summaries(facilitator)

      assert_not_empty result
    end
  end
end

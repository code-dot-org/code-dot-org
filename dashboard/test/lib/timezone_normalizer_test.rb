# frozen_string_literal: true

require 'test_helper'

class TimezoneNormalizerTest < ActiveSupport::TestCase
  include TimezoneNormalizer

  describe '#normalize_timezone' do
    it 'parses string timezones' do
      _(normalize_timezone('America/New_York').name).must_equal 'America/New_York'
    end

    it 'parses integer offsets' do
      # -7 hours = -25200 seconds (Mountain Time)
      _(normalize_timezone(-25_200).name).must_equal 'Arizona'
    end

    it 'falls back to UTC for nil' do
      _(normalize_timezone(nil).name).must_equal 'UTC'
    end

    it 'falls back to UTC for non sense' do
      _(normalize_timezone('not a timezone').name).must_equal 'UTC'
    end

    it 'falls back to UTC for non valid format' do
      _(normalize_timezone({:timezone => 'America/New_York'}).name).must_equal 'UTC'
    end
  end
end

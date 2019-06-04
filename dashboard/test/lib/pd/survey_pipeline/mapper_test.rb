require 'test_helper'
require 'pd/survey_pipeline/mapper.rb'
require 'pd/survey_pipeline/reducer.rb'

module Pd::SurveyPipeline
  class GenericMapperTest < ActiveSupport::TestCase
    setup_all do
      # All combinations of (a, b, c) which each value could be 0 or 1.
      @data = [
        {a: 0, b: 0, c: 0},
        {a: 0, b: 0, c: 1},
        {a: 0, b: 1, c: 0},
        {a: 0, b: 1, c: 1},
        {a: 1, b: 0, c: 0},
        {a: 1, b: 0, c: 1},
        {a: 1, b: 1, c: 0},
        {a: 1, b: 1, c: 1}
      ]

      @groups = {
        {odd: true} => [{odd: true, val: 1}, {odd: true, val: 3}, {odd: true, val: 5}],
        {odd: false} => [{odd: false, val: 2}, {odd: false, val: 4}]
      }
    end

    test 'group data using no key' do
      # Empty group config returns 1 group with all data
      summary = group_and_summarize([])
      assert_equal 1, summary.size
      assert_equal @data.size, summary[0]
    end

    test 'group data using non-existing keys' do
      # Using non-existing keys should be the same as using no key
      summary = group_and_summarize([:d, :e])
      assert_equal 1, summary.size
      assert_equal @data.size, summary[0]
    end

    test 'group data using one key' do
      summary = group_and_summarize([:a])
      assert_equal 2, summary.size
      assert summary.all? {|v| v == @data.size / 2}
    end

    test 'group data using all keys' do
      summary = group_and_summarize([:a, :b, :c])
      assert_equal @data.size, summary.size
      assert summary.all? {|v| v == 1}
    end

    test 'map groups to matched reducers' do
      # Mapping conditions
      is_odd_record = lambda {|hash| hash[:odd]}
      is_even_record = lambda {|hash| !hash[:odd]}

      # Mapping routes
      map_config = [
        {condition: is_odd_record, field: :val, reducers: [AvgReducer]},
        {condition: is_even_record, field: :val, reducers: [NoOpReducer]}
      ]

      # Expectations
      expected_values_to_avg = @groups[{odd: true}].pluck(:val)
      expected_values_to_passthrough = @groups[{odd: false}].pluck(:val)

      AvgReducer.expects(:reduce).with(expected_values_to_avg)
      NoOpReducer.expects(:reduce).with(expected_values_to_passthrough)

      # Action
      GenericMapper.new(group_config: [], map_config: map_config).map_to_reducers @groups
    end

    test 'map all groups to match-all reducer' do
      always_true = lambda {|_| true}
      map_config = [{condition: always_true, field: :val, reducers: [NoOpReducer]}]

      NoOpReducer.expects(:reduce).times(@groups.count)

      GenericMapper.new(group_config: [], map_config: map_config).map_to_reducers @groups
    end

    test 'map no group to unmatched reducer' do
      always_false = lambda {|_| false}
      map_config = [{condition: always_false, field: :val, reducers: [NoOpReducer]}]

      NoOpReducer.expects(:reduce).never

      GenericMapper.new(group_config: [], map_config: map_config).map_to_reducers @groups
    end

    private

    def group_and_summarize(group_config)
      GenericMapper.new(group_config: group_config, map_config: []).
        group_data(@data).
        map {|_, v| v.size}
    end
  end
end

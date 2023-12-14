# Custom matcher for checking calls to Cdo::Metrics.push.
#
# @example
#
#     Cdo::Metrics.expects(:push).with(
#       'DeletedAccountPurger',
#       includes_metrics(
#         SoftDeletedAccounts: is_a(Integer),
#         AccountsPurged: 0,
#         AccountsQueued: 0,
#         ManualReviewQueueDepth: is_a(Integer),
#       )
#     )
module Mocha
  module ParameterMatchers
    def includes_metrics(metrics)
      IncludesMetrics.new(metrics)
    end

    class IncludesMetrics < Base
      def initialize(metrics)
        @expected_metrics = metrics
      end

      def matches?(available_parameters)
        actual_metrics = available_parameters.shift
        @expected_metrics.all? do |expected_metric_name, expected_value|
          sought_metric = actual_metrics.find {|m| m[:metric_name] == expected_metric_name}
          actual_value = sought_metric&.[](:value)
          actual_value && expected_value.to_matcher.matches?([actual_value])
        end
      end

      def mocha_inspect
        "includes_metrics(#{@expected_metrics.mocha_inspect})"
      end
    end
  end
end

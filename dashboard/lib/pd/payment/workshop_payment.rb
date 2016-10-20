module Pd::Payment
  class WorkshopPayment
    def initialize(
      summary:,
      type:,
      amounts:
    )
      @summary = summary
      @type = type
      @amounts = amounts
    end

    attr_reader :summary

    # @return [String] payment type
    attr_reader :type

    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    attr_reader :amounts

    # @return [Numeric] Sum of all payment parts.
    def total
      amounts.values.reduce(0, :+)
    end
  end
end

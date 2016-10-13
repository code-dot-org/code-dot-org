module Pd::Payment
  class WorkshopPayment
    attr_accessor :summary

    # @return [String] payment type
    attr_accessor :type

    # @return [Hash{String => Numeric}] Map of payment parts (e.g. :food) to their dollar amounts.
    attr_accessor :amounts

    # @return [Numeric] Sum of all payment parts.
    attr_accessor :total
  end
end

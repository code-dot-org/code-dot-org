module SQS
  # A generic queued message with a body.
  class Message
    # @type [String]
    attr_reader :body

    # @param [String] body
    def initialize(body)
      raise ArgumentError.new('body must be a String') unless body.is_a?(String)
      @body = body
    end
  end
end

class FormError < ArgumentError
  attr_reader :errors

  def self.detect_errors(data)
    errors = {}
    data.each_pair do |key, value|
      errors[key] = [value.message] if value.instance_of?(FieldError)
    end
    errors
  end

  def initialize(kind, errors, logger = nil)
    @kind = kind
    @errors = errors

    logger&.warn to_s
  end

  def to_s
    "FormError[#{@kind}]: #{@errors.to_json}"
  end
end

class FieldError
  attr_accessor :value, :message

  def initialize(value, message)
    @value = value
    @message = message
  end
end

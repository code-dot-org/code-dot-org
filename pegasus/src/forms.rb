require 'cdo/poste'
require 'cdo/regexp'
require src_dir 'database'

class FormError < ArgumentError

  def self.detect_errors(data)
    errors = {}
    data.each_pair do |key, value|
      errors[key] = [value.message] if value.class == FieldError
    end
    errors
  end

  def initialize(kind, errors)
    @kind = kind
    @errors = errors

    Pegasus.logger.warn "FormError[#{@kind}]: #{@errors.to_json}"
  end

  def errors
    @errors
  end
end

class FieldError

  attr_accessor :value, :message

  def initialize(value, message)
    @value = value
    @message = message
  end

end

# Load forms
Dir.glob(pegasus_dir('forms/*.rb')).each {|path| load path}

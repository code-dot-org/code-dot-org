require src_dir 'poste/api'

class FormError < ArgumentError

  def self.detect_errors(data)
    errors = {}
    data.each_pair do |key, value|
      errors[key] = [value.message] if value.class == FieldError
    end
    errors
  end

  def self.detect_and_raise(data)
    errors = detect_errors(data)
    raise new(errors) unless errors.empty?
  end

  def initialize(errors)
    @errors = errors
    $log.error "FormError: #{@errors.to_json}"
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

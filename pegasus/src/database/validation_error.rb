class ValidationError < ArgumentError
  def initialize(*objs)
    @errors = {}
    objs.each do |obj|
      obj.class.properties.each do |property|
        next if (match = obj.errors.on(name = property.name)).nil?
        @errors[name] = match
      end
    end
    $log.error "ValidationError: #{@errors.to_json}"
  end
  
  def errors
    @errors
  end
end

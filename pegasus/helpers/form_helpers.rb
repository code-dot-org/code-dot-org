def validate_form(kind, data)

  def csv_multivalue(value)
    begin
      CSV.parse_line(value.to_s) || []
    rescue
      return FieldError.new(value, :invalid)
    end
  end

  def default_if_empty(value, default_value)
    return value if value.class == FieldError
    return default_value if value.nil_or_empty?
    value
  end

  def downcased(value)
    return value if value.class == FieldError
    if value.is_a?(Enumerable)
      value.map{|i| i.to_s.downcase}
    else
      value.to_s.downcase
    end
  end

  def enum(value, allowed)
    return value if value.class == FieldError
    return FieldError.new(value, :invalid) unless allowed.include?(value)
    value
  end

  def nil_if_empty(value)
    return value if value.class == FieldError
    return nil if value.nil_or_empty?
    value
  end

  def required(value)
    return value if value.class == FieldError
    return value if value.class == Fixnum
    return FieldError.new(value, :required) if value.nil_or_empty?
    value
  end

  def stripped(value)
    return value if value.class == FieldError
    if value.is_a?(Enumerable)
      value.map{|i| i.to_s.strip}
    else
      value.to_s.strip
    end
  end

  def uploaded_file(value)
    return value if value.class == FieldError
    return nil if value.nil_or_empty?
    AWS::S3.upload_to_bucket('cdo-form-uploads', value[:filename], open(value[:tempfile]))
  end

  def email_address(value)
    email = downcased stripped value
    return nil if email.nil_or_empty?
    return FieldError.new(value, :invalid) unless Poste.email_address?(email)
    email
  end

  def zip_code(value)
    value = stripped value
    return nil if value.nil_or_empty?
    return FieldError.new(value, :invalid) unless zip_code?(value)
    value
  end

  data = Object.const_get(kind).normalize(data)

  errors = {}
  data.each_pair do |key, value|
    errors[key] = [value.message] if value.class == FieldError
  end
  raise FormError.new(errors) unless errors.empty?

  data
end

def delete_form(kind, secret)
  form = DB[:forms].where(kind:kind, secret:secret).first
  return false unless form

  DB[:forms].where(id:form[:id]).delete
  Solr::Server.new(host:CDO.solr_server).delete_by_id(form[:id]) if CDO.solr_server

  true
end

def insert_form(kind, data, options={})
  if dashboard_user
    data[:email_s] ||= dashboard_user[:email]
    data[:name_s] ||= dashboard_user[:name]
  end

  data = validate_form(kind, data)

  form = Form.new
  form.secret = SecureRandom.hex
  form.parent_id = options[:parent_id]
  form.user_id = dashboard_user[:id] if dashboard_user
  form.email = data[:email_s].to_s.strip.downcase
  form.name = data[:name_s].to_s.strip
  form.kind = kind
  form.data = data
  form.created_ip = form.updated_ip = request.ip
  raise ValidationError.new(form) unless form.save

  form
end

def update_form(kind, secret, data)
  return nil unless form = Form.first(kind:kind, secret:secret)

  if dashboard_user && !dashboard_user[:admin]
    data[:email_s] ||= dashboard_user[:email]
    data[:name_s] ||= dashboard_user[:name]
  end

  data = validate_form(kind, data)

  form.user_id = dashboard_user[:id] if dashboard_user && !dashboard_user[:admin]
  form.email = data[:email_s].to_s.strip.downcase if data.has_key?(:email_s)
  form.name = data[:name_s].to_s.strip if data.has_key?(:name_s)
  form.data = data
  form.updated_ip = request.ip
  form.processed_at = nil
  form.indexed_at = nil
  form.review= nil
  form.reviewed_at = nil
  form.reviewed_by = nil
  form.reviewed_ip = nil
  raise ValidationError.new(form) unless form.save

  form
end

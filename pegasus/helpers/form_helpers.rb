require 'digest/md5'

def csv_multivalue(value)
  return value if value.class == FieldError
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
    value.map {|i| i.to_s.downcase}
  else
    value.to_s.downcase
  end
end

def enum(value, allowed)
  return value if value.class == FieldError
  return FieldError.new(value, :invalid) unless allowed.include?(value)
  value
end

def integer(value)
  return value if value.class == FieldError
  return nil if value.nil_or_empty?

  s_value = value.to_s.strip
  i_value = s_value.to_i
  return FieldError.new(value, :invalid) unless i_value.to_s == s_value

  i_value
end

def nil_if_empty(value)
  return value if value.class == FieldError
  return nil if value.nil_or_empty?
  value
end

def required(value)
  return value if value.class == FieldError
  return value if value.is_a? Integer
  return FieldError.new(value, :required) if value.nil_or_empty?
  value
end

def stripped(value)
  return value if value.class == FieldError
  if value.is_a?(Enumerable)
    value.map {|i| i.to_s.strip}
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
  return value if value.class == FieldError
  email = downcased stripped value
  return nil if email.nil_or_empty?
  return FieldError.new(value, :invalid) unless Poste2.email_address?(email)
  email
end

def zip_code(value)
  return value if value.class == FieldError
  value = stripped value
  return nil if value.nil_or_empty?
  return FieldError.new(value, :invalid) unless zip_code?(value)
  value
end

def confirm_match(value, value2)
  return value if value.class == FieldError
  return FieldError.new(value, :mismatch) if value != value2
  value
end

def us_phone_number(value)
  return value if value.class == FieldError
  value = stripped value
  return nil if value.nil_or_empty?
  return FieldError.new(value, :invalid) unless RegexpUtils.us_phone_number?(value)
  RegexpUtils.extract_us_phone_number_digits(value)
end

def data_to_errors(data)
  errors = {}

  data.each_pair do |key, value|
    if value.class == FieldError
      errors[key] = [value.message]
    elsif value.class == Hash
      suberrors = data_to_errors(value)
      suberrors.each_pair do |subkey, subvalue|
        newkey = "#{key}[#{subkey}]".to_sym
        errors[newkey] = subvalue
      end
    end
  end

  errors
end

def validate_form(kind, data)
  data = Object.const_get(kind).normalize(data)

  errors = data_to_errors(data)
  raise FormError.new(kind, errors) unless errors.empty?

  data
end

def delete_form(kind, secret)
  form = DB[:forms].where(kind: kind, secret: secret).first
  return false unless form

  DB[:forms].where(id: form[:id]).delete
  Solr::Server.new(host: CDO.solr_server).delete_by_id(form[:id]) if CDO.solr_server

  true
end

def insert_form(kind, data, options={})
  if dashboard_user
    data[:email_s] ||= dashboard_user[:email]
    data[:name_s] ||= dashboard_user[:name]
  end

  data = validate_form(kind, data)

  timestamp = DateTime.now

  normalized_email = data[:email_s].to_s.strip.downcase
  row = {
    secret: SecureRandom.hex,
    parent_id: options[:parent_id],
    email: normalized_email,
    name: data[:name_s].to_s.strip,
    kind: kind,
    data: data.to_json,
    created_at: timestamp,
    created_ip: request.ip,
    updated_at: timestamp,
    updated_ip: request.ip,
    hashed_email: Digest::MD5.hexdigest(normalized_email),
  }
  row[:user_id] = dashboard_user ? dashboard_user[:id] : data[:user_id_i]

  form_class = Object.const_get(kind)
  row[:source_id] = form_class.get_source_id(data) if form_class.respond_to? :get_source_id

  # For the most recent HOC signups, a duplicate (matching email and name)
  # entry is assumed to be an update rather than an insert.
  num_rows_updated = 0
  if kind == 'HocSignup2016'
    num_rows_updated = DB[:forms].
      where(email: row[:email], kind: kind, name: row[:name]).
      update(row)
  end
  # If we didn't perform an update, insert the row into the forms table and
  # create a corresponding form_geos row.
  if num_rows_updated == 0
    row[:id] = DB[:forms].insert(row)

    form_geos_row = {
      form_id: row[:id],
      created_at: timestamp,
      updated_at: timestamp,
      ip_address: request.ip
    }
    DB[:form_geos].insert(form_geos_row)
  end

  row
end

def update_form(kind, secret, data)
  return nil unless form = DB[:forms].where(kind: kind, secret: secret).first

  if dashboard_user && !dashboard_user[:admin]
    data[:email_s] ||= dashboard_user[:email]
    data[:name_s] ||= dashboard_user[:name]
  end

  prev_data = JSON.parse(form[:data], symbolize_names: true)
  symbolized_data = Hash[data.map {|k, v| [k.to_sym, v]}]
  data = validate_form(kind, prev_data.merge(symbolized_data))

  normalized_email = data[:email_s].to_s.strip.downcase if data.key?(:email_s)

  form[:user_id] = dashboard_user[:id] if dashboard_user && !dashboard_user[:admin]
  form[:email] = normalized_email
  form[:name] = data[:name_s].to_s.strip if data.key?(:name_s)
  form[:data] = data.to_json
  form[:updated_at] = DateTime.now
  form[:updated_ip] = request.ip
  form[:processed_at] = nil
  form[:indexed_at] = nil
  form[:review] = nil
  form[:reviewed_at] = nil
  form[:reviewed_by] = nil
  form[:reviewed_ip] = nil
  form[:hashed_email] = Digest::MD5.hexdigest(normalized_email) if data.key?(:email_s)
  DB[:forms].where(id: form[:id]).update(form)

  form
end

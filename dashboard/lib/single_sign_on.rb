# From https://raw.githubusercontent.com/discourse/discourse/master/lib/single_sign_on.rb
class SingleSignOn
  ACCESSORS = [
    :nonce,
    :name,
    :username,
    :email,
    :avatar_url,
    :avatar_force_update,
    :about_me,
    :external_id,
    :return_sso_url,
    :admin,
    :moderator,
    :add_groups,
    :remove_groups
  ].freeze
  BOOLS = [:avatar_force_update, :admin, :moderator].freeze

  attr_accessor(*ACCESSORS)

  attr_writer(:sso_secret, :sso_url)

  def self.sso_secret
    raise "sso_secret not implemented on class, be sure to set it on instance"
  end

  def self.sso_url
    raise "sso_url not implemented on class, be sure to set it on instance"
  end

  def sso_secret
    @sso_secret || self.class.sso_secret
  end

  def sso_url
    @sso_url || self.class.sso_url
  end

  def self.parse(payload, sso_secret = nil)
    sso = new
    sso.sso_secret = sso_secret if sso_secret

    parsed = Rack::Utils.parse_query(payload)
    if sso.sign(parsed["sso"]) != parsed["sig"]
      diags = "\n\nsso: #{parsed['sso']}\n\nsig: #{parsed['sig']}\n\nexpected sig: #{sso.sign(parsed['sso'])}"
      if /[^a-zA-Z0-9=\r\n\/+]/m.match?(parsed["sso"])
        raise "The SSO field should be Base64 encoded, using only A-Z, a-z, 0-9, +, /, and = characters. Your input contains characters we don't understand as Base64, see http://en.wikipedia.org/wiki/Base64 #{diags}"
      else
        raise "Bad signature for payload #{diags}"
      end
    end

    decoded = Base64.decode64(parsed["sso"])
    decoded_hash = Rack::Utils.parse_query(decoded)

    valid_bool_values = %w(true false)
    ACCESSORS.each do |k|
      val = decoded_hash[k.to_s]
      if BOOLS.include? k
        val = valid_bool_values.include?(val) ? val == "true" : nil
      end
      sso.send("#{k}=", val)
    end

    decoded_hash.each do |k, v|
      # 1234567
      # custom.
      #
      if k[0..6] == "custom."
        field = k[7..]
        sso.custom_fields[field] = v
      end
    end

    sso
  end

  def custom_fields
    @custom_fields ||= {}
  end

  def sign(payload)
    OpenSSL::HMAC.hexdigest("sha256", sso_secret, payload)
  end

  def to_url(base_url=nil)
    base = (base_url || sso_url).to_s
    "#{base}#{base.include?('?') ? '&' : '?'}#{payload}"
  end

  def payload
    payload = Base64.encode64(unsigned_payload)
    "sso=#{CGI.escape(payload)}&sig=#{sign(payload)}"
  end

  def unsigned_payload
    payload = {}
    ACCESSORS.each do |k|
      next if (val = send k).nil?

      payload[k] = val
    end

    @custom_fields&.each do |k, v|
      payload["custom.#{k}"] = v.to_s
    end

    Rack::Utils.build_query(payload)
  end
end

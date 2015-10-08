module EnvUtils

  SENSITIVE_KEYWORDS = %w[KEY PASSWORD]
  OBFUSCATION = '(HIDDEN)'

  #
  # ENV.redact_sensitive_values - returns a hash of all environment variables with sensitive* values obfuscated
  #   * an env var is considered sensitive when its name contains any SENSITIVE_KEYWORDS
  #
  def ENV.redact_sensitive_values
    env_hash = ENV.to_h
    env_hash.each_key do |key|
      if SENSITIVE_KEYWORDS.any? {|sensitive_keyword| key.upcase.include? sensitive_keyword}
        env_hash[key] = OBFUSCATION
      end
    end
  end

end

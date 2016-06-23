module EnvUtils
  SENSITIVE_KEYWORDS = %w[KEY PASSWORD SECRET]
  OBFUSCATION = '(HIDDEN)'

  def EnvUtils.redact_sensitive_values(hash)
    copy = hash.dup
    hash.each_key do |key|
      if SENSITIVE_KEYWORDS.any? {|sensitive_keyword| key.upcase.include? sensitive_keyword}
        copy[key] = OBFUSCATION
      end
    end
    copy
  end

  #
  # ENV.with_sensitive_values_redacted - returns a hash of all environment variables with sensitive* values obfuscated
  #   * an env var is considered sensitive when its name contains any SENSITIVE_KEYWORDS
  #
  def ENV.with_sensitive_values_redacted
    EnvUtils.redact_sensitive_values(ENV.to_h)
  end
end

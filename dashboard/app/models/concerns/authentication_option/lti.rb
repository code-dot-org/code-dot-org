# LTI AuthenticationOptions have a structured authentication_id in the format 'issuer|audience|subject'.
# Use these methods to extract specific components from the authentication_id.
module AuthenticationOption::Lti
  extend ActiveSupport::Concern

  LTI_AUTH_ID_PATTERN = /\A(?<issuer>[^|]+)\|(?<audience>[^|]+)\|(?<subject>[^|]+)\z/

  included do
    validates :authentication_id, if: :lti?, format: {
      with: LTI_AUTH_ID_PATTERN,
      message: "For LTI authentication_options, format must be '#{LTI_AUTH_ID_PATTERN.names.join('|')}'"
    }
  end

  def lti_issuer
    lti_auth_id_claims&.dig(:issuer)
  end

  def lti_audience
    lti_auth_id_claims&.dig(:audience)
  end

  def lti_subject
    lti_auth_id_claims&.dig(:subject)
  end

  private def lti_auth_id_claims
    LTI_AUTH_ID_PATTERN.match(authentication_id.to_s)&.named_captures&.symbolize_keys
  end
end

module EmailPreferenceConstants
  # Use the loopback IP address when designating that an Opt In/Out preference was recorded by our systems on behalf
  # of somebody (typically through an automated process).
  CODE_DOT_ORG = '127.0.0.1'.freeze

  SOURCE_TYPES = [
    ACCOUNT_SIGN_UP = 'ACCOUNT_SIGN_UP'.freeze,
    ACCOUNT_TYPE_CHANGE = 'ACCOUNT_TYPE_CHANGE'.freeze,
    ACCOUNT_EMAIL_ADD = 'ACCOUNT_EMAIL_ADD'.freeze,
    ACCOUNT_EMAIL_CHANGE = 'ACCOUNT_EMAIL_CHANGE'.freeze,
    PARENT_EMAIL_CHANGE = 'PARENT_EMAIL_CHANGE'.freeze,
    PARENT_EMAIL_BANNER = 'PARENT_EMAIL_BANNER'.freeze,
    FORM_HOUR_OF_CODE = 'FORM_HOUR_OF_CODE'.freeze,
    FORM_VOLUNTEER = 'FORM_VOLUNTEER'.freeze,
    FORM_ACCESS_REPORT = 'FORM_ACCESS_REPORT'.freeze,
    FORM_REGIONAL_PARTNER = 'FORM_REGIONAL_PARTNER'.freeze,
    FORM_HOC_SIGN_UP = 'FORM_HOC_SIGN_UP'.freeze,
    FORM_CLASS_SUBMIT = 'FORM_CLASS_SUBMIT'.freeze,
    FORM_PETITION = 'FORM_PETITION'.freeze,
    FORM_PD_INTERNATIONAL_OPT_IN = 'FORM_PD_INTERNATIONAL_OPT_IN'.freeze,
    # A one-time automated script sets all Petition submissions younger than 16 and older than 13 to opted out to comply
    # with GDPR.
    AUTOMATED_OPT_OUT_UNDER_16 = 'AUTOMATED_OPT_OUT_UNDER_16'.freeze,
    FORM_PD_REGIONAL_PARTNER_MINI_CONTACT = 'FORM_PD_REGIONAL_PARTNER_MINI_CONTACT'.freeze
  ].freeze
end

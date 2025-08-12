# frozen_string_literal: true

Dir[File.join(__dir__, 'hoc_legacy/**/*.rb')].sort.each {|file| require file}

module HocLegacy
  API_ROOT_PATH = '/api/hour/'
  UNSAMPLED_SESSION_ID = 'HOC_UNSAMPLED'
  DEFAULT_SESSION_WEIGHT = 1.0
  HOC_COOKIE_KEY = 'hour_of_code'
  HOC_COOKIES_DOMAIN = '.code.org'
end

require 'open-uri'
require 'json'
require 'faraday'

# Module performs POST request to Google for Recaptcha tokens
module GoogleRecaptchaHelper
  RECAPTCHA_ENDPOINT = 'https://www.google.com/recaptcha/api/siteverify'
  def verify_recaptcha_token(token)
    verify_hash = {'secret' => CDO.recaptcha_secret_key, 'response' => token}
    query_params = URI.encode_www_form(verify_hash)
    full_endpoint = RECAPTCHA_ENDPOINT + '?' + query_params
    resp = Faraday.post(full_endpoint)
    JSON.parse(resp.body)['success']
  end
end

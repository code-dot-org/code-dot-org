require 'geocoder'
require 'country_codes'
require_relative '../../../../shared/middleware/helpers/experiments'

module User::GenderExperimentHelper
  # Determines if we should ask the user what there gender is. This is an experiment to see if our
  # new gender questions get valuable responses from users.
  # When testing in the browser, you can use the query string param `?country_code=US` to test out
  # the US or another country experience.
  # When testing in the browser, you can use hte query string param `?gender_input_exp=true` to
  # test out the experience of the experiment being enabled. Leave the value empty if you want to
  # test the experience of having the experiment turned off.
  def ask_gender?(request)
    location = Geocoder.search(request.ip).try(:first)
    country_code = request.params['country_code'] || location&.country_code.to_s
    # This experiment is limited to the US. 'RD' is the code returned for localhost.
    us_country = country_code && ['US', 'RD'].include?(country_code.upcase)
    us_country && experiment_value('gender_input_exp')
  end

  GENDER_INPUT_TYPE_TEXT = 'text'
  GENDER_INPUT_TYPE_DROPDOWN = 'dropdown'
  # Determines the gender input selection experience a user will get when creating an account.
  # Uses the browser session id of the user to determine the experience so page refreshes don't
  # change the experience.
  # @param session_id {String} A hexadecimal number identifying the user's browser session
  def gender_input_type?(request, session_id)
    return request.params['gender_input'] if request.params['gender_input'].present?
    # 50% chance for each experience.
    session_id.to_i(16) % 2 ? GENDER_INPUT_TYPE_TEXT : GENDER_INPUT_TYPE_DROPDOWN
  end
end

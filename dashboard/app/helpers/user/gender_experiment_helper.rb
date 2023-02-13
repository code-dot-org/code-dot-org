require 'geocoder'
require 'country_codes'
require_relative '../../../../shared/middleware/helpers/experiments'

module User::GenderExperimentHelper
  # Determines if we should run the experiment of asking the user what there gender is. This is an
  # experiment to see if our new gender questions get valuable responses from users.
  # When testing in the browser, you can use the query string param `?country_code=US` to test out
  # the US or another country experience.
  # When testing in the browser, you can use hte query string param `?gender_input_exp=true` to
  # test out the experience of the experiment being enabled. Leave the value empty if you want to
  # test the experience of having the experiment turned off.
  def ask_gender_experiment?(request, session_id)
    location = Geocoder.search(request.ip).try(:first)
    country_code = request.params['country_code'] || location&.country_code.to_s
    # This experiment is limited to the US. 'RD' is the code returned for localhost.
    us_country = country_code && ['US', 'RD'].include?(country_code.upcase)
    us_country && experiment_value('gender_input_exp')
  end

  GENDER_INPUT_TYPE_NONE = 'none'
  GENDER_INPUT_TYPE_TEXT = 'text'
  GENDER_INPUT_TYPE_DROPDOWN = 'dropdown'
  # Determines the gender input selection experience a user will get when creating an account.
  # Uses the browser session id of the user to determine the experience so page refreshes don't
  # change the experience.
  #
  # There are three experiences which are being tested: 'none', 'dropdown', and 'text'. The
  # experience is randomly selected using the given session_id and the configured weights for each
  # experience. The weight configuration is stored in a Hash where the key is the experience type
  # and the value is the relative chance the experience should occur. For example:
  # {
  #   none: 50,
  #   dropdown: 30,
  #   text: 20
  # }
  # With the above configuration, 50% of users will get the 'none' experience, 30% the 'dropdown'
  # experience, and 20% the 'text' experience.
  def gender_input_type?(request, session)
    return request.params['gender_input'] if request.params['gender_input'].present?
    # If we have already determined the experience for the user, then show it again.
    return session[:gender_input_type] if session[:gender_input_type]
    weights = experiment_value('gender_input_exp_weights', {})
    none_weight = weights[GENDER_INPUT_TYPE_NONE] || 0
    text_weight = weights[GENDER_INPUT_TYPE_TEXT] || 0
    dropdown_weight = weights[GENDER_INPUT_TYPE_DROPDOWN] || 0
    total_weight = none_weight + text_weight + dropdown_weight
    # If there is no configuration, default to showing nothing.
    return GENDER_INPUT_TYPE_NONE if total_weight == 0

    experience = Random.rand(total_weight)
    gender_input_type = if experience < text_weight
                          GENDER_INPUT_TYPE_TEXT
                        elsif  experience < (dropdown_weight + text_weight)
                          GENDER_INPUT_TYPE_DROPDOWN
                        else
                          GENDER_INPUT_TYPE_NONE
                        end
    # Save the experience for this session so it is the same if the user refreshes the page.
    session[:gender_input_type] = gender_input_type
  end
end

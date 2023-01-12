require 'geocoder'
require 'country_codes'
require '../shared/middleware/helpers/experiments'

module User::GenderExperimentHelper
  # Determines if we should ask the user what there gender is. This is an experiment to see if our
  # new gender questions get valuable responses from users.
  # When testing in the browser, you can use the query string param `?country_code=US` to test out
  # the US or another country experience.
  # When testing in the browser, you can use hte query string param `?gender-text-input=true` to
  # test out the experience of the experiment being enabled. Leave the value empty if you want to
  # test the experience of having the experiment turned off.
  def ask_gender?(request)
    location = Geocoder.search(request.ip).try(:first)
    country_code = request.params['country_code'] || location&.country_code.to_s
    # This experiment is limited to the US. 'RD' is the code returned for localhost.
    us_country = country_code && ['US', 'RD'].include?(country_code.upcase)
    us_country && experiment_value('gender-text-input')
  end
end


# We have various cookies that we want to be environment specific. We accomplish
# this by tacking on the rack_env (unless we're in prod). This helper gets the
# appropriate cookie name
# @param {string} Base cookie name
# @returns {string} Actual cookie name, with the rack_env appended
def environment_specific_cookie_name(base_name)
  return base_name if CDO.rack_env?(:production)
  "#{base_name}_#{CDO.rack_env}"
end

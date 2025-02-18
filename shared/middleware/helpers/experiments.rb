# Sometimes we want to hide features behind dynamic configurations
# because they are not ready yet. To test these features, you might
# want to use a URL parameter or browser cookie to temporarily
# enable it for a single user. If you want to configure it for all
# users, you can use DCDO.
#
# If multiple configurations are available, this is the priority
# (from highest to lowest):
#
# 1. URL Parameter - https://code.org?my_experiment=1
# 2. Browser Cookie - document.cookie = 'my_experiment=1';
# 3. DCDO config - DCDO.set('my_experiment', 1)
#
# Note: To surface these experiment values to front-end code, make
# use of the `experiments` module in our JavaScript codebase found
# at apps/src/util/experiments.js instead of passing the value
# through via any Haml. Specifically:
#
#   experiments.isEnabledAllowingQueryString("my_experiment")
#
# is the JavaScript equivalent for the Ruby side's:
# `experiment_value("my_experiment", request)`
#
# You will need to add the experiment tag to that `util/experiments.js`
# file along with allowing it to be pushed from DCDO to the frontend in
# `lib/dynamic_config/dcdo.rb` by adding the flag to the
# `frontend_config` function.
#
# @param name [String] the name of the experiment.
# @param request [ActionDispatch::Request] the web request being processed
# @param default [Object] the value to return if no configuration is found.
def experiment_value(name, request, default = nil)
  return request.params[name] if request.params[name].present?
  return request.cookies[name] if request.cookies[name].present?
  DCDO.get(name, default)
end

# Sometimes we want to hide features behind dynamic configurations
# because they are not ready yet. To test these features, you might
# want to use a URL parameter or browser cookie to temporarily
# enable it for a single user. If you want to configure it for all
# users, you can use DCDO.
# If multiple configurations are available, this is the priority
# (from highest to lowest):
# 1. URL Parameter - https://code.org?my_experiment=1
# 2. Browser Cookie - document.cookie = 'my_experiment=1';
# 3. DCDO config - DCDO.set('my_experiment', 1)
def experiment_value(name, default = nil)
  return request.params[name] if request.params[name].present?
  return request.cookies[name] if request.cookies[name].present?
  DCDO.get(name, default)
end

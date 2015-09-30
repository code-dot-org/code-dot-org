# Environment-specific session cookie key constant.
require_relative '../../deployment'
class Session
  KEY = "_learn_session#{"_#{rack_env}" unless rack_env?(:production)}"
  STORAGE_ID = "storage_id#{"_#{rack_env}" unless rack_env?(:production)}"
end

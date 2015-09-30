# Environment-specific session cookie key constant.
require_relative '../../deployment'
class Session
  env_suffix = rack_env?(:production) ? '' : "_#{rack_env}"
  KEY = "_learn_session#{env_suffix}"
  STORAGE_ID = "storage_id#{env_suffix}"
end

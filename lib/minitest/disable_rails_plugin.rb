# Disables built-in 'rails' Minitest plugin due to incompatibility with Minitest >= 5.11.
# https://github.com/seattlerb/minitest/issues/730
# Fixed in Rails >= 5.2.x so this workaround can be removed after upgrading.
# https://github.com/rails/rails/pull/31624

# Make sure rails_plugin is loaded first.
Minitest.load_plugins

class <<Minitest
  remove_method :plugin_rails_init if method_defined?(:plugin_rails_init)
end

# Monkey patch the `state_machine` gem (a dependency of `eyes_selenium`) to
# support Ruby >= 3.2. This gem was replaced with `state_machines` in
# `eyes_selenium` v6.0.4, so the patch can be removed once we upgrade.
begin
  require 'state_machine/integrations/base'

  module StateMachine
    module Integrations
      module Base
        module ClassMethods
          # Patch the original `locale_path` method; replace deprecated
          # `File.exists?` with modern `File.exist?`
          #
          # See https://github.com/pluginaweek/state_machine/blob/v1.2.0/lib/state_machine/integrations/base.rb#L78C24-L82C12
          def locale_path
            path = "#{File.dirname(__FILE__)}/#{integration_name}/locale.rb"
            path if File.exist?(path)
          end
        end
      end
    end
  end
rescue LoadError
  # state_machine gem is only installed in test and development environments
end

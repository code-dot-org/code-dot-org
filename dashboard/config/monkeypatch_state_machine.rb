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

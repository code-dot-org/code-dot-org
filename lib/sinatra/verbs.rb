module Sinatra
  module Verbs
    # Defines custom HTTP verbs.
    def self.custom(*verbs)
      verbs.each do |verb_name|
        ::Sinatra::Delegator.module_eval <<-RUBY
          def #{verb_name}(*args, &b)
            ::Sinatra::Application.send(#{verb_name.inspect}, *args, &b)
          end
          private #{verb_name.inspect}
        RUBY
        ::Sinatra::Base.module_eval <<-RUBY
          def self.#{verb_name}(path, opts={}, &bk); route '#{verb_name.to_s.upcase}', path, opts, &bk end
        RUBY
      end
    end
  end
end

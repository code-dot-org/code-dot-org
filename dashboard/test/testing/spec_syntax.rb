require 'active_support/concern'
require 'minitest/rails'

module ActiveSupport
  module Testing
    module SpecSyntax
      extend ActiveSupport::Concern

      class_methods do
        # Makes regular ActiveSupport `test` cases compatible with Spec-style (`it`) tests.
        def test(...)
          name = super

          # ActiveSupport test cases should not contain any nested tests, unlike Spec's `describe` blocks.
          # See: https://github.com/minitest/minitest/blob/v5.18.0/lib/minitest/spec.rb#L235-L237
          children.each do |child_klass|
            child_klass.send :undef_method, name
          end

          name
        end
      end
    end
  end
end

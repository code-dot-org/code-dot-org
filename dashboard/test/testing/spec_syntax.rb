require 'active_support/concern'
require 'minitest/rails'

module ActiveSupport
  module Testing
    module SpecSyntax
      extend ActiveSupport::Concern

      class_methods do
        # This method is used to define a new context (a group of related tests) in a Minitest spec.
        # It overrides the default 'describe' method provided by Minitest::Spec.
        #
        # The method maintains a stack of contexts. When a new context is defined, it is pushed onto the stack.
        # This allows nested contexts to be defined. The current context is always the one on top of the stack.
        #
        # If the stack is empty when this method is called, the current class is pushed onto the stack.
        # This is because the current class is the outermost context.
        #
        # After the new context is defined, it is popped from the stack, unless it is the outermost context.
        # This ensures that the next context to be defined will be nested within the correct parent context.
        #
        # See: https://github.com/metaskills/minitest-spec-rails/blob/v7.2.0/lib/minitest-spec-rails/dsl.rb#L9-L14
        def describe(*args, &block)
          # Get the current stack of contexts
          stack = Minitest::Spec.describe_stack
          # If the stack is empty, push the current class onto it
          stack.push(self) if stack.empty?
          # Define the new context
          super(*args) {class_eval(&block)}
          # If this is not the outermost context, pop it from the stack
          stack.pop if stack.length == 1
        end

        # Removes `describe` blocks added to each `test` case by Minitest::Spec.
        # See: https://github.com/minitest/minitest/blob/v5.18.0/lib/minitest/spec.rb#L270-L281
        def test(...)
          name = super

          children.each do |child_klass|
            child_klass.send :undef_method, name
          end

          name
        end

        # This method is used to define a memoized assertion helper method for the test subject within the example scope.
        #
        # @see https://rspec.info/features/3-13/rspec-core/subject/explicit-subject
        # @example Defining the subject of the test
        #   class FooTest < ActiveSupport::TestCase
        #     describe '.bar' do
        #       subject(:bar) { Foo.bar }
        #
        #       it 'returns bar' do
        #         _bar.must_equal 'bar'
        #       end
        #     end
        #   end
        #
        # @param name [Symbol] The name of the tested subject
        # @param block [Proc] The block that defines the subject
        # @return [void]
        def subject(name = :subject, &block)
          already_initialized = respond_to?(name)

          let name, &block

          let("_#{name}") {_ public_send(name)} unless already_initialized
        end

        # This method is used to define a memoized helper method and ensures its invocation before each example.
        #
        # @see https://rspec.info/features/3-13/rspec-core/helper-methods/let/
        #
        # @param name [Symbol] The name of the memoized helper method
        # @param block [Proc] The block that defines the helper method
        # @return [void]
        def let!(name, &block)
          already_initialized = respond_to?(name)

          let name, &block

          before {public_send(name)} unless already_initialized
        end
      end

      def described_class
        @described_class ||= class_name[/^(.*)Test::/, 1]&.constantize
      end
    end
  end
end

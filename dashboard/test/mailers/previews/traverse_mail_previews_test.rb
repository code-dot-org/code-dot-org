require 'test_helper'

class TraverseMailPreviewsTest < ActiveSupport::TestCase
  test 'Verify all mailers can be run' do
    classes = Dir['./test/mailers/previews/*_preview.rb'].map do |file|
      require file
      Object.const_get('Pd::' + file.scan(/\/pd_([\w_]+).rb/).first.first.camelize)
    end

    classes.each do |klass|
      methods =  klass.instance_methods - FactoryGirl::Syntax::Methods.methods - FactoryGirl::Syntax::Methods.instance_methods

      methods.each do |method|
        # Call each method on each mailer preview class. For now its enough to make sure
        # that the mailer preview can successfully run
        klass.new.send(method.to_sym)
      end
    end
  end
end

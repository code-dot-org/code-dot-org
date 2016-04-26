# encoding: UTF-8
# -*- mode: ruby -*-
# vi: set ft=ruby :

# More info at https://github.com/guard/guard#readme

# Style Tests
# ===========
# - Foodcritic
# - RuboCop

group :style,
      halt_on_fail: true do
  guard :foodcritic,
        cli: '--exclude test/unit',
        cookbook_paths: '.',
        all_on_start: false do
    watch(%r{attributes/.+\.rb$})
    watch(%r{definitions/.+\.rb$})
    watch(%r{libraries/.+\.rb$})
    watch(%r{providers/.+\.rb$})
    watch(%r{recipes/.+\.rb$})
    watch(%r{resources/.+\.rb$})
    watch(%r{templates/.+\.erb$})
    watch('metadata.rb')
  end

  guard :rubocop,
        all_on_start: false do
    watch(/.+\.rb$/)
    watch('Gemfile')
    watch('Rakefile')
    watch('Capfile')
    watch('Guardfile')
    watch('Podfile')
    watch('Thorfile')
    watch('Vagrantfile')
    watch('Berksfile')
    watch('Cheffile')
    watch('Vagabondfile')
  end
end # group style

# Unit Tests
# ==========
# - test/unit/libraries/${library}_spec.rb: Unit tests for libraries.
# - test/unit/recipes/${recipe}_spec.rb: ChefSpec tests for recipes.
# - test/unit/resources/${resource}_spec.rb: ChefSpec tests for resources.
# - test/unit/templates/${template}_spec.rb: ChefSpec tests for templates.

group :unit do
  guard :rspec,
        cmd: 'bundle exec rake unit',
        all_on_start: false do
    watch(%r{^libraries/(.+)\.rb$}) do |m|
      "test/unit/libraries/#{m[1]}_spec.rb"
    end
    watch(%r{^recipes/(.+)\.rb$}) { |m| "test/unit/recipes/#{m[1]}_spec.rb" }
    watch(%r{^(?:providers|resources)/(.+)\.rb$}) do |m|
      "test/unit/resources/#{m[1]}_spec.rb"
    end
    watch(%r{^templates/(.+)\.rb$}) { 'test/unit/templates' }
    watch(%r{^test/unit/.+_spec\.rb$})
    watch('test/unit/spec_helper.rb') { 'spec' }
  end
end # group unit

# Integration Tests
# =================
# - test-kitchen
#
# Temporary disabled. See the Gemfile.

# group :integration do
#   guard 'kitchen',
#         all_on_start: false do
#     watch(%r{attributes/.+\.rb$})
#     watch(%r{definitions/.+\.rb$})
#     watch(%r{libraries/.+\.rb$})
#     watch(%r{providers/.+\.rb$})
#     watch(%r{recipes/.+\.rb$})
#     watch(%r{resources/.+\.rb$})
#     watch(%r{files/.+})
#     watch(%r{templates/.+\.erb$})
#     watch('metadata.rb')
#     watch(%r{test/.+$})
#     watch('Berksfile')
#   end
# end # group integration

scope groups: [:style, :unit]

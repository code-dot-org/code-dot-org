# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'core/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'core'
  s.version     = Core::VERSION
  s.authors     = ['Code.org']
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['Code.org License']
  s.summary     = 'Code.org Core'

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.metadata['rubygems_mfa_required'] = 'true'
end

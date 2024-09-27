# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'lti/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'lti'
  s.version     = Lti::VERSION
  s.authors     = ['Code.org']
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['Code.org License']
  s.summary     = 'Code.org LTI 1.3 Integration'

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.metadata['rubygems_mfa_required'] = 'true'
end

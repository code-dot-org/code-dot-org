# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'marketing'
  s.authors     = ['Code.org']
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['Code.org License']
  s.summary     = 'Code.org Marketing for Dashboard'
  s.version     = '0.0.0'

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.metadata['rubygems_mfa_required'] = 'true'

  s.add_dependency 'contentful'
end

require_relative 'lib/cdo_contentful/version'

Gem::Specification.new do |spec|
  spec.name     = 'cdo_contentful'
  spec.version  = CdoContentful::VERSION
  spec.authors  = ['Code.org']
  spec.licenses = [Gem::Licenses::NONSTANDARD] # ['Code.org License']
  spec.summary  = 'Code.org Contentful space clients for Dashboard'

  spec.files = Dir['{lib}/**/*', 'Rakefile']

  spec.metadata['rubygems_mfa_required'] = 'true'

  spec.add_dependency 'contentful', '~> 2.18'
  spec.add_dependency 'rails', '~> 6.1.7'
  spec.add_dependency 'zeitwerk', '~> 2.6.7'

  spec.add_development_dependency 'minitest', '~> 5.15'
  spec.add_development_dependency 'vcr', '~> 6.2.0'
  spec.add_development_dependency 'webmock', '~> 3.8'
end

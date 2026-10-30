# frozen_string_literal: true

Gem::Specification.new do |s|
  s.name        = 'hoc_legacy'
  s.authors     = ['Code.org']
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['Code.org License']
  s.summary     = 'HourOfCode Legacy API for Dashboard'
  s.version     = '0.0.0'

  s.files = Dir['{app,bin,config,lib,test}/**/*']

  s.metadata['rubygems_mfa_required'] = 'true'
end

require 'cdo/poste'
require 'cdo/regexp'
require src_dir 'database'
require lib_dir 'forms/pegasus_form_errors'
require lib_dir 'forms/pegasus_form_validation'
require 'active_support/core_ext/string/inflections'

# Autoload all classes in forms directory.
Dir.glob(pegasus_dir('forms/*.rb')).each do |path|
  autoload File.basename(path, '.rb').camelize, path
end

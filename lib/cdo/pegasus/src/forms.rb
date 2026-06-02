require 'cdo/poste'
require 'cdo/regexp'
require 'cdo/pegasus/src/database'
require lib_dir 'forms/pegasus_form_errors'
require lib_dir 'forms/pegasus_form_validation'
require 'active_support/core_ext/string/inflections'
require 'cdo/pegasus/helpers/email_preference_helpers'

# Autoload all classes in forms directory.
Dir.glob(lib_dir('cdo/pegasus/forms/*.rb')).each do |path|
  autoload File.basename(path, '.rb').camelize, path
end

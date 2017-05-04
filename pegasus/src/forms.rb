require 'cdo/poste'
require 'cdo/regexp'
require src_dir 'database'
require lib_dir 'forms/pegasus_form_errors'

# Load forms
Dir.glob(pegasus_dir('forms/*.rb')).each {|path| require path}

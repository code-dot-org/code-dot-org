require 'cdo/regexp'
require src_dir 'database'
require File.join(CDO.root_dir, 'lib/forms/pegasus_form_errors')

# Load forms
Dir.glob(pegasus_dir('forms/*.rb')).each {|path| require path}

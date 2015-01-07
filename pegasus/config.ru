require File.expand_path('../router', __FILE__)

require 'cdo/middleware/shared_resources'
use SharedResources

run Documents

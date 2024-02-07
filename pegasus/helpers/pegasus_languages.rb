require_relative '../src/env'

require 'cdo/db'
require 'cdo/languages'

class PegasusLanguages < Languages
  def self.table
    @@table ||= PEGASUS_DB[:cdo_languages]
  end
end

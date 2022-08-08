require 'cdo/db'
require 'cdo/cache_method'

class PegasusLanguages < Languages
  using CacheMethod
  def self.table
    @@table ||= PEGASUS_DB[:cdo_languages]
  end
end

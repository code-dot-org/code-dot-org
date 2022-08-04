require 'cdo/db'
require 'cdo/cache_method'

class DashboardLanguages < Languages
  using CacheMethod
  def self.table
    @@table ||= DASHBOARD_DB[:google_sheets_shared_cdo_languages]
  end
end

require 'cdo/db'
require 'cdo/languages'

class DashboardLanguages < Languages
  def self.table
    @@table ||= DASHBOARD_DB[:google_sheets_shared_cdo_languages]
  end
end

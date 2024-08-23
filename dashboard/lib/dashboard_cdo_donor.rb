
require 'cdo/cdo_donor'

class DashboardCdoDonor < CdoDonor
  def self.all_donors
    @@all_donors ||= DASHBOARD_DB[:google_sheets_shared_cdo_donors].all
  end
end

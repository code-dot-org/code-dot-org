require 'honeybadger/ruby'
require 'cdo/cdo_donor'

class DashboardCdoDonor < CdoDonor
  def self.all_donors
    @@all_donors ||= DASHBOARD_DB[:cdo_donors].all
  end
end

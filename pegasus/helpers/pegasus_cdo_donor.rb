require 'honeybadger/ruby'
require 'cdo/cdo_donor'

class PegasusCdoDonor < CdoDonor
  def self.all_donors
    @@all_donors ||= PEGASUS_DB[:cdo_donors].all
  end
end

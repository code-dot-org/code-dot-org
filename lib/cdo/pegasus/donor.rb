require 'honeybadger/ruby'

class CdoDonor
  # Returns a random donor's twitter handle.
  def self.get_random_donor_twitter
    donor, weight = get_random_donor_by_twitter_weight
    if donor && donor[:twitter_s]
      donor[:twitter_s]
    else
      report_failure(donor, weight)
      '@microsoft'
    end
  end

  # @return [Hash] a donor name and their twitter handle
  def self.get_random_donor_name_and_twitter
    donor, weight = get_random_donor_by_twitter_weight
    if donor && donor[:twitter_s]
      {
        name: donor[:name_s],
        twitter: donor[:twitter_s]
      }
    else
      report_failure(donor, weight)
      {
        name: 'Microsoft',
        twitter: '@microsoft'
      }
    end
  end

  def self.get_random_donor_name
    donor = get_random_donor_by_weight
    donor[:name_s]
  end

  def self.valid_donor_name?(donor_name)
    all_donors.any? {|donor| donor[:name_s] == donor_name}
  end

  # @return [Array] a donor record and the random weight used to find that record
  def self.get_random_donor_by_twitter_weight
    weight = SecureRandom.random_number
    donor = all_donors.find {|d| d[:twitter_weight_f] - weight >= 0}
    [donor, weight]
  end

  def self.report_failure(donor, weight)
    Honeybadger.notify(
      error_class: 'Failed to pull a random donor twitter handle',
      error_message: donor ? "Donor returned nil for weight #{weight}" : "Twitter handle was nil for donor #{donor}"
    )
  end

  def self.get_random_donor_by_weight
    weight = SecureRandom.random_number
    all_donors.find {|d| d[:weight_f] - weight >= 0}
  end

  def self.all_donors
    @@all_donors ||= PEGASUS_DB[:cdo_donors].all
  end
end

require 'honeybadger/ruby'

# Returns a random donor's twitter handle.
def get_random_donor_twitter
  donor, weight = get_random_donor
  if donor && donor[:twitter_s]
    donor[:twitter_s]
  else
    report_failure(donor, weight)
    '@microsoft'
  end
end

# @return [Hash] a donor name and their twitter handle
def get_random_donor_name_and_twitter
  donor, weight = get_random_donor
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

# @return [Array] a donor record and the random weight used to find that record
def get_random_donor
  weight = SecureRandom.random_number
  donor = DB[:cdo_donors].all.find {|d| d[:twitter_weight_f] - weight >= 0}
  [donor, weight]
end

def report_failure(donor, weight)
  Honeybadger.notify(
    error_class: 'Failed to pull a random donor twitter handle',
    error_message: donor ? "Donor returned nil for weight #{weight}" : "Twitter handle was nil for donor #{donor}"
  )
end

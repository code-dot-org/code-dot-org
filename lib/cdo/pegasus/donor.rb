# Returns a random donor's twitter handle.
def get_random_donor_twitter
  weight = SecureRandom.random_number
  donor = DB[:cdo_donors].where('((twitter_weight_f - ?) >= 0)', weight).first
  if donor && donor[:twitter_s]
    return donor[:twitter_s]
  else
    Honeybadger.notify(
      error_class: 'Failed to pull a random donor twitter handle',
      error_message: donor ? "Donor returned nil for weight #{weight}" : "Twitter handle was nil for donor #{donor}"
    )
    return '@microsoft'
  end
end

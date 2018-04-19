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

def get_random_donor_email_message
  share_link = 'https://twitter.com/home?status=I%20just%20signed%20up%20to%20teach%20computer%20science%20using%20Code.org%21%20Thanks%20%40microsoft%20for%20supporting%20%40codeorg.%20'
  link_html = "<a href=\"#{share_link}\">Tweet a message of thanks</a>"
  rest_of_message = " to Microsoft, one of our donors"
  weight = SecureRandom.random_number
  donor = DB[:cdo_donors].where('((twitter_weight_f - ?) >= 0)', weight).first
  if donor && donor[:twitter_s]
    link_html.sub!('%40microsoft', "%40#{donor[:twitter_s][1..-1]}")
    rest_of_message.sub!('Microsoft', donor[:name_s])
  else
    Honeybadger.notify(
      error_class: 'Failed to pull a random donor twitter handle',
      error_message: donor ? "Donor returned nil for weight #{weight}" : "Twitter handle was nil for donor #{donor}"
    )
  end
  link_html + rest_of_message
end

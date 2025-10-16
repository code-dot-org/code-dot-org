module RaceInterstitialHelper
  # Determine whether or not to show the race interstitial popup to a user
  def self.show?(user)
    return false if user.nil?
    return false if user.teacher?
    return false if user.under_13?

    # Special handling for users affected by a bug that prevented race information from being saved.
    # Users were affected if they were created between May 2023 and February 2024.
    # PR with the fix: https://github.com/code-dot-org/code-dot-org/pull/56729
    bug_start_date = Time.new(2023, 5)
    bug_end_date = Time.new(2024, 2)
    if (user.created_at < bug_start_date || user.created_at > bug_end_date) && user.races.present?
      return false
    elsif (bug_start_date <= user.created_at && user.created_at <= bug_end_date) && user.races.present? && user.races != 'closed_dialog'
      return false
    end

    # Covers test cases if we don't have sign in records for a user
    return false if user.days_since_first_sign_in.nil?
    # Covers actual behavior we want in our application
    return false if user.days_since_first_sign_in < 7

    # Restrict to cases where we can successfully geolocate to the US
    return false if user.current_sign_in_ip.nil?
    location = Geocoder.search(user.current_sign_in_ip).first
    return false unless location&.country_code.to_s.casecmp?('us')

    return true
  end
end

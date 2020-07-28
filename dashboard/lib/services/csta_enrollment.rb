#
# As part of our Amazon Future Engineer partnership, teachers at eligible
# schools are offered a free CSTA+ membership. Our system expedites this
# process by automatically creating a submission to CSTA's enrollment form
# on the teacher's behalf.
#
# The CSTA form runs on JotForm, and we are using JotForm's public API to
# create new form submissions.  CSTA has provided us with a form ID and API key.
# See: https://api.jotform.com/docs/#post-form-id-submissions
#
class Services::CSTAEnrollment
  class Error < StandardError; end

  # Submit a teacher's information to the CSTA Plus Jotform API
  #
  # @param first_name [String] max 127 characters
  # @param last_name [String] max 127 characters
  # @param email [String] max 127 characters
  # @param school_district_name [String]
  # @param school_name [String]
  # @param street_1 [String] School address, max 50 characters
  # @param street_2 [String] School address, max 30 characters
  # @param city [String] School city, max 50 characters
  # @param state [String] School state, 2 characters
  # @param zip [String] School zip, 5 characters
  # @param privacy_permission [Boolean] Whether the teacher agreed to
  #        the CSTA privacy policy.
  def self.submit(first_name:, last_name:, email:, school_district_name:,
    school_name:, street_1:, street_2:, city:, state:, zip:,
    privacy_permission:)
    return unless CDO.csta_jotform_api_key && CDO.csta_jotform_form_id

    raise Error.new('CSTA submission skipped: Privacy consent was not provided') unless privacy_permission

    url = "https://api.jotform.com/form/#{CDO.csta_jotform_form_id}/submissions" \
      "?apiKey=#{CDO.csta_jotform_api_key}"

    # These question IDs are hard-coded for now; we've manually verified that
    # they are the same for CSTA's test form and their production form.
    # If their form changes, these may need to be updated.
    response = Net::HTTP.post_form(
      URI(url),
      {
        "submission[15_first]" => first_name,
        "submission[15_last]" => last_name,
        "submission[16]" => email,
        "submission[5]" => school_district_name.titleize,
        "submission[18]" => school_name.titleize,
        "submission[17_st1]" => titleize_address(street_1),
        "submission[17_st2]" => titleize_address(street_2),
        "submission[17_city]" => city.titleize,
        "submission[17_state]" => get_us_state_abbr(state, true),
        "submission[17_zip]" => zip,
        "submission[19]" => "Yes, I provide my consent."
      }
    )

    unless response.code == '200'
      raise Error.new("CSTA submission failed with HTTP #{response.code}: #{response.body}")
    end

    nil
  end

  def self.titleize_address(address)
    address.titleize.gsub(/\b(N|S|E|W|NE|SE|NW|SW)\b/i, &:upcase)
  end
end

#
# As part of our Amazon Future Engineer partnership, teachers at eligible
# schools are offered a free CSTA membership. Our system expedites this
# process by automatically creating a submission to CSTA's enrollment form
# on the teacher's behalf.
#
# The CSTA form runs on JotForm, and we are using JotForm's public API to
# create new form submissions.  CSTA has provided us with a form ID and API key.
# See: https://api.jotform.com/docs/#post-form-id-submissions
#
# In 2026, CSTA published a new intake form
# (https://form.jotform.com/252313441776153) that adds demographic and
# chapter questions and reshuffles some of the existing question IDs. The
# DCDO flag `csta_jotform_v2` selects between the legacy payload (built
# against the original form) and the v2 payload (built against the new
# form). Flip the flag once CDO.csta_jotform_form_id has been pointed at
# the new form and the marketing-sites UI has been updated to send the
# new param shape.
#
class Services::CSTAEnrollment
  class Error < StandardError; end

  CSTA_JOTFORM_V2_DCDO_KEY = 'csta_jotform_v2'.freeze

  # Submit a teacher's information to the CSTA Plus Jotform API.
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
  # @param professional_role [String] Teacher's professional role
  # @param grades_teaching [String, Array<String>] Grade bands. The legacy
  #        form takes a single comma-joined string; the v2 form takes an
  #        array of checkbox labels ("K to 5", "6 to 8", "9 to 12",
  #        "other"). The service accepts either shape and dispatches based
  #        on the active branch.
  # @param privacy_permission [Boolean] Whether the teacher agreed to
  #        the CSTA privacy policy.
  # @param nces_id [String] 12-digit NCES school code (v2 only)
  # @param ethnicity_race [Array<String>] Selected ethnicity values (v2 only)
  # @param gender_identity [String] Selected gender identity (v2 only)
  # @param primary_chapter [String] Selected CSTA chapter (v2 only)
  def self.submit(first_name:, last_name:, email:, school_district_name:,
    school_name:, street_1:, street_2:, city:, state:, zip:, professional_role:,
    grades_teaching:, privacy_permission:,
    nces_id: '', ethnicity_race: [], gender_identity: '', primary_chapter: '')
    return unless CDO.csta_jotform_api_key && CDO.csta_jotform_form_id

    raise Error.new('CSTA submission skipped: Privacy consent was not provided') unless privacy_permission

    url = "https://api.jotform.com/form/#{CDO.csta_jotform_form_id}/submissions" \
      "?apiKey=#{CDO.csta_jotform_api_key}"

    payload =
      if DCDO.get(CSTA_JOTFORM_V2_DCDO_KEY, false)
        build_v2_payload(
          first_name: first_name, last_name: last_name, email: email,
          school_district_name: school_district_name, school_name: school_name,
          street_1: street_1, street_2: street_2, city: city, state: state, zip: zip,
          nces_id: nces_id, professional_role: professional_role,
          grades_teaching: grades_teaching, ethnicity_race: ethnicity_race,
          gender_identity: gender_identity, primary_chapter: primary_chapter
        )
      else
        build_v1_payload(
          first_name: first_name, last_name: last_name, email: email,
          school_district_name: school_district_name, school_name: school_name,
          street_1: street_1, street_2: street_2, city: city, state: state, zip: zip,
          professional_role: professional_role, grades_teaching: grades_teaching
        )
      end

    response = Net::HTTP.post_form(URI(url), payload)

    unless response.code == '200'
      raise Error.new("CSTA submission failed with HTTP #{response.code}: #{response.body}")
    end

    nil
  end

  def self.titleize_address(address)
    address.titleize.gsub(/\b(N|S|E|W|NE|SE|NW|SW)\b/i, &:upcase)
  end

  # Legacy form payload. Question IDs were manually verified against
  # CSTA's original test and production forms; if their form changes,
  # these may need to be updated.
  private_class_method def self.build_v1_payload(first_name:, last_name:, email:,
    school_district_name:, school_name:, street_1:, street_2:, city:, state:, zip:,
    professional_role:, grades_teaching:)
    {
      "submission[15_first]" => first_name,
      "submission[15_last]"  => last_name,
      "submission[16]"       => email,
      "submission[5]"        => school_district_name.titleize,
      "submission[18]"       => school_name.titleize,
      "submission[17_st1]"   => titleize_address(street_1),
      "submission[17_st2]"   => titleize_address(street_2),
      "submission[17_city]"  => city.titleize,
      "submission[17_state]" => get_us_state_abbr(state, include_dc: true),
      "submission[17_zip]"   => zip,
      "submission[19]"       => "Yes, I provide my consent.",
      "submission[25]"       => professional_role,
      "submission[22]"       => grades_teaching,
    }
  end

  # v2 form payload, built against form 252313441776153. Question IDs
  # were manually verified against the rendered form HTML on 2026-05-19.
  # Notable differences from v1:
  #   - School Name moved from qid 18 to qid 30
  #   - qid 18 is reused for the new School NCES Code field
  #   - State moved out of the address block into its own qid 29 dropdown
  #     (the in-address state at 17_state is display:none on the new form)
  #   - Address sub-fields renamed: st1/st2/zip -> addr_line1/addr_line2/postal
  #   - Grade Bands (qid 22) is now a multi-checkbox, submitted as
  #     submission[22][N]=<value>
  #   - New questions: qid 26 Ethnicity/Race (multi), qid 27 Gender
  #     Identity, qid 28 Primary Chapter
  private_class_method def self.build_v2_payload(first_name:, last_name:, email:,
    school_district_name:, school_name:, street_1:, street_2:, city:, state:, zip:,
    nces_id:, professional_role:, grades_teaching:, ethnicity_race:,
    gender_identity:, primary_chapter:)
    payload = {
      "submission[15_first]"      => first_name,
      "submission[15_last]"       => last_name,
      "submission[16]"            => email,
      "submission[5]"             => school_district_name.titleize,
      "submission[30]"            => school_name.titleize,
      "submission[18]"            => nces_id,
      "submission[17_addr_line1]" => titleize_address(street_1),
      "submission[17_addr_line2]" => titleize_address(street_2),
      "submission[17_city]"       => city.titleize,
      "submission[17_postal]"     => zip,
      "submission[29]"            => get_us_state_abbr(state, include_dc: true),
      "submission[19]"            => "Yes, I provide my consent.",
      "submission[25]"            => professional_role,
      "submission[27]"            => gender_identity,
      "submission[28]"            => primary_chapter,
    }

    Array(grades_teaching).compact_blank.each_with_index do |val, i|
      payload["submission[22][#{i}]"] = val
    end
    Array(ethnicity_race).compact_blank.each_with_index do |val, i|
      payload["submission[26][#{i}]"] = val
    end

    payload
  end
end

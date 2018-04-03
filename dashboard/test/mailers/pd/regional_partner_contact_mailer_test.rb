require 'test_helper'

class RegionalPartnerContactMailerTest < ActionMailer::TestCase
  FORM_DATA = {
    first_name: 'firstName',
    last_name: 'lastName',
    title: 'Dr.',
    email: 'foo@bar.com',
    role: 'School Administrator',
    job_title: 'title',
    grade_levels: ['High School'],
    school_type: 'public',
    school_district_other: false,
    school_district: 'District',
    school_state: 'OH',
    school_zipcode: '45242'
  }

  test 'matched links are valid urls' do
    regional_partner_contact = create :pd_regional_partner_contact, form_data: FORM_DATA.to_json
    form = regional_partner_contact.sanitize_and_trim_form_data_hash
    rp_pm = create :regional_partner_program_manager
    mail = Pd::RegionalPartnerContactMailer.matched(form, rp_pm)

    assert links_are_complete_urls?(mail)
  end

  # TODO: When cc is suported, remove email from unmatched
  test 'unmatched links are valid urls' do
    regional_partner_contact = create :pd_regional_partner_contact, form_data: FORM_DATA.to_json
    form = regional_partner_contact.sanitize_and_trim_form_data_hash
    mail = Pd::RegionalPartnerContactMailer.unmatched(form, 'nimisha@code.org')

    assert links_are_complete_urls?(mail)
  end
end

require 'test_helper'
require 'testing/poste_assertions'

class RegionalPartnerContactMailerTest < ActionMailer::TestCase
  include PosteAssertions

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
    school_zipcode: '45242',
    opt_in: 'Yes',
    notes: 'I have a question about teaching computer science.'
  }

  test 'matched links are valid urls' do
    regional_partner_contact = create :pd_regional_partner_contact, form_data: FORM_DATA.to_json
    form = regional_partner_contact.sanitize_and_trim_form_data_hash
    rp_pm = create :regional_partner_program_manager
    mail = Pd::RegionalPartnerContactMailer.matched(form, rp_pm)

    assert links_are_complete_urls?(mail)
    assert_sendable mail
  end

  # TODO: When cc is suported, remove email from unmatched
  test 'unmatched links are valid urls' do
    regional_partner_contact = create :pd_regional_partner_contact, form_data: FORM_DATA.to_json
    form = regional_partner_contact.sanitize_and_trim_form_data_hash
    mail = Pd::RegionalPartnerContactMailer.unmatched(form, 'nimisha@code.org')

    assert links_are_complete_urls?(mail)
    assert_sendable mail
  end

  test 'matched receipt links are valid urls' do
    regional_partner_contact = create :pd_regional_partner_contact, form_data: FORM_DATA.to_json
    form = regional_partner_contact.sanitize_and_trim_form_data_hash
    mail = Pd::RegionalPartnerContactMailer.receipt(form, regional_partner_contact.regional_partner)

    assert links_are_complete_urls?(mail)
    assert_sendable mail
  end

  test 'unmatched receipt links are valid urls' do
    regional_partner_contact = create :pd_regional_partner_contact, form_data: FORM_DATA.to_json
    form = regional_partner_contact.sanitize_and_trim_form_data_hash
    mail = Pd::RegionalPartnerContactMailer.receipt(form, nil)

    assert links_are_complete_urls?(mail)
    assert_sendable mail
  end
end

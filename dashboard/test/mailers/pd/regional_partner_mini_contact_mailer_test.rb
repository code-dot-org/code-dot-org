require 'test_helper'
require 'testing/poste_assertions'

class RegionalPartnerMiniContactMailerTest < ActionMailer::TestCase
  include PosteAssertions

  test 'matched links are valid urls' do
    regional_partner = build :regional_partner
    regional_partner_mini_contact = build :pd_regional_partner_mini_contact, regional_partner: regional_partner
    form = regional_partner_mini_contact.sanitize_and_trim_form_data_hash
    rp_pm = build :regional_partner_program_manager
    mail = Pd::RegionalPartnerMiniContactMailer.matched(form, rp_pm)

    assert links_are_complete_urls?(mail)
    assert_sendable mail
  end

  # TODO: When cc is suported, remove email from unmatched
  test 'unmatched links are valid urls' do
    regional_partner_mini_contact = build :pd_regional_partner_mini_contact
    form = regional_partner_mini_contact.sanitize_and_trim_form_data_hash
    mail = Pd::RegionalPartnerMiniContactMailer.unmatched(form, 'nimisha@code.org')

    assert links_are_complete_urls?(mail)
    assert_sendable mail
  end

  test 'matched receipt links are valid urls' do
    regional_partner = build :regional_partner
    regional_partner_mini_contact = build :pd_regional_partner_mini_contact, regional_partner: regional_partner
    form = regional_partner_mini_contact.sanitize_and_trim_form_data_hash
    mail = Pd::RegionalPartnerMiniContactMailer.receipt(form, regional_partner_mini_contact.regional_partner)

    assert links_are_complete_urls?(mail)
    assert_sendable mail
  end

  test 'unmatched receipt links are valid urls' do
    regional_partner_mini_contact = build :pd_regional_partner_mini_contact
    form = regional_partner_mini_contact.sanitize_and_trim_form_data_hash
    mail = Pd::RegionalPartnerMiniContactMailer.receipt(form, nil)

    assert links_are_complete_urls?(mail)
    assert_sendable mail
  end

  test 'default bcc' do
    regional_partner = build :regional_partner
    regional_partner_mini_contact = build :pd_regional_partner_mini_contact, regional_partner: regional_partner
    form = regional_partner_mini_contact.sanitize_and_trim_form_data_hash
    rp_pm = build :regional_partner_program_manager
    mail = Pd::RegionalPartnerMiniContactMailer.matched(form, rp_pm)

    assert_equal MailerConstants::PLC_EMAIL_LOG, mail.bcc.first
  end
end

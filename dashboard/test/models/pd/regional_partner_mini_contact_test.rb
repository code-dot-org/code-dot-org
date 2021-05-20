require 'test_helper'
require 'testing/poste_assertions'

class Pd::RegionalPartnerMiniContactTest < ActiveSupport::TestCase
  include PosteAssertions

  test 'can create a new regional partner mini contact' do
    assert valid_form? build(
      :pd_regional_partner_mini_contact_hash
    )
  end

  test 'email is required' do
    refute valid_form? build(
      :pd_regional_partner_mini_contact_hash
    ).merge("email" => "")
  end

  test 'zip is required' do
    refute valid_form? build(
      :pd_regional_partner_mini_contact_hash
    ).merge("zip" => "")
  end

  test 'name is not required' do
    refute_includes Pd::RegionalPartnerMiniContact.required_fields, :name
  end

  test 'notes is not required' do
    refute_includes Pd::RegionalPartnerMiniContact.required_fields, :notes
  end

  private def valid_form?(form_data)
    build(:pd_regional_partner_mini_contact, form_data: form_data.to_json).valid?
  end

  test 'Matches regional partner' do
    # Use the same state & zip as the mini-contact factory's defaults.
    state = 'OH'
    zip = '45242'

    regional_partner = create :regional_partner, name: "partner_OH_45242"
    regional_partner.mappings.find_or_create_by!(state: state)
    regional_partner.mappings.find_or_create_by!(zip_code: zip)

    regional_partner_mini_contact = create :pd_regional_partner_mini_contact,
      form_data: build(:pd_regional_partner_mini_contact_hash).to_json

    assert_equal regional_partner.id, regional_partner_mini_contact.regional_partner_id
  end

  test 'Matches regional partner with integer zip' do
    # Use the same state & zip as the mini-contact factory's defaults.
    state = 'OH'
    zip = '45242'

    regional_partner = create :regional_partner, name: "partner_OH_45242"
    regional_partner.mappings.find_or_create_by!(state: state)
    regional_partner.mappings.find_or_create_by!(zip_code: zip)

    regional_partner_mini_contact = create :pd_regional_partner_mini_contact,
      form_data: build(:pd_regional_partner_mini_contact_hash).merge("zip" => 45242).to_json

    assert_equal regional_partner.id, regional_partner_mini_contact.regional_partner_id
  end

  test 'Matches regional partner with messy zip' do
    # Use the same state & zip as the mini-contact factory's defaults.
    state = 'OH'
    zip = '45242'

    regional_partner = create :regional_partner, name: "partner_OH_45242"
    regional_partner.mappings.find_or_create_by!(state: state)
    regional_partner.mappings.find_or_create_by!(zip_code: zip)

    regional_partner_mini_contact = create :pd_regional_partner_mini_contact,
      form_data: build(:pd_regional_partner_mini_contact_hash).merge("zip" => " \n 45242-1234 \n ").to_json

    assert_equal regional_partner.id, regional_partner_mini_contact.regional_partner_id
  end

  # If matched and regional partner has one pm, send matched email to pm
  test 'Matched with one regional partner pm' do
    regional_partner = create :regional_partner, name: "partner_OH_45242"
    regional_partner.mappings.find_or_create_by!(state: 'OH')
    regional_partner.mappings.find_or_create_by!(zip_code: '45242')

    create :regional_partner_program_manager, regional_partner: regional_partner

    create :pd_regional_partner_mini_contact, form_data: build(:pd_regional_partner_mini_contact_hash).to_json
    mail = ActionMailer::Base.deliveries.first

    assert_equal 'Question about Code.org program', mail.subject
    assert_equal ['partner@code.org'], mail.from
    assert_equal 2, ActionMailer::Base.deliveries.count
    assert_sendable mail
  end

  # If matched and regional partner with multiple pms, send matched email to all pms
  test 'Matched with two regional partner pms' do
    regional_partner = create :regional_partner, name: "partner_OH_45242"
    regional_partner.mappings.find_or_create_by!(state: 'OH')
    regional_partner.mappings.find_or_create_by!(zip_code: '45242')

    create :regional_partner_program_manager, regional_partner: regional_partner
    create :regional_partner_program_manager, regional_partner: regional_partner

    create :pd_regional_partner_mini_contact, form_data: build(:pd_regional_partner_mini_contact_hash).to_json
    mail = ActionMailer::Base.deliveries.first

    assert_equal 'Question about Code.org program', mail.subject
    assert_equal ['partner@code.org'], mail.from
    assert_equal 3, ActionMailer::Base.deliveries.count
    assert_sendable mail
  end

  # If matched but no regional partner pms, send unmatched email
  test 'Matched with zero regional partner pms' do
    regional_partner = create :regional_partner, name: "partner_OH_45242"
    regional_partner.mappings.find_or_create_by!(state: 'OH')
    regional_partner.mappings.find_or_create_by!(zip_code: '45242')

    create :pd_regional_partner_mini_contact, form_data: build(:pd_regional_partner_mini_contact_hash).to_json
    mail = ActionMailer::Base.deliveries.first

    assert_equal ['international@code.org'], mail.to
    assert_equal 'A teacher wants to connect with Code.org', mail.subject
    assert_equal ['partner@code.org'], mail.from
    assert_equal 2, ActionMailer::Base.deliveries.count
    assert_sendable mail
  end

  test 'Unmatched' do
    RegionalPartner.stubs(:find_by_zip).returns([nil, nil])
    create :pd_regional_partner_mini_contact, form_data: build(:pd_regional_partner_mini_contact_hash).to_json
    mail = ActionMailer::Base.deliveries.first

    assert_equal ['international@code.org'], mail.to
    assert_equal 'A teacher wants to connect with Code.org', mail.subject
    assert_equal ['partner@code.org'], mail.from
    assert_equal 2, ActionMailer::Base.deliveries.count
    assert_sendable mail
  end

  test 'Receipt email' do
    RegionalPartner.stubs(:find_by_zip).returns([nil, nil])
    create :pd_regional_partner_mini_contact, form_data: build(:pd_regional_partner_mini_contact_hash).to_json
    mail = ActionMailer::Base.deliveries.last

    assert_equal ['foo@bar.com'], mail.to
    assert_equal 'Thank you for contacting your Code.org Regional Partner', mail.subject
    assert_equal ['noreply@code.org'], mail.from
    assert_sendable mail
  end
end

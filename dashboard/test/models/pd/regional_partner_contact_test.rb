require 'test_helper'
require 'testing/poste_assertions'

class Pd::RegionalPartnerContactTest < ActiveSupport::TestCase
  include PosteAssertions

  test 'Test district validation' do
    contact = build :pd_regional_partner_contact, form_data: {}.to_json
    partial_form_data = build :pd_regional_partner_contact_hash
    refute contact.valid?

    refute build(:pd_regional_partner_contact, form_data: partial_form_data.to_json).valid?

    refute build(
      :pd_regional_partner_contact, form_data: partial_form_data.merge(
        {
          school_type: 'public',
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: partial_form_data.merge(
        {
          school_type: 'private',
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: partial_form_data.merge(
        {
          school_type: 'public',
          school_district_other: true
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: partial_form_data.merge(
        {
          school_type: 'public',
          school_district_other: false
        }
      ).to_json
    ).valid?

    assert build(
      :pd_regional_partner_contact, form_data: partial_form_data.merge(
        {
          school_type: 'public',
          school_district_other: true,
          school_district_name: 'District name'
        }
      ).to_json
    ).valid?

    assert build(
      :pd_regional_partner_contact, form_data: partial_form_data.merge(
        {
          school_type: 'public',
          school_district_other: false,
          school_district: 'District'
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: partial_form_data.merge(
        {
          school_type: 'private',
          school_name: 'Name'
        }
      ).to_json
    ).valid?

    assert build(
      :pd_regional_partner_contact, form_data: partial_form_data.merge(
        {
          school_type: 'private',
          school_name: 'Name',
          school_zipcode: 'Zipcode'
        }
      ).to_json
    ).valid?
  end

  test 'Matches regional partner' do
    state = 'OH'
    zip = '45242'

    regional_partner = create :regional_partner, name: "partner_OH_45242"
    regional_partner.mappings.find_or_create_by!(state: state)
    regional_partner.mappings.find_or_create_by!(zip_code: zip)

    regional_partner_contact = create :pd_regional_partner_contact,
      form_data: build(:pd_regional_partner_contact_hash).merge(
        {
          school_type: 'public',
          school_district_other: false,
          school_district: 'District',
          school_state: state,
          school_zipcode: zip
        }
      ).to_json

    assert_equal regional_partner.id, regional_partner_contact.regional_partner_id
  end

  # If matched and regional partner has one pm, send matched email to pm
  test 'Matched with one regional partner pm' do
    regional_partner = create :regional_partner, name: "partner_OH_45242"
    regional_partner.mappings.find_or_create_by!(state: 'OH')
    regional_partner.mappings.find_or_create_by!(zip_code: '45242')

    create :regional_partner_program_manager, regional_partner: regional_partner

    create :pd_regional_partner_contact, form_data: build(:pd_regional_partner_contact_hash, :matched).to_json
    mail = ActionMailer::Base.deliveries.first

    assert_equal 'A teacher and/or administrator would like to connect with you', mail.subject
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

    create :pd_regional_partner_contact, form_data: build(:pd_regional_partner_contact_hash, :matched).to_json
    mail = ActionMailer::Base.deliveries.first

    assert_equal 'A teacher and/or administrator would like to connect with you', mail.subject
    assert_equal ['partner@code.org'], mail.from
    assert_equal 3, ActionMailer::Base.deliveries.count
    assert_sendable mail
  end

  # If matched but no regional partner pms, send unmatched email
  test 'Matched with zero regional partner pms' do
    regional_partner = create :regional_partner, name: "partner_OH_45242"
    regional_partner.mappings.find_or_create_by!(state: 'OH')
    regional_partner.mappings.find_or_create_by!(zip_code: '45242')

    create :pd_regional_partner_contact, form_data: build(:pd_regional_partner_contact_hash, :matched).to_json
    mail = ActionMailer::Base.deliveries.first

    assert_equal ['anthonette@code.org'], mail.to
    assert_equal 'A school administrator wants to connect with Code.org', mail.subject
    assert_equal ['partner@code.org'], mail.from
    assert_equal 2, ActionMailer::Base.deliveries.count
    assert_sendable mail
  end

  test 'Unmatched' do
    create :pd_regional_partner_contact, form_data: build(:pd_regional_partner_contact_hash, :matched).to_json
    mail = ActionMailer::Base.deliveries.first

    assert_equal ['anthonette@code.org'], mail.to
    assert_equal 'A school administrator wants to connect with Code.org', mail.subject
    assert_equal ['partner@code.org'], mail.from
    assert_equal 2, ActionMailer::Base.deliveries.count
    assert_sendable mail
  end

  test 'Receipt email' do
    create :pd_regional_partner_contact, form_data: build(:pd_regional_partner_contact_hash, :matched).to_json
    mail = ActionMailer::Base.deliveries.last

    assert_equal ['foo@bar.com'], mail.to
    assert_equal 'Thank you for contacting your Code.org Regional Partner', mail.subject
    assert_equal ['noreply@code.org'], mail.from
    assert_sendable mail
  end

  test 'Job Title is not required' do
    refute_includes Pd::RegionalPartnerContact.required_fields, :job_title
  end

  test 'Notes is required' do
    assert_includes Pd::RegionalPartnerContact.required_fields, :notes
  end
end

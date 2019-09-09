require 'test_helper'
require 'testing/poste_assertions'

class Pd::RegionalPartnerContactTest < ActiveSupport::TestCase
  include PosteAssertions

  test 'can create a new regional partner contact with found district and no school' do
    assert valid_form? build(
      :pd_regional_partner_contact_hash,
      :found_district_only
    )
  end

  test 'school type is required' do
    refute valid_form? build(
      :pd_regional_partner_contact_hash,
      :found_district_only
    ).merge("school-type" => "")
  end

  test 'school state is required' do
    refute valid_form? build(
      :pd_regional_partner_contact_hash,
      :found_district_only
    ).merge("school-state" => "")
  end

  test 'school district is required' do
    refute valid_form? build(
      :pd_regional_partner_contact_hash,
      :found_district_only
    ).merge("school-district" => "")
  end

  test 'can create a new regional partner contact with found district and school' do
    assert valid_form? build(
      :pd_regional_partner_contact_hash,
      :found_district_and_school
    )
  end

  test 'can create a new regional partner contact with found district and other school' do
    assert valid_form? build(
      :pd_regional_partner_contact_hash,
      :found_district_other_school
    )
  end

  test 'zip code is required for found district and other school' do
    refute valid_form? build(
      :pd_regional_partner_contact_hash,
      :found_district_other_school
    ).merge("school-zipcode" => "")
  end

  test 'can create a new regional partner contact with other district and no school' do
    assert valid_form? build(
      :pd_regional_partner_contact_hash,
      :other_district_only
    )
  end

  test 'district name is required for other district' do
    refute valid_form? build(
      :pd_regional_partner_contact_hash,
      :other_district_only
    ).merge("school-district-name" => "")
  end

  test 'can create a new regional partner contact with other district and school' do
    assert valid_form? build(
      :pd_regional_partner_contact_hash,
      :other_district_and_school
    )
  end

  test 'zip code is required for other district and school' do
    refute valid_form? build(
      :pd_regional_partner_contact_hash,
      :other_district_and_school
    ).merge("school-zipcode" => "")
  end

  test 'can create a new regional partner contact with private school' do
    assert valid_form? build(
      :pd_regional_partner_contact_hash,
      :private_school
    )
  end

  test 'school name is required for private school' do
    refute valid_form? build(
      :pd_regional_partner_contact_hash,
      :private_school
    ).merge("school-name" => "")
  end

  test 'zip code is required for private school' do
    refute valid_form? build(
      :pd_regional_partner_contact_hash,
      :private_school
    ).merge("school-zipcode" => "")
  end

  private def valid_form?(form_data)
    build(:pd_regional_partner_contact, form_data: form_data.to_json).valid?
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

    assert_equal ['liz.gauthier@code.org'], mail.to
    assert_equal 'A school administrator wants to connect with Code.org', mail.subject
    assert_equal ['partner@code.org'], mail.from
    assert_equal 2, ActionMailer::Base.deliveries.count
    assert_sendable mail
  end

  test 'Unmatched' do
    create :pd_regional_partner_contact, form_data: build(:pd_regional_partner_contact_hash, :matched).to_json
    mail = ActionMailer::Base.deliveries.first

    assert_equal ['liz.gauthier@code.org'], mail.to
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

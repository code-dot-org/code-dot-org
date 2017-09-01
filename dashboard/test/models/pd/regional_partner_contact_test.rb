require 'test_helper'

class Pd::RegionalPartnerContactTest < ActiveSupport::TestCase
  test 'Test district validation' do
    contact = build :pd_regional_partner_contact, form_data: {}.to_json
    refute contact.valid?

    form_data = {
      first_name: 'firstName',
      last_name: 'lastName',
      title: 'Dr.',
      email: 'email',
      role: 'School Administrator',
      job_title: 'title',
      grade_levels: ['High School'],
      school_state: 'NY'
    }

    refute build(:pd_regional_partner_contact, form_data: form_data.to_json).valid?

    refute build(
      :pd_regional_partner_contact, form_data: form_data.merge(
        {
          school_type: 'public',
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: form_data.merge(
        {
          school_type: 'private',
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: form_data.merge(
        {
          school_type: 'public',
          school_district_other: true
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: form_data.merge(
        {
          school_type: 'public',
          school_district_other: false
        }
      ).to_json
    ).valid?

    assert build(
      :pd_regional_partner_contact, form_data: form_data.merge(
        {
          school_type: 'public',
          school_district_other: true,
          school_district_name: 'District name'
        }
      ).to_json
    ).valid?

    assert build(
      :pd_regional_partner_contact, form_data: form_data.merge(
        {
          school_type: 'public',
          school_district_other: false,
          school_district: 'District'
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: form_data.merge(
        {
          school_type: 'private',
          school_name: 'Name'
        }
      ).to_json
    ).valid?

    assert build(
      :pd_regional_partner_contact, form_data: form_data.merge(
        {
          school_type: 'private',
          school_name: 'Name',
          school_zipcode: 'Zipcode'
        }
      ).to_json
    ).valid?
  end
end

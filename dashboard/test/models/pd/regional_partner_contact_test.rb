require 'test_helper'

class Pd::RegionalPartnerContactTest < ActiveSupport::TestCase
  FORM_DATA = {
    first_name: 'firstName',
    last_name: 'lastName',
    title: 'Dr.',
    email: 'email',
    role: 'School Administrator',
    job_title: 'title',
    grade_levels: ['High School'],
    school_state: 'NY'
  }

  test 'Test district validation' do
    contact = build :pd_regional_partner_contact, form_data: {}.to_json
    refute contact.valid?

    refute build(:pd_regional_partner_contact, form_data: FORM_DATA.to_json).valid?

    refute build(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'public',
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'private',
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'public',
          school_district_other: true
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'public',
          school_district_other: false
        }
      ).to_json
    ).valid?

    assert build(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'public',
          school_district_other: true,
          school_district_name: 'District name'
        }
      ).to_json
    ).valid?

    assert build(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'public',
          school_district_other: false,
          school_district: 'District'
        }
      ).to_json
    ).valid?

    refute build(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'private',
          school_name: 'Name'
        }
      ).to_json
    ).valid?

    assert build(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'private',
          school_name: 'Name',
          school_zipcode: 'Zipcode'
        }
      ).to_json
    ).valid?
  end

  test 'Updates regional partner' do
    regional_partner_contact = create(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'public',
          school_district: '1200390',
          grade_levels: ['High School']
        }
      ).to_json
    )

    assert_equal 'A+ College Ready', regional_partner_contact.regional_partner.name

    regional_partner_contact = create(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'public',
          school_district: '1200390',
          grade_levels: ['Middle School']
        }
      ).to_json
    )

    assert_equal 'Academy for CS Education - Florida International University', regional_partner_contact.regional_partner.name

    regional_partner_contact = create(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'public',
          school_district: '1200390',
          grade_levels: ['Elementary School']
        }
      ).to_json
    )

    assert_nil regional_partner_contact.regional_partner

    regional_partner_contact = create(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'public',
          school_district: '4800004',
          grade_levels: ['High School']
        }
      ).to_json
    )

    assert_equal 'Center for STEM Education, The University of Texas at Austin', regional_partner_contact.regional_partner.name

    regional_partner_contact = create(
      :pd_regional_partner_contact, form_data: FORM_DATA.merge(
        {
          school_type: 'public',
          school_district: '100005',
          grade_levels: ['Elementary School']
        }
      ).to_json
    )

    assert_nil regional_partner_contact.regional_partner
  end
end

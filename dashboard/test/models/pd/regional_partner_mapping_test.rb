require 'test_helper'

class Pd::RegionalPartnerMappingTest < ActiveSupport::TestCase
  test 'state must be in list' do
    mapping = build :pd_regional_partner_mapping, state: 'invalid'
    refute mapping.valid?
    assert_equal ['State is not included in the list'], mapping.errors.full_messages
  end

  test 'zip code must be a valid format' do
    mapping = build :pd_regional_partner_mapping, zip_code: 'invalid', state: nil
    refute mapping.valid?
    assert_equal ['Zip code is invalid'], mapping.errors.full_messages
  end

  test 'either zip code or state must be present but not both' do
    mapping = create :pd_regional_partner_mapping

    # 1st column - zip_code
    # 2nd column - state
    # 3rd column - validity of model based on combination of zip_code and state
    zip_code_state_combinations = [
      [nil, nil, false],
      [nil, '', false],
      [nil, 'WA', true],
      ['', 'WA', true],
      ['', nil, false],
      ['98101', nil, true],
      ['98101', '', true]
    ]
    zip_code_state_combinations.each do |zip_code, state, valid|
      mapping.assign_attributes(zip_code: zip_code, state: state)
      assert_equal mapping.valid?, valid
    end
  end

  test 'zip codes and states must be unique per mapping' do
    mapping1 = build :pd_regional_partner_mapping, zip_code: '98143', state: nil
    assert mapping1.valid?
    mapping1.save

    mapping2 = build :pd_regional_partner_mapping, zip_code: '98143', state: nil
    refute mapping2.valid?
    assert_equal ['This region belongs to another partner'], mapping2.errors.full_messages
  end
end

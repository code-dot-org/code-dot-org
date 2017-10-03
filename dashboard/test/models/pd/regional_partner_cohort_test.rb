require 'test_helper'

class Pd::RegionalPartnerCohortTest < ActiveSupport::TestCase
  test 'course is required' do
    cohort = Pd::RegionalPartnerCohort.new
    refute cohort.valid?
    assert_equal ['Course is required'], cohort.errors.full_messages
  end

  test 'course is included in the allowed list' do
    cohort = Pd::RegionalPartnerCohort.new course: Pd::Workshop::COURSE_CSF
    refute cohort.valid?
    assert_equal ['Course is not included in the list'], cohort.errors.full_messages

    cohort.course = Pd::Workshop::COURSE_CSP
    assert cohort.valid?
  end

  test 'year format validation' do
    invalid = [
      'xyz',
      '123-456',
      '2016 - 2017',
      ' 2016-2017 ',
      '2016-17'
    ]

    valid = [
      '2016-2017'
    ]

    cohort = build :pd_regional_partner_cohort, year: '123-456'
    invalid.each do |invalid_year|
      cohort.year = invalid_year
      refute cohort.valid?
      assert_equal ['Year is invalid'], cohort.errors.full_messages
    end

    valid.each do |valid_year|
      cohort.year = valid_year
      assert cohort.valid?
    end
  end

  test 'size validation' do
    cohort = build :pd_regional_partner_cohort, size: nil
    assert cohort.valid?

    cohort.size = 0
    refute cohort.valid?
    assert_equal ['Size must be greater than 0'], cohort.errors.full_messages

    cohort.size = 10000
    refute cohort.valid?
    assert_equal ['Size must be less than 10000'], cohort.errors.full_messages

    cohort.size = 'x'
    refute cohort.valid?
    assert_equal ['Size is not a number'], cohort.errors.full_messages

    cohort.size = 500
    assert cohort.valid?
  end

  test 'role validation' do
    cohort = build :pd_regional_partner_cohort, role: nil
    assert cohort.valid?
    refute cohort.teacher?
    refute cohort.facilitator?

    cohort.role = :teacher
    assert cohort.valid?
    assert cohort.teacher?
    refute cohort.facilitator?

    cohort.role = :facilitator
    assert cohort.valid?
    assert cohort.facilitator?
    refute cohort.teacher?

    assert_raises ArgumentError do
      cohort.role = :invalid
    end
  end

  test 'partner association' do
    regional_partner = create :regional_partner
    cohort = create :pd_regional_partner_cohort, regional_partner: regional_partner
    assert_equal regional_partner, cohort.reload.regional_partner
  end

  test 'members' do
    cohort = create :pd_regional_partner_cohort
    5.times do
      cohort.members << create(:teacher)
    end

    assert_equal 5, cohort.reload.members.count
    assert_equal 5, cohort.reload.users.count
  end
end

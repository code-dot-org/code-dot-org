# -*- coding: utf-8 -*-
require 'test_helper'

class CircuitPlaygroundDiscountApplicationTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @csd_cohort = create :cohort, name: 'CSD-TeacherConPhiladelphia'
    @other_cohort = create :cohort
  end

  test 'eligible_unit_6_intention?' do
    teacher = create :teacher
    application = CircuitPlaygroundDiscountApplication.create!(user_id: teacher.id, unit_6_intention: 'no')
    refute application.eligible_unit_6_intention?
    application.destroy

    application = CircuitPlaygroundDiscountApplication.create!(user_id: teacher.id, unit_6_intention: 'yes1718')
    assert application.eligible_unit_6_intention?
    application.destroy

    application = CircuitPlaygroundDiscountApplication.create!(user_id: teacher.id, unit_6_intention: 'yes1819')
    assert application.eligible_unit_6_intention?
    application.destroy

    application = CircuitPlaygroundDiscountApplication.create!(user_id: teacher.id, unit_6_intention: 'yesAfter')
    refute application.eligible_unit_6_intention?
    application.destroy

    application = CircuitPlaygroundDiscountApplication.create!(user_id: teacher.id, unit_6_intention: 'unsure')
    refute application.eligible_unit_6_intention?
    application.destroy
  end

  test 'find_by_studio_person_id' do
    user1 = create :teacher
    user2 = create :teacher, studio_person_id: user1.studio_person_id

    CircuitPlaygroundDiscountApplication.create!(user_id: user1.id, unit_6_intention: 'unsure')

    app1 = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(user1.studio_person_id)
    app2 = CircuitPlaygroundDiscountApplication.find_by_studio_person_id(user2.studio_person_id)
    assert_equal app1, app2
    assert_equal 'unsure', app1.unit_6_intention
  end

  test 'studio_person_pd_eligible? returns true if attended a CSD TeacherCon' do
    teacher = create :teacher
    @csd_cohort.teachers << teacher
    assert_equal true, CircuitPlaygroundDiscountApplication.studio_person_pd_eligible?(teacher)
  end

  test 'studio_person_pd_eligible? returns false if a member of other cohorts, not CSD' do
    teacher = create :teacher
    @other_cohort.teachers << teacher
    assert_equal false, CircuitPlaygroundDiscountApplication.studio_person_pd_eligible?(teacher)
  end

  test 'studio_person_pd_eligible? returns true if a CSD facilitator' do
    course_facilitator = create :pd_course_facilitator, course: Pd::Workshop::COURSE_CSD
    user = course_facilitator.facilitator
    assert_equal true, CircuitPlaygroundDiscountApplication.studio_person_pd_eligible?(user)
  end

  test 'studio_person_pd_eligible? returns false if a non-CSD facilitator' do
    course_facilitator = create :pd_course_facilitator, course: Pd::Workshop::COURSE_CSP
    user = course_facilitator.facilitator
    assert_equal false, CircuitPlaygroundDiscountApplication.studio_person_pd_eligible?(user)
  end

  test 'studio_person_pd_eligible? returns true if studio_person_id associated User is eligible' do
    user1 = create :teacher
    user2 = create :teacher, studio_person_id: user1.studio_person_id

    @csd_cohort.teachers << user1
    assert_equal true, CircuitPlaygroundDiscountApplication.user_pd_eligible?(user1)
    assert_equal false, CircuitPlaygroundDiscountApplication.user_pd_eligible?(user2)

    assert_equal true, CircuitPlaygroundDiscountApplication.studio_person_pd_eligible?(user1)
    assert_equal true, CircuitPlaygroundDiscountApplication.studio_person_pd_eligible?(user2)
  end

  test 'application_status for unstarted application' do
    teacher = create :teacher

    CircuitPlaygroundDiscountApplication.stubs(:studio_person_pd_eligible?).returns(true)
    CircuitPlaygroundDiscountApplication.stubs(:student_progress_eligible?).returns(false)

    expected = {
      unit_6_intention: nil,
      has_confirmed_school: false,
      gets_full_discount: nil,
      discount_code: nil,
      is_pd_eligible: true,
      is_progress_eligible: false,
    }
    assert_equal expected, CircuitPlaygroundDiscountApplication.application_status(teacher)
  end

  test 'application_status for existing application' do
    teacher = create :teacher
    create :circuit_playground_discount_application, user: teacher, unit_6_intention: 'no'

    expected = {
      unit_6_intention: 'no',
      has_confirmed_school: false,
      gets_full_discount: nil,
      discount_code: nil,
      is_pd_eligible: true,
      is_progress_eligible: true,
    }
    assert_equal expected, CircuitPlaygroundDiscountApplication.application_status(teacher)
  end
end

require 'test_helper'

module Pd::Payment
  class PaymentFactoryTest < ActiveSupport::TestCase
    test 'district payment' do
      workshop_cs_in_a = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_DISTRICT,
        course: Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2

      workshop_cs_in_s = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_DISTRICT,
        course: Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_2

      assert_kind_of DistrictPay, PaymentFactory.get_payment(workshop_cs_in_a)
      assert_kind_of DistrictPay, PaymentFactory.get_payment(workshop_cs_in_s)
    end

    test 'CSF payment' do
      workshop_csf_public = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, workshop_type: Pd::Workshop::TYPE_PUBLIC
      workshop_csf_private = create :pd_ended_workshop, course: Pd::Workshop::COURSE_CSF, workshop_type: Pd::Workshop::TYPE_PRIVATE

      assert_kind_of CSFPay, PaymentFactory.get_payment(workshop_csf_public)
      assert_kind_of CSFPay, PaymentFactory.get_payment(workshop_csf_private)
    end

    test 'standard payment' do
      # Mix of public and private types
      workshop_ecs = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PRIVATE,
        course: Pd::Workshop::COURSE_ECS, subject: Pd::Workshop::SUBJECT_ECS_PHASE_2

      workshop_csp = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_WORKSHOP_1

      workshop_cs_in_a = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PRIVATE,
        course: Pd::Workshop::COURSE_CS_IN_A, subject: Pd::Workshop::SUBJECT_CS_IN_A_PHASE_2

      workshop_cs_in_s = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_CS_IN_S, subject: Pd::Workshop::SUBJECT_CS_IN_S_PHASE_2

      assert_kind_of StandardPay, PaymentFactory.get_payment(workshop_ecs)
      assert_kind_of StandardPay, PaymentFactory.get_payment(workshop_csp)
      assert_kind_of StandardPay, PaymentFactory.get_payment(workshop_cs_in_a)
      assert_kind_of StandardPay, PaymentFactory.get_payment(workshop_cs_in_s)
    end

    test 'no payment' do
      workshop_district_wrong_type = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_DISTRICT,
        course: Pd::Workshop::COURSE_CSF

      workshop_csd = create :pd_ended_workshop, workshop_type: Pd::Workshop::TYPE_PUBLIC,
        course: Pd::Workshop::COURSE_CSD

      assert_nil PaymentFactory.get_payment(workshop_district_wrong_type)
      assert_nil PaymentFactory.get_payment(workshop_csd)
    end

    test 'no workshop' do
      e = assert_raises RuntimeError do
        PaymentFactory.get_payment(nil)
      end

      assert_equal 'Workshop required.', e.message
    end
  end
end

# -*- coding: utf-8 -*-
require 'test_helper'

class CircuitPlaygroundDiscountApplicationTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  test 'claiming codes' do
    # Create 3 full codes, 3 partial codes
    3.times do |i|
      CircuitPlaygroundDiscountCode.create(
        code: "TEST0_#{i}",
        full_discount: true,
        expiration: Time.now + 30.days
      )
      CircuitPlaygroundDiscountCode.create(
        code: "TEST100_#{i}",
        full_discount: false,
        expiration: Time.now + 30.days
      )
    end

    assert_equal 3, CircuitPlaygroundDiscountCode.where({full_discount: true, claimed_at: nil}).count
    assert_equal 3, CircuitPlaygroundDiscountCode.where({full_discount: false, claimed_at: nil}).count

    # claim full discount code
    code = CircuitPlaygroundDiscountCode.claim(true)
    assert_match /TEST0/, code.code
    refute_nil code.claimed_at

    assert_equal 2, CircuitPlaygroundDiscountCode.where({full_discount: true, claimed_at: nil}).count
    assert_equal 3, CircuitPlaygroundDiscountCode.where({full_discount: false, claimed_at: nil}).count

    # claim partial discount code
    code = CircuitPlaygroundDiscountCode.claim(false)
    assert_match /TEST100/, code.code
    refute_nil code.claimed_at

    assert_equal 2, CircuitPlaygroundDiscountCode.where({full_discount: true, claimed_at: nil}).count
    assert_equal 2, CircuitPlaygroundDiscountCode.where({full_discount: false, claimed_at: nil}).count
  end

  test 'does not claim expired codes' do
    CircuitPlaygroundDiscountCode.create(
      code: "TEST0_asdf",
      full_discount: true,
      expiration: Time.now - 30.days
    )

    code = CircuitPlaygroundDiscountCode.claim(true)
    assert_nil code
  end

  test 'does not claim voided codes' do
    CircuitPlaygroundDiscountCode.create(
      code: "TEST0_asdf",
      full_discount: true,
      expiration: Time.now + 30.days,
      voided_at: Time.now - 1.day
    )

    code = CircuitPlaygroundDiscountCode.claim(true)
    assert_nil code
  end
end

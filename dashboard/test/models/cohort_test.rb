require 'test_helper'

class CohortTest < ActiveSupport::TestCase
  test "has many districts" do
    d1 = create :district
    d2 = create :district

    c = create :cohort, name: 'C1'

    # ugggh creating too much stuff in fixtures makes tests really fragile
    CohortsDistrict.destroy_all

    CohortsDistrict.create!(cohort_id: c.id, district_id: d1.id, max_teachers: 6)
    CohortsDistrict.create!(cohort_id: c.id, district_id: d2.id, max_teachers: 10)

    c = c.reload
    assert_equal [6, 10], c.cohorts_districts.collect(&:max_teachers)
    assert_equal [d1, d2], c.districts
  end

  test "has a script" do
    c = create :cohort

    assert_equal nil, c.script

    c.script = Script.find_by_name('ECSPD')

    c.save!
    c.reload

    assert_equal Script.find_by_name('ECSPD'), c.script
  end

  test "changing script assigns teachers" do
    c = create :cohort
    c.teachers << create(:teacher)
    c.teachers << create(:teacher)
    c.save!

    assert_difference('UserScript.count', 2) do
      c.script = Script.find_by_name('ECSPD')
      c.save!
    end

    c.reload

    # changing script creates userscripts and sends email
    assert_difference('UserScript.count', 2) do
      assert_difference('ActionMailer::Base.deliveries.count', 2) do
        c.script = Script.find_by_name('algebraPD')
        c.save!
      end
    end

    c.reload

    # not changing scripts does not create userscripts and does not send email
    assert_does_not_create(UserScript) do
      c.script = Script.find_by_name('algebraPD')
      c.save!
    end

    # adding a teacher creates userscript and sends email
    assert_creates(UserScript) do
      c.teachers << create(:teacher)
      c.save!
    end
  end
end

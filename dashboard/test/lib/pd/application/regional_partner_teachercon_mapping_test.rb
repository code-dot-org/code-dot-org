require 'test_helper'
require 'pd/application/regional_partner_teachercon_mapping'

module Pd::Application
  class RegionalPartnerTeacherconMappingTest < ActiveSupport::TestCase
    include RegionalPartnerTeacherconMapping

    test 'get_matching_teachercon' do
      assert_nil get_matching_teachercon(nil)

      assert_nil get_matching_teachercon(build(:regional_partner))

      assert_equal TC_PHOENIX, get_matching_teachercon(
        build(:regional_partner, name: 'Allegheny Intermediate Unit 3')
      )

      assert_equal TC_ATLANTA, get_matching_teachercon(
        build(:regional_partner, name: 'Mississippi State University')
      )
    end
  end
end

require 'test_helper'
require 'pd/application/regional_partner_teachercon_mapping'

module Pd::Application
  class RegionalPartnerTeacherconMappingTest < ActiveSupport::TestCase
    include RegionalPartnerTeacherconMapping

    test 'get_matching_teachercon' do
      assert_nil get_matching_teachercon(nil)

      assert_nil get_matching_teachercon(build(:regional_partner))

      assert_nil get_matching_teachercon(
        build(:regional_partner, name: 'Allegheny Intermediate Unit 3')
      )

      assert_nil get_matching_teachercon(
        build(:regional_partner, name: 'Mississippi State University')
      )
    end

    test 'find_teachercon_workshop' do
      Pd::Workshop.any_instance.stubs(:process_location)

      create :workshop, course: Pd::Workshop::COURSE_CSD,
        subject: Pd::Workshop::SUBJECT_TEACHER_CON, location_address: 'Some place in Phoenix, AZ',
        num_sessions: 5, sessions_from: Time.new(2018, 7, 22, 9)

      create :workshop, course: Pd::Workshop::COURSE_CSP,
        subject: Pd::Workshop::SUBJECT_TEACHER_CON, location_address: 'Some place in Phoenix, AZ',
        num_sessions: 5, sessions_from: Time.new(2018, 7, 22, 9)

      create :workshop, course: Pd::Workshop::COURSE_CSD,
        subject: Pd::Workshop::SUBJECT_TEACHER_CON, location_address: 'Some place in Atlanta, GA',
        num_sessions: 5, sessions_from: Time.new(2018, 7, 22, 9)

      create :workshop, course: Pd::Workshop::COURSE_CSP,
        subject: Pd::Workshop::SUBJECT_TEACHER_CON, location_address: 'Some place in Atlanta, GA',
        num_sessions: 5, sessions_from: Time.new(2018, 7, 22, 9)

      # Last year, same city
      create :workshop, course: Pd::Workshop::COURSE_CSD,
        subject: Pd::Workshop::SUBJECT_TEACHER_CON, location_address: 'Some place in Phoenix, AZ',
        num_sessions: 5, sessions_from: Time.new(2017, 7, 22, 9)

      create :workshop, course: Pd::Workshop::COURSE_CSP,
        subject: Pd::Workshop::SUBJECT_TEACHER_CON, location_address: 'Some place in Phoenix, AZ',
        num_sessions: 5, sessions_from: Time.new(2017, 7, 22, 9)

      assert_nil find_teachercon_workshop(course: Pd::Workshop::COURSE_CSD, city: 'Phoenix')
      assert_nil find_teachercon_workshop(course: Pd::Workshop::COURSE_CSP, city: 'Phoenix')
      assert_nil find_teachercon_workshop(course: Pd::Workshop::COURSE_CSD, city: 'Atlanta')
      assert_nil find_teachercon_workshop(course: Pd::Workshop::COURSE_CSP, city: 'Atlanta')
    end
  end
end

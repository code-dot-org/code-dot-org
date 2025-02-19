#!/usr/bin/env ruby

require_relative '../oneoff/convert_standalone_courses'
require_relative '../../dashboard/config/environment'
require_relative 'test_helper'
include FactoryBot::Syntax::Methods

# This script is used to test the conversion of standalone courses to UnitGroups.

describe 'convert_standalone_course' do
  it 'should convert a specified standalone course' do
    # Create standalone unit and its course offering and version
    course_offering = create :course_offering
    standalone_unit = create :standalone_unit
    course_version = create :course_version, course_offering: course_offering, content_root: standalone_unit

    assert convert_standalone_course(standalone_unit.name)

    # Clean up
    CourseVersion.destroy(course_version.id)
    Unit.destroy(standalone_unit.id)
    CourseOffering.destroy(course_offering.id)
    UnitGroup.find_by_name(standalone_unit.name).destroy
  end
end

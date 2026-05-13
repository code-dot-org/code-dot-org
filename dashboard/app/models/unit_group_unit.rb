# == Schema Information
#
# Table name: course_scripts
#
#  id          :integer          not null, primary key
#  course_id   :integer          not null
#  script_id   :integer          not null
#  position    :integer          not null
#  unit_prefix :string(255)
#
# Indexes
#
#  index_course_scripts_on_course_id  (course_id)
#  index_course_scripts_on_script_id  (script_id)
#

class UnitGroupUnit < ApplicationRecord
  self.table_name = 'course_scripts'

  belongs_to :unit_group, foreign_key: 'course_id', optional: true
  belongs_to :script, class_name: 'Unit', optional: true

  after_destroy_commit :update_course_json

  def update_course_json
    UnitGroup.find_by(id: course_id)&.write_serialization
  end

  # Finds a UnitGroupUnit for the given parameters and caches the result. Future
  # calls will use the cache if caching is enabled.
  # If caching is disabled, then the database is queried every time.
  #
  # @param course_id [Integer] the ID of the course to fetch the data for
  # @param unit_position [Integer, String] the position of the unit in the course to fetch the data for
  # @return [UnitGroupUnit] the data corresponding to the given course ID and unit position, either
  #         retrieved directly or from the cache.
  def self.get_with_position_from_cache(course_id, unit_position)
    unit_position = unit_position.to_i if unit_position
    course = UnitGroup.get_from_cache(course_id)
    course.default_unit_group_units.find do |ugu|
      ugu.position == unit_position
    end
  end

  def cached_unit_group
    UnitGroup.get_from_cache(course_id)
  end
end

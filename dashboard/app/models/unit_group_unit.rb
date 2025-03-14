# == Schema Information
#
# Table name: course_scripts
#
#  id        :integer          not null, primary key
#  course_id :integer          not null
#  script_id :integer          not null
#  position  :integer          not null
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

  # Caching is disabled when editing in LevelBuilder mode or automated tests
  # are running.
  # Caching can also be disabled by configuring `cache_classes` to `false`
  def self.should_cache?
    return false if Rails.application.config.levelbuilder_mode
    return false unless Rails.application.config.cache_classes
    return false if ENV['UNIT_TEST'] || ENV['CI']
    true
  end

  # Finds a UnitGroupUnit for the given parameters and caches the result. Future
  # calls will use the cache if caching is enabled.
  # If caching is disabled, then the database is queried every time.
  #
  # @param course_id [Integer] the ID of the course to fetch the data for
  # @param unit_position [Integer] the position of the unit in the course to fetch the data for
  # @return [UnitGroupUnit] the data corresponding to the given course ID and unit position, either
  #         retrieved directly or from the cache.
  def self.get_with_position_from_cache(course_id, unit_position)
    if should_cache?
      cache_key = "#{self.class.name}/course_id/#{course_id}/position/#{unit_position}"
      Rails.cache.fetch(cache_key) do
        get_with_position_without_cache(course_id, unit_position)
      end
    else
      get_with_position_without_cache(course_id, unit_position)
    end
  end

  def self.get_with_position_without_cache(course_id, unit_position)
    UnitGroupUnit.find_by(course_id: course_id, position: unit_position)
  end

  # Finds a UnitGroupUnit for the given parameters and caches the result. Future
  # calls will use the cache if caching is enabled.
  # If caching is disabled, then the database is queried every time.
  #
  # @param [Integer, String] unit_id the Unit the UnitGroupUnits are associated with.
  # @return [Array<UnitGroupUnit>] the UnitGroupUnits the given Unit is in.
  def self.get_with_unit_from_cache(unit_id)
    if should_cache?
      cache_key = "#{self.class.name}/unit_id/#{unit_id}"
      Rails.cache.fetch(cache_key) do
        get_with_unit_without_cache(unit_id)
      end
    else
      get_with_unit_without_cache(unit_id)
    end
  end

  def self.get_with_unit_without_cache(unit_id)
    UnitGroupUnit.where(script_id: unit_id)
  end
end

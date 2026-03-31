#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

REGULAR_ICONS = {
  'arrow-circle-o-left'  => 'circle-arrow-left',
  'arrow-circle-o-right' => 'circle-arrow-right',
  'check-square-o'       => 'square-check',
  'circle-o'             => 'circle',
  'circle-thin'          => 'circle',
  'clock-o'              => 'clock',
  'file-pdf-o'           => 'file-pdf',
  'file-text-o'          => 'file-lines',
  'lightbulb-o'          => 'lightbulb',
  'pencil-square-o'      => 'pen-to-square',
  'picture-o'            => 'image',
  'square-o'             => 'square',
  'thumbs-o-down'        => 'thumbs-down',
  'thumbs-o-up'          => 'thumbs-up',
  'trash-o'              => 'trash-can',
}.freeze

# Icons that changed from "fa fa-{name}" to "fa-solid fa-{v7name}"
SOLID_ICONS = {
  'angle-double-left'    => 'angles-left',
  'angle-double-right'   => 'angles-right',
  'arrows-alt'           => 'up-down-left-right',
  'arrows-v'             => 'up-down',
  'bar-chart'            => 'chart-bar',
  'chevron-circle-right' => 'circle-chevron-right',
  'close'                => 'xmark',
  'cog'                  => 'gear',
  'edit'                 => 'pen-to-square',
  'ellipsis-h'           => 'ellipsis',
  'ellipsis-v'           => 'ellipsis-vertical',
  'exclamation-circle'   => 'circle-exclamation',
  'exclamation-triangle' => 'triangle-exclamation',
  'external-link'        => 'arrow-up-right-from-square',
  'external-link-square' => 'square-arrow-up-right',
  'fast-backward'        => 'backward-fast',
  'file-text'            => 'file-lines',
  'info-circle'          => 'circle-info',
  'list-alt'             => 'rectangle-list',
  'minus-square'         => 'square-minus',
  'mobile'               => 'mobile-screen-button',
  'mouse-pointer'        => 'arrow-pointer',
  'plus-circle'          => 'circle-plus',
  'plus-square'          => 'square-plus',
  'question-circle'      => 'circle-question',
  'refresh'              => 'arrows-rotate',
  'repeat'               => 'rotate-right',
  'search'               => 'magnifying-glass',
  'search-minus'         => 'magnifying-glass-minus',
  'sign-out'             => 'right-from-bracket',
  'times'                => 'xmark',
  'times-circle'         => 'circle-xmark',
  'undo'                 => 'rotate-left',
  'video-camera'         => 'video',
  'volume-off'           => 'volume-xmark',
  'warning'              => 'triangle-exclamation',
}.freeze

# Icons that changed from "fa fa-{name}" to "fa-brands fa-{v7name}"
BRAND_ICONS = {
  'facebook' => 'facebook-f',
  'twitter'  => 'x-twitter',
}.freeze

# Canonical v4 names for reverse mapping when multiple v4 names mapped
# to the same v7 name (e.g., both "close" and "times" became "xmark").
REVERSE_CANONICAL = {
  'xmark' => 'times',
  'triangle-exclamation' => 'exclamation-triangle',
  'circle' => 'circle-o',
}.freeze

@pairs = {}

REGULAR_ICONS.each {|v4, v7| @pairs["fa fa-#{v4}"] = "fa-regular fa-#{v7}"}
SOLID_ICONS.each {|v4, v7| @pairs["fa fa-#{v4}"] = "fa-solid fa-#{v7}"}
BRAND_ICONS.each {|v4, v7| @pairs["fa fa-#{v4}"] = "fa-brands fa-#{v7}"}

# Sort by longest match first to avoid partial replacements
@pairs.to_a.sort_by {|old_str, _| -old_str.length}

# Duplicates the given string, updates it, and returns the duplicated string
# This function should not have any side effects
def updated_string(str)
  new_str = str.dup
  return new_str if new_str.blank?

  @pairs.each do |old_icon, new_icon|
    new_str.gsub!(old_icon, new_icon)
  end

  # Then, catch-all: convert any remaining "fa fa-X" to "fa-solid fa-X"
  # (icons whose names didn't change, just the prefix style)
  new_str.gsub!(/\bfa fa-/, 'fa-solid fa-')

  new_str
end

CourseVersion.where(key: '2025').each do |course_version|
  unit_group = course_version.content_root
  units = unit_group.default_units

  units.each do |unit|
    changed = false

    unit.lessons.each do |lesson|
      lesson.overview = updated_string(lesson.overview)
      lesson.student_overview = updated_string(lesson.student_overview)
      lesson.background = updated_string(lesson.background)
      lesson.purpose = updated_string(lesson.purpose)
      lesson.preparation = updated_string(lesson.preparation)

      if lesson.changed?
        lesson.save!
        changed = true
      end

      lesson.activity_sections.each do |activity_section|
        activity_section.description = updated_string(activity_section.description)

        unless activity_section.tips.nil?
          tips = []
          activity_section.tips.each do |tip|
            new_tip = tip.dup
            new_tip['markdown'] = updated_string(tip['markdown'])
            tips << new_tip
          end
          activity_section.tips = tips
        end
        if activity_section.changed?
          activity_section.save!
          changed = true
        end
      end
    end

    if changed
      unit.write_script_json
      puts "Updating script_json of #{unit.name}"
    end
  end
end

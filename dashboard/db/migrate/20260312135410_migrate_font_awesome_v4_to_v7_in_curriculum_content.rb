# frozen_string_literal: true

class MigrateFontAwesomeV4ToV7InCurriculumContent < ActiveRecord::Migration[7.0]
  # Icons that changed from "fa fa-{name}-o" to "fa-regular fa-{v7name}"
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

  # Tables and the properties fields to update in each
  TABLES_AND_FIELDS = {
    activity_sections: %w[description tips],
    lesson_activities: %w[name duration],
    stages:            %w[overview student_overview background assessment purpose preparation announcements],
    levels:            %w[long_instructions teacher_markdown],
  }.freeze

  # Canonical v4 names for reverse mapping when multiple v4 names mapped
  # to the same v7 name (e.g., both "close" and "times" became "xmark").
  REVERSE_CANONICAL = {
    'xmark' => 'times',
    'triangle-exclamation' => 'exclamation-triangle',
    'circle' => 'circle-o',
  }.freeze

  BATCH_SIZE = 1000

  def up
    TABLES_AND_FIELDS.each do |table, fields|
      migrate_table(table, fields, forward: true)
    end
  end

  def down
    TABLES_AND_FIELDS.each do |table, fields|
      migrate_table(table, fields, forward: false)
    end
  end

  private def replacements(forward:)
    pairs = {}

    if forward
      REGULAR_ICONS.each {|v4, v7| pairs["fa fa-#{v4}"] = "fa-regular fa-#{v7}"}
      SOLID_ICONS.each {|v4, v7| pairs["fa fa-#{v4}"] = "fa-solid fa-#{v7}"}
      BRAND_ICONS.each {|v4, v7| pairs["fa fa-#{v4}"] = "fa-brands fa-#{v7}"}
    else
      REGULAR_ICONS.each do |v4, v7|
        canonical = REVERSE_CANONICAL[v7]
        next if canonical && canonical != v4
        pairs["fa-regular fa-#{v7}"] = "fa fa-#{v4}"
      end
      SOLID_ICONS.each do |v4, v7|
        canonical = REVERSE_CANONICAL[v7]
        next if canonical && canonical != v4
        pairs["fa-solid fa-#{v7}"] = "fa fa-#{v4}"
      end
      BRAND_ICONS.each do |v4, v7|
        pairs["fa-brands fa-#{v7}"] = "fa fa-#{v4}"
      end
    end

    # Sort by longest match first to avoid partial replacements
    pairs.to_a.sort_by {|old_str, _| -old_str.length}
  end

  private def migrate_table(table, fields, forward:)
    pairs = replacements(forward: forward)

    # Build WHERE clause to find rows that might contain FA references
    where_clause =
      if forward
        "properties LIKE '%fa fa-%'"
      else
        "properties LIKE '%fa-solid fa-%' OR properties LIKE '%fa-regular fa-%' OR properties LIKE '%fa-brands fa-%'"
      end

    # Collect all matching IDs first, then process in batches.
    # This avoids OFFSET drift as rows are updated and no longer match.
    ids = execute("SELECT id FROM #{table} WHERE #{where_clause}").map {|row| row[0]}
    say "#{table}: #{ids.size} rows to process"
    return if ids.empty?

    updated_count = 0

    ids.each_slice(BATCH_SIZE) do |batch_ids|
      rows = execute("SELECT id, properties FROM #{table} WHERE id IN (#{batch_ids.join(',')})")

      rows.each do |row|
        id = row[0]
        properties_json = row[1]
        next if properties_json.blank?

        begin
          properties = JSON.parse(properties_json)
        rescue JSON::ParserError
          next
        end

        changed = false
        fields.each do |field|
          value = properties[field]
          next unless value.is_a?(String)

          new_value = value.dup
          # First, apply specific icon renames
          pairs.each do |old_str, new_str|
            new_value.gsub!(old_str, new_str)
          end
          # Then, catch-all: convert any remaining "fa fa-X" to "fa-solid fa-X"
          # (icons whose names didn't change, just the prefix style)
          if forward
            new_value.gsub!(/\bfa fa-/, 'fa-solid fa-')
          else
            new_value.gsub!(/\bfa-solid fa-/, 'fa fa-')
          end

          if new_value != value
            properties[field] = new_value
            changed = true
          end
        end

        if changed
          escaped = ActiveRecord::Base.connection.quote(properties.to_json)
          execute("UPDATE #{table} SET properties = #{escaped} WHERE id = #{id}")
          updated_count += 1
        end
      end
    end

    say "#{table}: updated #{updated_count} rows"
  end
end

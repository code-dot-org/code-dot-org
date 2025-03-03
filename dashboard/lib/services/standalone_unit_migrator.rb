module Services
  class StandaloneUnitMigrator < Services::Base
    attr_reader :unit

    def initialize(unit, verbose: false, log_file: nil)
      @unit = unit
      @verbose = verbose
      @logger = log_file ? Logger.new(log_file) : Logger.new($stdout)
    end

    def call
      unless ENV['MIGRATE_STANDALONE_UNITS']
        log "MIGRATE_STANDALONE_UNITS is not set", type: "error"
        return false
      end

      unit_copy = @unit.dup
      log_initial_info if @verbose
      i18n_params = set_i18n_params

      create_new_unit_group
      if @unit_group.errors.present?
        log "Migration failed for #{@unit.name}: #{@unit_group.errors.full_messages.join(', ')}", type: "error"
        return false
      end

      # Get existing Unit's course version
      course_version = @unit.course_version
      if course_version.nil?
        log "Existing Unit's course version not found: #{@unit.name}", type: "error"
        @unit_group.destroy!
        return false
      end
      original_course_version_id = course_version.id

      # Point existing CourseVersion to the new UnitGroup
      course_version.update!(content_root_id: @unit_group.id, content_root_type: 'UnitGroup')
      @unit.reload
      @unit_group.reload

      # Clear "course" settings from the unit
      @unit.update!(is_course: false, version_year: nil, family_name: nil, published_state: nil, instruction_type: nil, instructor_audience: nil, participant_audience: nil)

      update_unit_group(i18n_params, unit_copy.published_state)

      update_section_assignments

      passed_checks = run_checks(course_version, unit_copy, original_course_version_id)
      rollback unless passed_checks
      passed_checks
    end

    def rollback
      unless ENV['MIGRATE_STANDALONE_UNITS']
        log "MIGRATE_STANDALONE_UNITS is not set", type: "error"
        return false
      end

      log "Rolling back migration for unit #{@unit.name}"

      @unit_group ||= @unit.unit_group
      if @unit_group.nil?
        log "Unit's unit_group not found: #{@unit.name}", type: "error"
        return false
      end

      unit_group_id = @unit_group.id
      course_version = @unit_group.course_version

      # Set sections back to their original course
      rollback_section_assignments

      # Add "course" settings back to unit
      @unit.update!(is_course: true, version_year: @unit_group.version_year, family_name: @unit_group.family_name, published_state: @unit_group.published_state, instruction_type: @unit_group.instruction_type, instructor_audience: @unit_group.instructor_audience, participant_audience: @unit_group.participant_audience)

      course_version.update!(content_root_id: @unit.id, content_root_type: 'Unit')

      # Make sure we are referencing the most recent data
      @unit_group.reload
      @unit.reload

      @unit_group.destroy!

      rollback_checks(unit_group_id)
    end

    private def log_initial_info
      log "Initial info"
      log "Existing unit: #{@unit.inspect}"
      log "Existing course_version: #{@unit.course_version.inspect}"
      log "Existing course_offering: #{@unit.course_version&.course_offering.inspect}"
    end

    private def set_i18n_params
      {
        "title" => @unit.localized_title || '',
        "description_short" => @unit.summarize_i18n_for_edit[:descriptionShort] || '',
        "description_student" => @unit.localized_student_description || '',
        "description_teacher" => @unit.localized_description || '',
        "version_title" => @unit.version_year || ''
      }
    end

    private def create_new_unit_group
      @unit_group = UnitGroup.new(
        name: @unit.name,
        family_name: @unit.family_name,
        version_year: @unit.version_year,
        instruction_type: @unit.instruction_type,
        instructor_audience: @unit.instructor_audience,
        participant_audience: @unit.participant_audience,
        has_numbered_units: false
      )
      @unit_group.save
    end

    private def update_unit_group(i18n_params, published_state)
      # Add existing unit to new unit group and update strings
      # Dir.chdir(Rails.root) do
      #   @new_unit_group.persist_strings_and_units_changes([@unit.name], i18n_params)
      # end
      @unit_group.update_scripts([@unit.name])

      # Publish the new unit group
      @unit_group.update!(published_state: published_state)
    end

    private def update_section_assignments
      sections_updated = 0
      Section.where(script_id: @unit.id).each do |section|
        section.update!(course_id: @unit_group.id)
        sections_updated += 1
      end
      log "Updated #{sections_updated} sections for unit #{@unit.name}" if @verbose
    end

    private def log(message, type: 'info')
      @logger.send(type, message)
    end

    private def run_checks(course_version, dupe_unit, original_course_version_id)
      checks = {
        "New UnitGroup is valid" => @unit_group.valid?,
        "Existing unit is valid" => @unit.valid?,
        "CourseVersion is valid" => course_version.valid?,
        "New UnitGroup has the same name as the existing unit" => @unit_group.name == dupe_unit.name,
        "New UnitGroup has the same family_name as the existing unit" => @unit_group.family_name == dupe_unit.family_name,
        "New UnitGroup has the same version_year as the existing unit" => @unit_group.version_year == dupe_unit.version_year,
        "New UnitGroup has the same instruction_type as the existing unit" => @unit_group.instruction_type == dupe_unit.instruction_type,
        "New UnitGroup has the same instructor_audience as the existing unit" => @unit_group.instructor_audience == dupe_unit.instructor_audience,
        "New UnitGroup has the same participant_audience as the existing unit" => @unit_group.participant_audience == dupe_unit.participant_audience,
        "New UnitGroup has the same published_state as the existing unit" => @unit_group.published_state == dupe_unit.published_state,
        "New UnitGroup is assigned to the existing unit" => @unit_group.default_units.first.id == @unit.id,
        "New UnitGroup is a single unit course" => @unit_group.single_unit_course?,
        "New UnitGroup has the same course_version as the existing unit" => @unit_group.course_version.id == original_course_version_id,
        "CourseVersion has a content_root_type of 'UnitGroup'" => course_version.content_root_type == 'UnitGroup',
        "CourseVersion has a content_root of the new UnitGroup" => course_version.content_root_id == @unit_group.id
      }

      # Determine if all checks passed
      all_passed = checks.values.all?
      unless all_passed
        log("Checks failed for unit migration: #{@unit.name}", type: "error")
        failing_checks = checks.select {|_, result| !result}
        failing_checks.each {|description, result| log "#{description}: #{result}"}
      end

      log "View the new UnitGroup here: https:#{CDO.studio_url(@unit_group.link)}" if @verbose
      all_passed
    end

    private def rollback_section_assignments
      sections_rollback = 0
      Section.where(course_id: @unit_group.id).each do |section|
        section.update!(course_id: nil)
        sections_rollback += 1
      end
      log "Rolled back #{sections_rollback} sections for unit #{@unit.name}" if @verbose
    end

    private def rollback_checks(unit_group_id)
      checks = {
        "UnitGroup is destroyed" => UnitGroup.find_by(id: unit_group_id).nil?,
        "Unit is valid" => @unit.valid?,
        "CourseVersion is valid" => @unit.course_version.valid?,
        "Unit is a course" => @unit.is_course?,
        "Unit does not have a unit_group" => @unit.unit_group.nil?,
        "CourseVersion has a content_root_type of 'UnitGroup'" => @unit.course_version.content_root_type == 'Unit',
        "CourseVersion has a content_root of the new UnitGroup" => @unit.course_version.content_root_id == @unit.id
      }

      # Determine if all checks passed
      all_passed = checks.values.all?
      if all_passed
        log("Migration successfully rolled back for unit #{@unit.name}")
      else
        log("Checks failed for unit migration rollback: #{@unit.name}", type: "error")
        failing_checks = checks.select {|_, result| !result}
        failing_checks.each {|description, result| log "#{description}: #{result}"}
      end
      all_passed
    end
  end
end

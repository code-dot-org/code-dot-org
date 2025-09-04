module Services
  class UnitGroupCreator < Services::Base
    attr_reader :unit

    def initialize(unit, verbose: false, log_file: nil, file_system_changes: true)
      @unit = unit
      @verbose = verbose
      @logger = log_file ? Logger.new(log_file) : Logger.new($stdout)
      @file_system_changes = file_system_changes
    end

    def call
      if @unit.get_original_unit_group
        log "Unit already has a UnitGroup: #{@unit.name}", type: "error"
        return false
      end

      unit_copy = @unit.dup
      log_initial_info if @verbose
      i18n_params = set_i18n_params if @file_system_changes

      create_new_unit_group
      if @unit_group.errors.present?
        log "Migration failed for Unit #{@unit.name} to UnitGroup #{@unit_group.name}: #{@unit_group.errors.full_messages.join(', ')}", type: "error"
        return false
      end

      # Create a new course offering and course version
      CourseOffering.add_course_offering(@unit_group)
      course_version = @unit_group.course_version

      if course_version.nil?
        log "New UnitGroup's course version not found: #{@unit_group.name}", type: "error"
        @unit_group.destroy!
        return false
      end

      # Clear "course" settings from the unit
      @unit.update!(version_year: nil, family_name: nil, published_state: nil, instruction_type: nil, instructor_audience: nil, participant_audience: nil, skip_name_format_validation: true)

      update_unit_group(i18n_params, unit_copy.published_state || Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development)

      update_section_assignments

      update_levelbuilder_files

      passed_checks = run_checks(course_version, unit_copy)
      rollback unless passed_checks
      passed_checks
    end

    def self.rollback(unit, verbose: false, log_file: nil, file_system_changes: true)
      new(unit, verbose: verbose, log_file: log_file, file_system_changes: file_system_changes).rollback
    end

    def rollback
      log "Rolling back migration for unit #{@unit.name}"

      @unit_group ||= @unit.get_original_unit_group
      if @unit_group.nil?
        log "Unit's unit_group not found: #{@unit.name}", type: "error"
        return false
      end

      @name_changed = true if @unit_group.name != @unit.name

      unit_group_id = @unit_group.id
      course_version = @unit_group.course_version

      # Set sections back to their original course
      rollback_section_assignments

      # Add "course" settings back to unit
      rollback_unit_settings

      course_version&.destroy!

      # Make sure we are referencing the most recent data
      @unit_group.reload
      @unit.reload

      @unit_group.destroy!

      rollback_levelbuilder_files

      rollback_checks(unit_group_id)
    end

    private def log_initial_info
      log "Initial info"
      log "Existing unit: #{@unit.inspect}"
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
        family_name: @unit.family_name || @unit.name,
        version_year: @unit.version_year || 'unversioned',
        instruction_type: @unit.instruction_type || Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led,
        instructor_audience: @unit.instructor_audience || Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher,
        participant_audience: @unit.participant_audience || Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student,
        pilot_experiment: @unit.pilot_experiment,
        numbered_units: nil
      )
      unless @unit_group.save
        new_name = case @unit_group.errors[:name]&.first
                   when "can only contain lowercase letters, numbers and dashes"
                     @unit.name.downcase.tr(' ', '-').tr('_', '-')
                   when "has already been taken"
                     @unit.name + "-course"
                   else
                     nil
                   end
        @unit_group = UnitGroup.new(
          name: new_name,
          family_name: @unit.family_name || @unit.name,
          version_year: @unit.version_year || 'unversioned',
          instruction_type: @unit.instruction_type || Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led,
          instructor_audience: @unit.instructor_audience || Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher,
          participant_audience: @unit.participant_audience || Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student,
          pilot_experiment: @unit.pilot_experiment,
          numbered_units: nil
        )
        @name_changed = true
        @unit_group.save
      end
    end

    private def update_unit_group(i18n_params, published_state)
      # Add existing unit to new unit group and update strings
      if @file_system_changes
        Dir.chdir(Rails.root) do
          @unit_group.persist_strings_and_units_changes([@unit.name], i18n_params)
        end
      else
        @unit_group.update_scripts([@unit.name])
      end

      # Publish the new unit group
      @unit_group.update!(published_state: published_state)
    end

    private def update_section_assignments
      count = Section.with_deleted.where(script_id: @unit.id).where(course_id: nil).update_all(course_id: @unit_group.id)
      log "Updated #{count} sections for unit #{@unit.name}" if @verbose
    end

    private def update_levelbuilder_files
      if @file_system_changes
        @unit_group.write_serialization
      end
    end

    private def log(message, type: 'info')
      @logger.send(type, message)
    end

    private def run_checks(course_version, dupe_unit)
      checks = {
        "New UnitGroup is valid" => @unit_group.valid?,
        "Existing unit is valid" => @unit.valid? || @name_changed,
        "CourseVersion is valid" => course_version.valid?,
        "New UnitGroup has the same name as the existing unit" => @unit_group.name == dupe_unit.name || @name_changed,
        "New UnitGroup is assigned to the existing unit" => @unit_group.first_unit.id == @unit.id,
        "New UnitGroup is a single unit course" => @unit_group.single_unit_course?,
        "CourseVersion has a content_root of the new UnitGroup" => course_version.content_root_id == @unit_group.id
      }

      # Determine if all checks passed
      all_passed = checks.values.all?
      if all_passed
        log "View the new UnitGroup here: https:#{CDO.studio_url(@unit_group.link)}" if @verbose
      else
        log("Checks failed for unit migration: #{@unit.name}", type: "error")
        failing_checks = checks.select {|_, result| !result}
        failing_checks.each {|description, result| log("#{description}: #{result}", type: 'error')}
      end

      all_passed
    end

    private def rollback_section_assignments
      count = Section.with_deleted.where(course_id: @unit_group.id).update_all(course_id: nil)
      log "Rolled back #{count} sections for unit #{@unit.name}" if @verbose
    end

    private def rollback_unit_settings
      @unit.update!(version_year: @unit_group.version_year, family_name: @unit_group.family_name,
                    published_state: @unit_group.published_state, instruction_type: @unit_group.instruction_type,
                    instructor_audience: @unit_group.instructor_audience, participant_audience: @unit_group.participant_audience,
                    pilot_experiment: @unit_group.pilot_experiment, skip_name_format_validation: true,
                    original_unit_group_id: nil
      )
    end

    private def rollback_levelbuilder_files
      if @file_system_changes
        @unit.write_script_json
        File.delete(UnitGroup.file_path(@unit_group.name))
      end
    end

    private def rollback_checks(unit_group_id)
      checks = {
        "UnitGroup is destroyed" => UnitGroup.find_by(id: unit_group_id).nil?,
        "Unit is valid" => @unit.valid? || @name_changed,
        "Unit does not have a unit_group" => @unit.get_original_unit_group.nil?,
      }

      # Determine if all checks passed
      all_passed = checks.values.all?
      if all_passed
        log("Migration successfully rolled back for unit #{@unit.name}")
      else
        log("Checks failed for unit migration rollback: #{@unit.name}", type: "error")
        failing_checks = checks.select {|_, result| !result}
        failing_checks.each {|description, result| log("#{description}: #{result}", type: 'error')}
      end
      all_passed
    end
  end
end

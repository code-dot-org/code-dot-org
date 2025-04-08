class CleanupAfterStandaloneUnitMigration < ActiveRecord::Migration[6.1]
  def up
    file_system_changes = Rails.application.config.levelbuilder_mode
    migrated_units = []
    ENV['MIGRATE_STANDALONE_UNITS'] = 'true'

    # We need to delete the following units
    units_to_delete = %w[computer-systems-and-devices-2024 networks-and-the-internet-2024 amys-playground csa-frq-practice hello-world-food-one hoc-music-ai-pilot]
    units_to_delete.each do |unit_name|
      unit = Unit.find_by(name: unit_name)
      if unit.nil?
        print_message "Unit not found: #{unit_name}"
        next
      end

      unless Policies::Unit.can_be_deleted?(unit)
        print_message "#{unit_name} cannot be deleted if it is marked stable or has sections that have it assigned."
        next
      end

      if unit.get_published_state != "in_development"
        print_message "Published state for Unit [#{unit_name}] is not in_development, script might have usage. Skipping..."
        next
      end

      if UserScript.where(script_id: unit.id).count > 0
        print_message "Some users have existing progress in unit [#{unit_name}]. Skipping..."
        next
      end

      print_message "Deleting Unit from DB: #{unit_name}"
      ActiveRecord::Base.transaction do
        unit.destroy!
      rescue Exception => exception
        print_message "ERROR: Caught an exception while deleting Unit #{unit_name}: #{exception.class} - #{exception.message}"
      end
    end

    # We need to delete these unit groups and migrate the associated units
    unit_groups_to_delete = {"sandbox-pl-cv" => "sandbox-pl-cv",
                             "introduction-to-programming-in-music-lab-for-elementary-2025" => "introduction-to-programming-in-music-lab-for-elementary"}
    unit_groups_to_delete.each do |unit_group_name, unit_name|
      unit_group = UnitGroup.find_by(name: unit_group_name)
      if unit_group.nil?
        print_message "UnitGroup not found: #{unit_group_name}"
      else
        if unit_group.stable?
          print_message "UnitGroup #{unit_group_name} cannot be deleted if it is marked stable."
          next
        end

        if Section.where(course_id: unit_group.id).count > 0
          print_message "UnitGroup #{unit_group_name} cannot be deleted if it has sections that have it assigned."
          next
        end

        unless unit_group.in_development?
          print_message "Published state for UnitGroup [#{unit_group_name}] is not in_development, course might have usage. Skipping..."
          next
        end

        unless unit_group.default_units.empty?
          print_message "UnitGroup [#{unit_group_name}] has units. Skipping..."
          next
        end

        print_message "Deleting UnitGroup from DB: #{unit_group_name}"
        ActiveRecord::Base.transaction do
          unit_group.destroy!
        rescue Exception => exception
          print_message "ERROR: Caught an exception while deleting UnitGroup #{unit_name}: #{exception.class} - #{exception.message}"
        end
      end

      unit = Unit.find_by(name: unit_name)
      if unit.nil?
        print_message "Unit not found: #{unit_name}"
        next
      end

      unless unit.is_course?
        print_message "Unit [#{unit_name}] is not a standalone unit. No migration needed."
        next
      end

      begin
        result = Services::StandaloneUnitMigrator.call(unit, file_system_changes: file_system_changes)
      rescue Exception => exception
        filtered_backtrace = exception.backtrace.select {|line| line.include?("standalone_unit_migrator.rb")}
        print_message "ERROR: Caught an exception while migrating #{unit.name}: #{exception.class} - #{exception.message}\n\tBacktrace: #{filtered_backtrace}"
      end
      migrated_units << unit.name if result
    end
    ENV.delete('MIGRATE_STANDALONE_UNITS')
    print_message "Units Migrated: #{migrated_units.count}"
    message = Unit.count(&:is_course?) == 0 ? "There are no more standalone-units!" : "There are still unmigrated units! Unmigrated Units: #{Unit.count(&:is_course?)}"
    print_message message
  end

  def down
  end

  def print_message(message)
    Rails.logger.warn message
    puts message
  end
end

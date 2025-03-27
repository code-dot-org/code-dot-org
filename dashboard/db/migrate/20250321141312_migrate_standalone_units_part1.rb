class MigrateStandaloneUnitsPart1 < ActiveRecord::Migration[6.1]
  def up
    return if Rails.env.production?

    file_name = 'standalone_units_part1.txt'
    file_system_changes = Rails.application.config.levelbuilder_mode

    file = Rails.root.join('..', 'bin', 'oneoff', file_name)
    standalone_units = File.read(file).split("\n").filter_map do |unit_name|
      unit = Unit.find_by(name: unit_name)
      puts "Unit not found: #{unit_name}" if unit.nil?
      unit
    end

    migrated_units = []

    ENV['MIGRATE_STANDALONE_UNITS'] = 'true'
    standalone_units.each do |unit|
      begin
        result = Services::StandaloneUnitMigrator.call(unit, file_system_changes: file_system_changes)
      rescue Exception => exception
        filtered_backtrace = exception.backtrace.select {|line| line.include?("standalone_unit_migrator.rb")}
        puts "ERROR: Caught an exception while migrating #{unit.name}: #{exception.class} - #{exception.message}\n\tBacktrace: #{filtered_backtrace}"
      end
      migrated_units << unit.name if result
    end
    puts "Units Migrated: #{migrated_units.count}"
    puts "There are still unmigrated units! Unmigrated Units: #{Unit.all.count(&:is_course?)}" if Unit.all.count(&:is_course?) > 0

    ENV.delete('MIGRATE_STANDALONE_UNITS')
  end

  def down
  end
end

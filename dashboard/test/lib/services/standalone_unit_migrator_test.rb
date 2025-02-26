require "test_helper"
require "tempfile"

class Services::StandaloneUnitMigratorTest < ActiveSupport::TestCase
  let(:described_instance) {described_class.new(@unit, verbose: true, log_file: @temp_log_file.path)}

  let(:family_name) {Faker::Lorem.unique.word}

  describe '#call' do
    subject(:migrate_unit) {described_instance.call}

    before do
      ENV['MIGRATE_STANDALONE_UNITS'] = 'true'
      @course_offering = create :course_offering, key: family_name, display_name: family_name
      @unit = create :standalone_unit, name: "#{family_name}-2025", family_name: family_name, version_year: "2025", published_state: "stable"
      @course_version = create :course_version, course_offering: @course_offering, content_root: @unit, key: "2025", display_name: "2025", published_state: "stable"

      @temp_log_file = Tempfile.new("unit_migration.log")
    end

    after do
      ENV.delete('MIGRATE_STANDALONE_UNITS')
      @temp_log_file.close!
      @temp_log_file.unlink
    end

    it 'successfully migrates a standalone unit to a UnitGroup' do
      assert migrate_unit

      # Verify that the unit was successfully migrated
      new_unit_group = UnitGroup.find_by(name: @unit.name)
      refute_nil new_unit_group, "New UnitGroup should be created"
      assert_equal family_name, new_unit_group.family_name
      assert_equal "2025", new_unit_group.version_year
      assert_equal "teacher_led", new_unit_group.instruction_type

      # Verify the course_version now points to the new UnitGroup
      @course_version.reload
      assert_equal new_unit_group, @course_version.content_root
      assert_equal @course_version, new_unit_group.course_version

      # Verify the unit's course-related settings are cleared
      @unit.reload
      refute @unit.is_course, "Unit should have is_course set to false"
      assert_nil @unit.version_year, "Unit version_year should be cleared"
      assert_nil @unit.family_name, "Unit family_name should be cleared"

      # Verify that the log file contains the dynamically generated URL
      log_contents = File.read(@temp_log_file.path)
      assert_match(/View the new UnitGroup here: .*\/courses\/#{new_unit_group.name}/, log_contents)
    end

    it 'fails when course_version is nil' do
      @unit.update!(course_version: nil)
      refute migrate_unit

      log_contents = File.read(@temp_log_file.path)
      assert_match(/Existing Unit's course version not found/, log_contents)
    end

    it 'fails when new UnitGroup fails to save' do
      @unit.update_column(:name, "INVALID NAME")
      refute migrate_unit

      log_contents = File.read(@temp_log_file.path)
      assert_match(/Migration failed for/, log_contents)
    end
  end
end

require 'benchmark'
require 'csv'
require 'action_view/helpers/date_helper'
require '../lib/cdo/git_utils'
require '../lib/cdo/rake_utils'
require '../lib/cdo/hash_utils'

# Enables timed_task to be used in place of task when defining rake tasks, which prints
# how long the task took to stdout.
module CustomRake
  class TimedTask < Rake::Task
    include ActionView::Helpers::DateHelper

    def execute(args = nil)
      puts "Finished #{name} (#{distance_of_time_in_words(Benchmark.realtime {super}.to_f)})"
    end
  end
end

module TimedTask
  def timed_task(*args, &block)
    CustomRake::TimedTask.define_task(*args, &block)
  end
end

namespace :seed do
  include TimedTask
  verbose false

  timed_task check_migrations: :environment do
    ActiveRecord::Migration.check_pending!
  end

  timed_task videos: :environment do
    Video.setup
  end

  timed_task concepts: :environment do
    Concept.setup
  end

  timed_task games: :environment do
    Game.setup
  end

  timed_task donors: :environment do
    Donor.setup
  end

  timed_task donor_schools: :environment do
    DonorSchool.setup
  end

  timed_task foorm_libraries: :environment do
    Foorm::Library.setup
  end

  timed_task foorm_forms: :environment do
    Foorm::Form.setup
  end

  timed_task foorms: :environment do
    Foorm::Library.setup
    Foorm::Form.setup
  end

  SCRIPTS_GLOB = Dir.glob('config/scripts_json/**/*.script_json').sort.flatten.freeze
  SPECIAL_UI_TEST_SCRIPTS = [
    'ui-test-script-in-course-2017',
    'ui-test-script-in-course-2019',
    'ui-test-versioned-script-2017',
    'ui-test-versioned-script-2019',
    'ui-test-csa-family-script',
    'ui-test-teacher-pl-course',
    'ui-test-facilitator-pl-course'
  ].map {|script| "test/ui/config/scripts_json/#{script}.script_json"}.freeze
  UI_TEST_SCRIPTS = SPECIAL_UI_TEST_SCRIPTS + [
    '20-hour',
    'algebra',
    'allthehiddenthings',
    'allthemigratedthings',
    'alltheplcthings',
    'alltheselfpacedplthings',
    'allthethings',
    'allthettsthings',
    'artist',
    'course1',
    'course2',
    'course3',
    'course4',
    'coursea-2017',
    'courseb-2017',
    'coursec-2017',
    'coursed-2017',
    'coursee-2017',
    'coursef-2017',
    'pre-express-2017',
    'express-2017',
    'coursea-2019',
    'coursec-2019',
    'coursee-2019',
    'coursea-2020',
    'csp1-2017',
    'csp2-2017',
    'csp3-2017',
    'csp3-a',
    'csp3-research-mxghyt',
    'csp4-2017',
    'csp5-2017',
    'csp-ap',
    'csp-explore-2017',
    'csp-create-2017',
    'csp-post-survey',
    'csppostap-2017',
    'csp1-2019',
    'csp2-2019',
    'csp3-2019',
    'csp4-2019',
    'csp5-2019',
    'csp-explore-2019',
    'csp-create-2019',
    'csppostap-2019',
    'dance',
    'events',
    'flappy',
    'frozen',
    'hero',
    'hourofcode',
    'infinity',
    'mc',
    'minecraft',
    'playlab',
    'starwars',
    'starwarsblocks',
    'step',
    'oceans',
    'sports',
  ].map {|script| "config/scripts_json/#{script}.script_json"}.freeze
  SEEDED = 'config/scripts/.seeded'.freeze

  # Update scripts in the database from their file definitions.
  #
  # @param [Hash] opts the options to update the scripts with.
  # @option opts [Boolean] :incremental Whether to only process modified scripts.
  # @option opts [Boolean] :script_files Which script files to update. Default:
  #   all script files.
  def update_scripts(opts = {})
    # optionally, only process modified scripts to speed up seed time
    scripts_seeded_mtime = (opts[:incremental] && File.exist?(SEEDED)) ?
      File.mtime(SEEDED) : Time.at(0)
    touch SEEDED # touch seeded "early" to reduce race conditions
    script_files = opts[:script_files] || SCRIPTS_GLOB
    begin
      custom_scripts = script_files.select {|script| File.mtime(script) > scripts_seeded_mtime}
      custom_scripts.each do |filepath|
        Services::ScriptSeed.seed_from_json_file(filepath)
      rescue => e
        raise e, "Error parsing script file #{filepath}: #{e}"
      end
    rescue
      rm SEEDED # if we failed somewhere in the process, we may have seeded some Scripts, but not all that we were supposed to.
      raise
    end
  end

  SCRIPTS_DEPENDENCIES = [
    :environment,
    :check_migrations,
    :games,
    :deprecated_blockly_levels,
    :custom_levels,
    :dsls,
    :code_docs,
    :blocks,
    :standards,
    :shared_blockly_functions,
    :libraries,
    :course_offerings
  ].freeze

  # Do the minimum amount of work to seed a single script or glob, without
  # seeding levels or other dependencies. For use in development. Examples:
  # rake seed:single_script SCRIPT_NAME=express-2019
  # rake seed:single_script SCRIPT_NAME="csp*-2020"
  timed_task single_script: :environment do
    script_name = ENV['SCRIPT_NAME']
    raise "must specify SCRIPT_NAME=" unless script_name
    script_files = Dir.glob("config/scripts_json/#{script_name}.script_json")
    raise "no matching scripts found" unless script_files.present?
    puts "seeding only scripts:\n#{script_files.join("\n")}"
    update_scripts(script_files: script_files)
  end

  timed_task scripts: SCRIPTS_DEPENDENCIES do
    update_scripts(incremental: false)
  end

  timed_task scripts_incremental: SCRIPTS_DEPENDENCIES do
    update_scripts(incremental: true)
  end

  timed_task scripts_ui_tests: SCRIPTS_DEPENDENCIES do
    update_scripts(script_files: UI_TEST_SCRIPTS)
  end

  timed_task courses: :environment do
    Dir.glob(UnitGroup.file_path('**')).sort.map do |path|
      UnitGroup.load_from_path(path)
    end
  end

  timed_task courses_ui_tests: :environment do
    # seed those courses that are needed for UI tests
    %w(allthethingscourse csp-2017 csp-2019).each do |course_name|
      UnitGroup.load_from_path("config/courses/#{course_name}.course")
    end
    %w(ui-test-course-2017 ui-test-course-2019).each do |course_name|
      UnitGroup.load_from_path("test/ui/config/courses/#{course_name}.course")
    end
  end

  # detect changes to dsldefined level files
  # LevelGroup must be last here so that LevelGroups are seeded after all levels that they can contain
  DSL_TYPES = %w(TextMatch ContractMatch External Match Multi EvaluationMulti BubbleChoice LevelGroup).freeze
  DSLS_GLOB = DSL_TYPES.map {|x| Dir.glob("config/scripts/**/*.#{x.underscore}*").sort}.flatten.freeze
  file 'config/scripts/.dsls_seeded' => DSLS_GLOB do |t|
    Rake::Task['seed:dsls'].invoke
    touch t.name
  end

  # explicit execution of "seed:dsls"
  timed_task dsls: :environment do
    DSLDefined.transaction do
      # Allow developers to seed just one dsl-defined level, e.g.
      # rake seed:dsls DSL_FILENAME=k-1_Artistloops_multi1.multi
      dsls_glob = ENV['DSL_FILENAME'] ? Dir.glob("config/scripts/**/#{ENV['DSL_FILENAME']}") : DSLS_GLOB

      # This is only expected to happen when DSL_FILENAME is set and the
      # filename is not found
      unless dsls_glob.count > 0
        raise 'no matching dsl-defined level files found. please check filename for exact case and spelling.'
      end

      # Parse each .[dsl] file and setup its model.
      dsls_glob.each do |filename|
        dsl_class = DSL_TYPES.detect {|type| filename.include?(".#{type.underscore}")}.try(:constantize)
        begin
          data, _i18n = dsl_class.parse_file(filename)
          dsl_class.setup data
        rescue Exception
          puts "Error parsing #{filename}"
          raise
        end
      end
    end
  end

  timed_task blocks: :environment do
    Block.load_records
  end

  timed_task shared_blockly_functions: :environment do
    SharedBlocklyFunction.load_records
  end

  timed_task libraries: :environment do
    Library.load_records
  end

  # Generate the database entry from the custom levels json file.
  # Optionally limit to a single level via LEVEL_NAME= env variable.
  timed_task custom_levels: :environment do
    level_name = ENV['LEVEL_NAME']
    LevelLoader.load_custom_levels(level_name)
  end

  timed_task deprecated_blockly_levels: :environment do
    Services::DeprecatedLevelLoader.load_blockly_levels
  end

  # Seeds the data in callouts
  timed_task callouts: :environment do
    Callout.transaction do
      Callout.reset_db
      # TODO: If the id of the callout is important, specify it in the tsv
      # preferably the id of the callout is not important ;)
      Callout.find_or_create_all_from_tsv!('config/callouts.tsv')
    end
  end

  timed_task course_offerings: :environment do
    CourseOffering.seed_all
  end

  timed_task course_offerings_ui_tests: :environment do
    %w(ui-test-course ui-test-csa-family-script ui-test-teacher-pl-course ui-test-facilitator-pl-course).each do |course_offering_name|
      CourseOffering.seed_record("test/ui/config/course_offerings/#{course_offering_name}.json")
    end
  end

  timed_task reference_guides: :environment do
    ReferenceGuide.seed_all
  end

  # Seeds Standards
  timed_task standards: :environment do
    Framework.seed_all
    StandardCategory.seed_all
    Standard.seed_all
  end

  timed_task code_docs: :environment do
    ProgrammingEnvironment.seed_all
    ProgrammingExpression.seed_all
    ProgrammingClass.seed_all
  end

  # Seeds the data in school_districts
  timed_task school_districts: :environment do
    SchoolDistrict.seed_all
  end

  # Seeds the data in schools
  timed_task schools: :environment do
    School.seed_all
  end

  timed_task ap_school_codes: :environment do
    Census::ApSchoolCode.seed
  end

  timed_task ap_cs_offerings: :environment do
    Census::ApCsOffering.seed
  end

  timed_task ib_school_codes: :environment do
    Census::IbSchoolCode.seed
  end

  timed_task ib_cs_offerings: :environment do
    Census::IbCsOffering.seed
  end

  timed_task state_cs_offerings: :environment do
    Census::StateCsOffering.seed
  end

  # Seed school course offering data where the courses are taught by outside curriculum providers, such as TEALS.
  timed_task other_curriculum_offerings: :environment do
    Census::OtherCurriculumOffering.seed
  end

  timed_task sample_data: :environment do
    SampleData.seed
  end

  timed_task mega_section: :environment do
    MegaSection.seed
  end

  MAX_LEVEL_SOURCES = 10_000
  desc "calculate solutions (ideal_level_source) for levels based on most popular correct solutions (very slow)"
  timed_task ideal_solutions: :environment do
    require 'benchmark'
    Level.where_we_want_to_calculate_ideal_level_source.each do |level|
      next if level.try(:free_play?)
      puts "Level #{level.id}"
      level_sources_count = level.level_sources.count
      if level_sources_count > MAX_LEVEL_SOURCES
        puts "...skipped, too many possible solutions"
      else
        times = Benchmark.measure {level.calculate_ideal_level_source_id}
        puts "... analyzed #{level_sources_count} in #{times.real.round(2)}s"
      end
    end
  end

  timed_task :import_users, [:file] => :environment do |_t, args|
    CSV.read(args[:file], {col_sep: "\t", headers: true}).each do |row|
      User.create!(
        provider: User::PROVIDER_MANUAL,
        name: row['Name'],
        username: row['Username'],
        password: row['Password'],
        password_confirmation: row['Password'],
        birthday: row['Birthday'].blank? ? nil : Date.parse(row['Birthday'])
      )
    end
  end

  timed_task secret_words: :environment do
    SecretWord.setup
  end

  timed_task secret_pictures: :environment do
    SecretPicture.setup
  end

  timed_task restricted_section: :environment do
    name = "Fake Section Cap Teacher"
    email = "Fake-User-Email-Created-#{Time.now.to_i}_#{rand(1_000_000)}@test.xx"
    password = "#{name}password"
    user = User.create!(
      {
        name: name,
        email: email,
        password: password,
        user_type: "teacher",
        age: "21+"
      }
    )

    section = Section.create!(name: 'Section Capacity Test', user: user)

    500.times do |i|
      follower = User.create(
        {
          name: "Fake Section Cap Student #{i}",
          email: "#{i}#{email}",
          password: password,
          user_type: "student",
          age: "14"
        }
      )
      Follower.create!(section_id: section.id, student_user_id: follower.id)
    end
  end

  timed_task :cached_ui_test do
    HASH_FILE = 'db/ui_test_data.hash'

    # patterns are relative to dashboard directory
    watched_files = FileList[
      'app/dsl/**/*',
      'config/**/*',
      'db/**/*',
      'lib/tasks/**/*',
      'test/ui/config/**/*',
    ].exclude('db/ui_test_data.*')
    current_hash = HashUtils.file_contents_hash(watched_files)

    if File.exist?(HASH_FILE)
      dump_hash = File.read(HASH_FILE)

      if current_hash == dump_hash
        puts 'Cache hit! Loading from db dump'
        sh('mysql -u root < db/ui_test_data.sql')
        next
      end
    end

    puts 'Cache mismatch, running full ui test seed'
    RakeUtils.rake_stream_output 'seed:ui_test'
    File.write(HASH_FILE, current_hash)
    sh('mysqldump -u root -B dashboard_test > db/ui_test_data.sql')
  end

  FULL_SEED_TASKS = [:check_migrations, :videos, :concepts, :scripts, :courses, :reference_guides, :callouts, :school_districts, :schools, :secret_words, :secret_pictures, :ap_school_codes, :ap_cs_offerings, :ib_school_codes, :ib_cs_offerings, :state_cs_offerings, :donors, :donor_schools, :foorms].freeze
  UI_TEST_SEED_TASKS = [:check_migrations, :videos, :concepts, :course_offerings_ui_tests, :scripts_ui_tests, :courses_ui_tests, :callouts, :school_districts, :schools, :secret_words, :secret_pictures, :donors, :donor_schools].freeze
  DEFAULT_SEED_TASKS = [:adhoc, :test].include?(rack_env) ? UI_TEST_SEED_TASKS : FULL_SEED_TASKS

  desc "seed the data needed for this type of environment by default"
  timed_task default: DEFAULT_SEED_TASKS
  desc "seed all dashboard data"
  timed_task all: FULL_SEED_TASKS
  timed_task ui_test: UI_TEST_SEED_TASKS

  desc "seed all dashboard data that has changed since last seed"
  timed_task incremental: [:check_migrations, :videos, :concepts, :scripts_incremental, :callouts, :school_districts, :schools, :secret_words, :secret_pictures, :courses, :ap_school_codes, :ap_cs_offerings, :ib_school_codes, :ib_cs_offerings, :state_cs_offerings, :donors, :donor_schools, :foorms]

  desc "seed only dashboard data required for tests"
  timed_task test: [:check_migrations, :videos, :games, :concepts, :secret_words, :secret_pictures, :school_districts, :schools, :standards, :foorms]
end

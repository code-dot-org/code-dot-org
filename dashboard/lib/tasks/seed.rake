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

  SCRIPTS_GLOB = Dir.glob('config/scripts/**/*.script').sort.flatten.freeze
  SPECIAL_UI_TEST_SCRIPTS = [
    'ui-test-script-in-course-2017',
    'ui-test-script-in-course-2019',
    'ui-test-versioned-script-2017',
    'ui-test-versioned-script-2019'
  ].map {|script| "test/ui/config/scripts/#{script}.script"}.freeze
  UI_TEST_SCRIPTS = SPECIAL_UI_TEST_SCRIPTS + [
    '20-hour',
    'algebra',
    'allthehiddenthings',
    'allthemigratedthings',
    'alltheplcthings',
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
    'express-2017',
    'pre-express-2017',
    'coursea-2018',
    'coursea-2019',
    'coursec-2019',
    'coursee-2019',
    'coursea-2020',
    'csd3-2019',
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
    'csp1-2018',
    'csp2-2018',
    'csp3-2018',
    'csp4-2018',
    'csp5-2018',
    'csp-explore-2018',
    'csp-create-2018',
    'csppostap-2018',
    'csp-post-survey-2018',
    'csp1-2019',
    'csp2-2019',
    'csp3-2019',
    'csp4-2019',
    'csp5-2019',
    'csp-explore-2019',
    'csp-create-2019',
    'csppostap-2019',
    'csp1-2020',
    'csp2-2020',
    'csp3-2020',
    'csp4-2020',
    'csp5-2020',
    'csp6-2020',
    'csp7-2020',
    'csp8-2020',
    'csp9-2020',
    'csp10-2020',
    'csp-post-survey-2020',
    'dance',
    'events',
    'express-2017',
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
  ].map {|script| "config/scripts/#{script}.script"}.freeze
  SEEDED = 'config/scripts/.seeded'.freeze

  file SEEDED => [SCRIPTS_GLOB, :environment].flatten do
    update_scripts
  end

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
      LevelLoader.update_unplugged if File.mtime('config/locales/unplugged.en.yml') > scripts_seeded_mtime
      _, custom_i18n = Script.setup(custom_scripts, show_progress: Rake.application.options.trace)
      Script.merge_and_write_i18n(custom_i18n)
    rescue
      rm SEEDED # if we failed somewhere in the process, we may have seeded some Scripts, but not all that we were supposed to.
      raise
    end
  end

  SCRIPTS_DEPENDENCIES = [
    :environment,
    :games,
    :custom_levels,
    :dsls,
    :programming_expressions,
    :blocks,
    :standards,
    :shared_blockly_functions,
    :libraries,
  ].freeze

  # Do the minimum amount of work to seed a single script or glob, without
  # seeding levels or other dependencies. For use in development. Examples:
  # rake seed:single_script SCRIPT_NAME=express-2019
  # rake seed:single_script SCRIPT_NAME="csp*-2020"
  timed_task single_script: :environment do
    script_name = ENV['SCRIPT_NAME']
    raise "must specify SCRIPT_NAME=" unless script_name
    script_files = Dir.glob("config/scripts/#{script_name}.script")
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
    %w(allthethingscourse csp-2017 csp-2018 csp-2019 csp-2020).each do |course_name|
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

  # Seeds the data in callouts
  timed_task callouts: :environment do
    Callout.transaction do
      Callout.reset_db
      # TODO: If the id of the callout is important, specify it in the tsv
      # preferably the id of the callout is not important ;)
      Callout.find_or_create_all_from_tsv!('config/callouts.tsv')
    end
  end

  # Seeds Standards
  timed_task standards: :environment do
    Framework.seed_all
    StandardCategory.seed_all
    Standard.seed_all
  end

  timed_task programming_expressions: :environment do
    ProgrammingEnvironment.seed_all
    ProgrammingExpression.seed_all
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

  timed_task :cached_ui_test do
    HASH_FILE = 'db/ui_test_data.hash'

    # patterns are relative to dashboard directory
    watched_files = FileList[
      'app/dsl/**/*',
      'config/**/*',
      'db/**/*',
      'lib/tasks/**/*',
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
    Rake::Task['seed:ui_test'].invoke
    File.write(HASH_FILE, current_hash)
    sh('mysqldump -u root -B dashboard_test > db/ui_test_data.sql')
  end

  FULL_SEED_TASKS = [:videos, :concepts, :scripts, :courses, :callouts, :school_districts, :schools, :secret_words, :secret_pictures, :ap_school_codes, :ap_cs_offerings, :ib_school_codes, :ib_cs_offerings, :state_cs_offerings, :donors, :donor_schools, :foorms].freeze
  UI_TEST_SEED_TASKS = [:videos, :concepts, :scripts_ui_tests, :courses_ui_tests, :callouts, :school_districts, :schools, :secret_words, :secret_pictures, :donors, :donor_schools].freeze
  DEFAULT_SEED_TASKS = [:adhoc, :test].include?(rack_env) ? UI_TEST_SEED_TASKS : FULL_SEED_TASKS

  desc "seed the data needed for this type of environment by default"
  timed_task default: DEFAULT_SEED_TASKS
  desc "seed all dashboard data"
  timed_task all: FULL_SEED_TASKS
  timed_task ui_test: UI_TEST_SEED_TASKS

  desc "seed all dashboard data that has changed since last seed"
  timed_task incremental: [:videos, :concepts, :scripts_incremental, :callouts, :school_districts, :schools, :secret_words, :secret_pictures, :courses, :ap_school_codes, :ap_cs_offerings, :ib_school_codes, :ib_cs_offerings, :state_cs_offerings, :donors, :donor_schools, :foorms]

  desc "seed only dashboard data required for tests"
  timed_task test: [:videos, :games, :concepts, :secret_words, :secret_pictures, :school_districts, :schools, :standards, :foorms]
end

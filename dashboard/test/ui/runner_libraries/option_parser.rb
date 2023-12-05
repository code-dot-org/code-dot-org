require 'ostruct'
require 'optparse'

# OptionsParser class parses command-line options and sets default values
class OptionsParser
  attr_reader :options

  def initialize
    @options = default_options
    parse_options
  end

  # Parses the command-line options
  def parse_options
    setup_option_parser.parse!(ARGV)
    standardize_features
    set_db_access
    set_config_local
  end

  private

  # Sets default values for options using OpenStruct
  def default_options
    OpenStruct.new(
      config: nil,
      browser: nil,
      os_version: nil,
      browser_version: nil,
      features: nil,
      pegasus_domain: 'test.code.org',
      dashboard_domain: 'test-studio.code.org',
      hourofcode_domain: 'test.hourofcode.com',
      csedweek_domain: 'test.csedweek.org',
      advocacy_domain: 'test-advocacy.code.org',
      local: nil,
      local_headless: true,
      html: nil,
      maximize: nil,
      auto_retry: false,
      magic_retry: false,
      parallel_limit: 1,
      abort_when_failures_exceed: Float::INFINITY,
      priority: '99'
    )
  end

  # Initializes and sets up the OptionParser object
  def setup_option_parser
    OptionParser.new do |opts|
      opts.banner = "Usage: runner.rb [options] \
        Example: runner.rb -b chrome -o 7 -v 31 -f features/sharepage.feature \
        Example: runner.rb -d localhost:3000 -t \
        Example: runner.rb -l \
        Example: runner.rb -r"
      opts.separator ""
      opts.separator "Specific options:"
      opts.on("-c", "--config BrowserConfigName,BrowserConfigName1", Array, "Specify the name of one or more of the configs from ") do |c|
        options.config = c
      end
      opts.on("-b", "--browser BrowserName", String, "Specify a browser") do |b|
        options.browser = b
      end
      opts.on("-o", "--os_version OS Version", String, "Specify an os version") do |os|
        options.os_version = os
      end
      opts.on("-v", "--browser_version Browser Version", String, "Specify a browser version") do |bv|
        options.browser_version = bv
      end
      opts.on("-f", "--feature Feature", Array, "Single feature or comma separated list of features to run") do |f|
        options.features = f
      end
      opts.on("-l", "--local", "Use local domains. Also use local webdriver (not Saucelabs) unless -c is specified.") do
        options.local = 'true'
        options.pegasus_domain = 'localhost.code.org:3000'
        options.dashboard_domain = 'localhost-studio.code.org:3000'
        options.hourofcode_domain = 'localhost.hourofcode.com:3000'
        options.csedweek_domain = 'localhost.csedweek.org:3000'
        options.advocacy_domain = 'localhost-advocacy.code.org:3000'
      end
      opts.on("--headed", "Open visible chrome browser windows. Runs in headless mode without this flag. Only relevant when -l is specified.") do
        options.local_headless = false
      end
      opts.on("-p", "--pegasus Domain", String, "Specify an override domain for code.org, e.g. localhost.code.org:3000") do |p|
        if p == 'localhost:3000'
          print "WARNING: Some tests may fail using '-p localhost:3000' because cookies will not be available.\n" \
                "Try '-p localhost.code.org:3000' instead (this is the default when using '-l').\n"
        end
        options.pegasus_domain = p
      end
      opts.on("-d", "--dashboard Domain", String, "Specify an override domain for studio.code.org, e.g. localhost-studio.code.org:3000") do |d|
        if d == 'localhost:3000'
          print "WARNING: Some tests may fail using '-d localhost:3000' because cookies will not be available.\n" \
                "Try '-d localhost-studio.code.org:3000' instead (this is the default when using '-l').\n"
        end
        options.dashboard_domain = d
      end
      opts.on("--hourofcode Domain", String, "Specify an override domain for hourofcode.com, e.g. localhost.hourofcode.com:3000") do |d|
        options.hourofcode = d
      end
      opts.on("--csedweek Domain", String, "Specify an override domain for csedweek.org, e.g. localhost.csedweek.org:3000") do |d|
        options.csedweek = d
      end
      opts.on("-r", "--real_mobile_browser", "Use real mobile browser, not emulator") do
        options.realmobile = 'true'
      end
      opts.on("-m", "--maximize", "Maximize local webdriver window on startup") do
        options.maximize = true
      end
      opts.on("--circle", "Whether is CircleCI (skip failing Circle tests)") do
        options.is_circle = true
      end
      opts.on("--html", "Use html reporter") do
        options.html = true
      end
      opts.on("-e", "--eyes", "Run only Applitools eyes tests") do
        options.run_eyes_tests = true
      end
      opts.on("-a", "--auto_retry", "Retry tests that fail once") do
        options.auto_retry = true
      end
      opts.on("--retry_count TimesToRetry", String, "Retry tests that fail a given # of times") do |times_to_retry|
        options.retry_count = times_to_retry.to_i
      end
      opts.on("--magic_retry", "Magically retry tests based on how flaky they are") do
        options.magic_retry = true
      end
      opts.on("--abort_when_failures_exceed Limit", Numeric, "Maximum allowed feature failures before the whole test run is aborted (default is infinity)") do |max_failures|
        options.abort_when_failures_exceed = max_failures
      end
      opts.on("-n", "--parallel ParallelLimit", String, "Maximum number of browsers to run in parallel (default is 1)") do |p|
        options.parallel_limit = p.to_i
      end
      opts.on("--db", String, "Run scripts requiring DB access regardless of environment (otherwise restricted to development/test).") do
        options.force_db_access = true
      end
      opts.on("-V", "--verbose", "Verbose") do
        options.verbose = true
      end
      opts.on("--very-verbose", "Very verbose, extra debug logging") do
        ENV['VERY_VERBOSE'] = '1'
      end
      opts.on("--fail_fast", "Fail a feature as soon as a scenario fails") do
        options.fail_fast = true
      end
      opts.on('-s', '--script Scriptname', String, 'Run tests associated with this script, or have Scriptname somewhere in the URL') do |script_name|
        f = `egrep -r "Given I am on .*#{script_name.delete(' ').downcase}" . | cut -f1 -d ':' | sort | uniq | tr '\n' ,`
        options.features = f.split ','
      end
      opts.on('--with-status-page', 'Generate a test status summary page for this test run') do
        options.with_status_page = true
        options.html = true # Implied by wanting a status page
      end
      opts.on('--output-synopsis', 'Print a synopsis of failing scenarios') do
        options.output_synopsis = true
      end
      opts.on("--dry-run", "Process features without running any actual steps.") do
        options.dry_run = true
      end
      opts.on("--priority priority", "Set priority level for Sauce Labs jobs.") do |priority|
        options.priority = priority
      end
      opts.on_tail("-h", "--help", "Show this message") do
        puts opts
        exit
      end
    end
  end

  # Standardizes the feature paths by removing leading dot-slash
  def standardize_features
    @options.features = ARGV + (@options.features || []).map {|feature| feature.gsub(/^\.\//, '')}
    @options.features.uniq!
  end

  # Sets the database access based on environment and user configuration
  def set_db_access
    if options.force_db_access || ENV['CI']
      options.pegasus_db_access = true
      options.dashboard_db_access = true
    elsif rack_env?(:development)
      options.pegasus_db_access = true if /(localhost|ngrok)/.match?(options.pegasus_domain)
      options.dashboard_db_access = true if /(localhost|ngrok)/.match?(options.dashboard_domain)
    elsif rack_env?(:test)
      options.pegasus_db_access = true if /test/.match?(options.pegasus_domain)
      options.dashboard_db_access = true if /test/.match?(options.dashboard_domain)
    end
  end

  # Sets the configuration for local domains
  def set_config_local
    options.local = options.config ? false : 'true'
    return unless options.local == 'true'

    options.pegasus_domain = 'localhost.code.org:3000'
    options.dashboard_domain = 'localhost-studio.code.org:3000'
    options.hourofcode_domain = 'localhost.hourofcode.com:3000'
    options.csedweek_domain = 'localhost.csedweek.org:3000'
    options.advocacy_domain = 'localhost-advocacy.code.org:3000'
  end
end

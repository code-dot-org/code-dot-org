require 'cdo/config'
require 'cdo/secrets_config'

####################################################################################################
##
## CDO - A singleton that contains application settings and integration helpers.
##
##########
module Cdo
  class Impl < Config
    prepend SecretsConfig
    include Singleton
    @slog = nil

    # Match CDO_*, plus RACK_ENV and RAILS_ENV.
    ENV_PREFIX = /^(CDO|(RACK|RAILS)(?=_ENV))_/

    def initialize
      super
      root = File.expand_path('..', __dir__)
      load_configuration(
        # 1. ENV - environment variables (CDO_*)
        ENV.to_h.select {|k, _| k.match?(ENV_PREFIX)}.transform_keys {|k| k.sub(ENV_PREFIX, '').downcase},
        # 2. locals.yml - local configuration
        "#{root}/locals.yml",
        # 3. globals.yml - [Chef-]provisioned configuration
        "#{root}/globals.yml"
      )

      ENV['RACK_ENV'] = self.env ||= 'development'
      load_configuration(
        # 4. config/env - environment-specific defaults
        "#{root}/config/#{env}.yml.erb",
        # 5. config - global defaults
        "#{root}/config.yml.erb"
      )

      defaults = render("#{root}/config.yml.erb").first
      to_h.keys.each do |key|
        raise "Unknown property not in defaults: #{key}" unless defaults.key?(key.to_sym)
      end
      raise "'#{rack_env}' is not known environment." unless rack_envs.include?(rack_env)
      freeze
    end

    def shared_cache
      CDO_SHARED_CACHE
    end

    def cache
      CDO_CACHE
    end

    def i18n_backend
      CDO_I18N_BACKEND
    end

    def canonical_hostname(domain)
      # Allow hostname overrides
      return override_dashboard if override_dashboard && domain == 'studio.code.org'
      return override_pegasus if override_pegasus && domain == 'code.org'

      return "#{name}.#{domain}" if ['console', 'hoc-levels'].include?(name)
      return domain if rack_env?(:production)

      # our HTTPS wildcard certificate only supports *.code.org
      # 'env', 'studio.code.org' over https must resolve to 'env-studio.code.org' for non-prod environments
      sep = (domain.include?('.code.org')) ? '-' : '.'
      return "localhost#{sep}#{domain}" if rack_env?(:development)
      return "translate#{sep}#{domain}" if name == 'crowdin'
      "#{rack_env}#{sep}#{domain}"
    end

    def dashboard_hostname
      canonical_hostname('studio.code.org')
    end

    def pegasus_hostname
      canonical_hostname('code.org')
    end

    def hourofcode_hostname
      canonical_hostname('hourofcode.com')
    end

    def advocacy_hostname
      canonical_hostname('advocacy.code.org')
    end

    def site_host(domain)
      host = canonical_hostname(domain)
      if (rack_env?(:development) && !https_development) ||
        (ENV['CI'] && host.include?('localhost'))
        port = ['studio.code.org'].include?(domain) ? dashboard_port : pegasus_port
        host += ":#{port}"
      end
      host
    end

    def site_url(domain, path = '', scheme = '')
      path = '/' + path unless path.empty? || path[0] == '/'
      "#{scheme}//#{site_host(domain)}#{path}"
    end

    def studio_url(path = '', scheme = '')
      site_url('studio.code.org', path, scheme)
    end

    def code_org_url(path = '', scheme = '')
      site_url('code.org', path, scheme)
    end

    def advocacy_url(path = '', scheme = '')
      site_url('advocacy.code.org', path, scheme)
    end

    def hourofcode_url(path = '', scheme = '')
      site_url('hourofcode.com', path, scheme)
    end

    def curriculum_url(locale, path = '')
      locale = locale.downcase.to_s
      uri = URI("https://curriculum.code.org")
      path = File.join(locale, path) if curriculum_languages.include? locale
      uri += path
      uri.to_s
    end

    def dir(*dirs)
      File.join(root_dir, *dirs)
    end

    def rack_env?(env)
      rack_env&.to_sym == env.to_sym
    end

    # Sets the slogger to use in a test.
    # slogger must support a `write` method.
    def set_slogger_for_test(slogger)
      @@slog = slogger
      # Set a fake slog token so that the slog method will actually call
      # the test slogger.
      stubs(slog_token: 'fake_slog_token')
    end

    def slog(params)
      return unless slog_token
      require 'dynamic_config/gatekeeper'
      return unless Gatekeeper.allows('slogging', default: true)
      require 'cdo/slog'
      @@slog ||= Slog::Writer.new(secret: slog_token)
      @@slog.write params
    end

    def shared_image_url(path)
      "/shared/images/#{path}"
    end

    # Default logger implementation
    def log=(log)
      @@log = log
    end

    def log
      require 'logger'
      @@log ||= Logger.new(STDOUT).tap do |l|
        l.level = Logger::INFO
        l.formatter = proc do |severity, _, _, msg|
          "#{severity != 'INFO' ? "#{severity}: " : ''}#{msg}\n"
        end
      end
    end

    # Simple backtrace filter
    FILTER_GEMS = %w(rake).freeze

    def backtrace(exception)
      filter_backtrace exception.backtrace
    end

    def filter_backtrace(backtrace)
      FILTER_GEMS.map do |gem|
        backtrace.reject! {|b| b =~ /gems\/#{gem}/}
      end
      backtrace.each do |b|
        b.gsub!(dir, '[CDO]')
        Gem.path.each do |gem|
          b.gsub!(gem, '[GEM]')
        end
        b.gsub! Bundler.system_bindir, '[BIN]'
      end
      backtrace.join("\n")
    end

    # When running on Chef Server, use EC2 API to fetch a dynamic list of app-server front-ends,
    # appending to the static list already provided by configuration files.
    def app_servers
      return super unless chef_managed
      require 'aws-sdk-ec2'
      servers = Aws::EC2::Client.new.describe_instances(
        filters: [
          {name: 'tag:aws:cloudformation:stack-name', values: [stack_name]},
          {name: 'tag:aws:cloudformation:logical-id', values: ['Frontends']},
          {name: 'instance-state-name', values: ['running']}
        ]
      ).reservations.map(&:instances).flatten.map {|i| ["fe-#{i.instance_id}", i.private_dns_name]}.to_h
      servers.merge(self[:app_servers])
    end
  end
end
CDO ||= Cdo::Impl.instance

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

    def javabuilder_url(path = '', scheme = '')
      if rack_env?(:development)
        # Since pegasus and dashboard share the same port, we have a Route53
        # DNS record that redirects requests to localhost. Javabuilder, as a
        # separate service, uses a different port. Therefore, we can access the
        # the service directly.
        'ws://localhost:8080/javabuilder'
      else
        # TODO: Update to use this URL once we have Route53 set up for API Gateway
        # site_url('javabuilder.code.org', '', 'wss')
        'wss://javabuilderpilot.code.org'
      end
    end

    # Get a list of all languages for which we want to link to a localized
    # version of CurriculumBuilder. This list is distinct from the list of
    # languages officially supported by CurriculumBuilder in that there are
    # some languages which we do not update regularly that we'd still like to
    # link to. If in the future we (hopefully) move away from this practice of
    # one-off syncs, we can probably get rid of this helper method.
    def curriculum_languages
      @@curriculum_languages ||= Set[]
      if @@curriculum_languages.count == 0
        # This is the list of languages officially supported by CurriculumBuilder.
        # The source of truth for this list is in a DCDO variable, so we need
        # to retrieve it from there (hence why this method is cached). We also
        # provide a minimal default, in the case where we are unable to
        # retrieve anything.
        curriculumbuilder_languages = DCDO.get("curriculumbuilder_languages",
          [
            ["en-us", "English"],
            ["es-mx", "Mexican Spanish"],
            ["it-it", "Italian"]
          ]
        ).map(&:first)
        @@curriculum_languages.merge(curriculumbuilder_languages)

        # This is a list of additional languages we want to support. These are
        # languages for which there does exist content in that language on
        # curriculum.code.org, but which aren't regularly synced.
        # Be particularly cautious about adding languages to this list; not only is
        # the content for that language not updated regularly, but new content is not
        # added automatically. This means if you try to link to a recently-added
        # lesson plan, it may not be there for any of these languages.
        additional_languages = [
          'de-de', 'id-id', 'ko-kr', 'tr-tr', 'zh-cn', 'zh-tw'
        ]
        @@curriculum_languages.merge(additional_languages)

        # Don't include English; we do of course _support_ English, but only as
        # the default, not as a specific localized language.
        @@curriculum_languages.delete("en-us")
      end

      return @@curriculum_languages
    end

    def curriculum_url(locale, uri = '', autocomplete_partial_path = true)
      return unless uri
      uri = URI.encode(uri)
      uri = URI.parse(uri)

      uri.host = "curriculum.code.org" if uri.host.nil? && autocomplete_partial_path
      uri.scheme = "https" if uri.scheme.nil? && autocomplete_partial_path
      uri.path = '/' + uri.path unless uri.path.start_with?('/')

      if uri.host == "curriculum.code.org"
        locale = locale.downcase.to_s
        uri.path = File.join('', locale, uri.path) if curriculum_languages.include?(locale)
      end

      uri.to_s
    end

    def dir(*dirs)
      File.join(root_dir, *dirs)
    end

    def rack_env?(env)
      rack_env&.to_sym == env.to_sym
    end

    # Identify whether we are executing on the managed test system (test.code.org / test-studio.code.org)
    # to ensure that other systems (such as staging-next or Continuous Integration builds) that are operating
    # with RACK_ENV=test do not carry out actions on behalf of the managed test system.
    def test_system?
      rack_env?(:test) && pegasus_hostname == 'test.code.org'
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

    def filter_backtrace(backtrace, filter_gems: FILTER_GEMS)
      filter_gems.each do |gem|
        backtrace.reject! {|b| b =~ /gems\/#{gem}/}
      end
      backtrace.each do |b|
        b.gsub!(dir, '[CDO]')
        Gem.path.each do |gem|
          b.gsub!(/#{gem}(\/gems|\/bundler\/gems)?/, '[GEM]')
        end
        b.gsub! Bundler.system_bindir, '[BIN]'
        b.gsub! RbConfig::CONFIG['rubylibdir'], '[RUBY]'
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

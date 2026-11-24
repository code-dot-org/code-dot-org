require 'user_agent_parser'
require 'cdo/shared_constants'

class UserAgentParser::UserAgent
  def mobile?
    name.include?('Mobile')
  end

  def chrome?
    name == 'Chrome'
  end

  def safari?
    name == 'Safari' || name == 'Mobile Safari'
  end

  def ie?
    name == 'IE'
  end

  def firefox?
    name == 'Firefox'
  end

  def opera?
    name == 'Opera'
  end

  # https://support.code.org/hc/en-us/articles/202591743
  # has the list of browsers we support
  def cdo_unsupported?
    return false if version.nil?
    ver = version.major.to_i

    return true if ie? && ver < 8
    return true if firefox? && ver < 24
    return true if opera? && ver < 12
    return true if safari? && (ver < 6 || version.to_s =~ /^6\.0/)
    return true if chrome? && ver < 32

    # Default: no browser support warning
    false
  end
end

module Cdo
  class UserAgentParser < ::UserAgentParser::Parser
    # Matches the token the mobile app adds to its web view's user agent:
    # name/version, then the install source in parentheses when the
    # platform records one, e.g. an Android package or iOS bundle ID.
    #
    # @example
    #   "CodeAIMobileApp/1.0.0 (com.amazon.venezia)"
    #   "CodeAIMobileApp/1.0.0"
    #
    # @see frontend/apps/mobile/android/app/src/main/kotlin/org/codeai/SitePolicy.kt
    APP_TOKEN = %r{\b(?<name>#{Regexp.escape(SharedConstants::MOBILE_APP_NAME)})/(?<version>\d[\w.+-]{0,39})(?: \((?<install_source>[\w.-]{1,100})\))?}

    App = Data.define(*APP_TOKEN.names)

    module UserAgentApp
      attr_accessor :app

      def to_h
        super.merge(app: app&.to_h)
      end
    end

    def self.parse(user_agent, **args)
      new(**args).parse(user_agent)
    end

    def parse(user_agent)
      super.extend(UserAgentApp).tap do |agent|
        agent.app = parse_app(user_agent)
      end
    end

    # Reads the CodeAI app's token from a user agent.
    #
    # @param user_agent [String, nil] a request's User-Agent header.
    # @return [App, nil] the app's name, version and install source, the
    #   last nil when the platform records no installer; nil when the user
    #   agent has no token, as from a browser.
    # @example
    #   Cdo::UserAgentParser.new.parse_app('... Safari/537.36 CodeAIMobileApp/1.0.0 (com.amazon.venezia)')
    #   # => #<data Cdo::UserAgentParser::App name="CodeAIMobileApp", version="1.0.0", install_source="com.amazon.venezia">
    def parse_app(user_agent)
      app_info = APP_TOKEN.match(user_agent.to_s)
      App.new(**app_info.named_captures) if app_info
    end
  end
end

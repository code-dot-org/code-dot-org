require 'ipaddr'
require 'net/http'
require 'nokogiri'
require 'openssl'
require 'resolv'
require 'uri'
require 'yaml'

module Services
  module TeacherDirectoryVerification
    class DirectoryLookup
      MAX_FETCHES = 5
      MAX_RESPONSE_BYTES = 1.megabyte
      BLOCKED_CIDRS = %w[
        0.0.0.0/8
        10.0.0.0/8
        100.64.0.0/10
        127.0.0.0/8
        169.254.0.0/16
        172.16.0.0/12
        192.0.0.0/24
        192.0.2.0/24
        192.168.0.0/16
        198.18.0.0/15
        198.51.100.0/24
        203.0.113.0/24
        224.0.0.0/4
        240.0.0.0/4
        ::/128
        ::1/128
        ::ffff:0:0/96
        2001:db8::/32
        fc00::/7
        fe80::/10
        ff00::/8
      ].map {|range| IPAddr.new(range)}.freeze

      def self.call(school:, email:)
        return if school.nil? || email.blank?

        configured_urls(school).first(MAX_FETCHES).each do |url|
          document = fetch_document(url)
          next unless document

          match = exact_email_match(document, email)
          next unless match

          return {
            url: url,
            title: document.at('title')&.text.to_s.squish.truncate(255),
            email: match,
          }
        end

        nil
      end

      def self.configured_urls(school)
        config_path = Rails.root.join('config/teacher_directory_verification_directories.yml')
        config = YAML.safe_load_file(config_path, aliases: false)
        school_urls = Array(config.dig('schools', school.id.to_s))
        district_urls = Array(config.dig('districts', school.school_district_id.to_s))
        (school_urls + district_urls).uniq
      end

      def self.fetch_document(url)
        uri, address = safe_uri(url)
        return unless uri

        request = Net::HTTP::Get.new(uri.request_uri)
        request['Accept'] = 'text/html'
        request['User-Agent'] = 'Code.org teacher directory verification'

        http = Net::HTTP.new(uri.host, uri.port, nil)
        http.ipaddr = address
        http.use_ssl = true
        http.verify_mode = OpenSSL::SSL::VERIFY_PEER
        http.open_timeout = 3
        http.read_timeout = 5
        http.max_retries = 0 if http.respond_to?(:max_retries=)

        body = +''
        content_type = nil
        status = nil
        response_too_large = false
        catch(:response_too_large) do
          http.start do |client|
            client.request(request) do |response|
              status = response.code.to_i
              content_type = response['content-type']
              response.read_body do |chunk|
                if body.bytesize + chunk.bytesize > MAX_RESPONSE_BYTES
                  response_too_large = true
                  throw :response_too_large
                end
                body << chunk
              end
            end
          end
        end

        return if response_too_large
        return unless status == 200 && content_type.to_s.downcase.start_with?('text/html')

        Nokogiri::HTML(body)
      rescue SocketError, Timeout::Error, IOError, SystemCallError, OpenSSL::SSL::SSLError
        nil
      end

      def self.safe_uri(url)
        return unless url.is_a?(String)

        uri = URI.parse(url)
        return unless uri.is_a?(URI::HTTPS)
        return unless uri.port == 443 && uri.userinfo.nil? && uri.host.present?
        return if uri.host.end_with?('.localhost', '.local', '.internal', '.test')

        begin
          IPAddr.new(uri.host)
          return
        rescue IPAddr::InvalidAddressError
          # Directory hosts are DNS names, not literal IP addresses.
        end

        addresses = Resolv.getaddresses(uri.host)
        return if addresses.empty?
        return unless addresses.all? {|address| public_address?(address)}

        [uri, addresses.first]
      rescue URI::InvalidURIError, Resolv::ResolvError
        nil
      end

      def self.public_address?(address)
        ip = IPAddr.new(address)
        BLOCKED_CIDRS.none? {|range| range.include?(ip)}
      rescue IPAddr::InvalidAddressError
        false
      end

      def self.exact_email_match(document, email)
        document.css('script, style, noscript').remove
        visible_text = document.text.to_s
        mailto_links = document.css('a[href^="mailto:"]').map do |link|
          [link['href'], link.text, link.parent&.text]
        end.flatten.compact.join(' ')
        pattern = /(?<![A-Z0-9._%+-])#{Regexp.escape(email)}(?![A-Z0-9._%+-])/i

        [visible_text, mailto_links].each do |text|
          match = text.match(pattern)
          return match[0] if match
        end

        nil
      end
      private_class_method :configured_urls, :fetch_document, :safe_uri, :public_address?, :exact_email_match
    end
  end
end

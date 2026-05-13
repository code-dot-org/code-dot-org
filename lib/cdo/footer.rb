require 'cdo/global_edition'

module Cdo
  class Footer
    def self.relative_url?(url)
      url.start_with?('/')
    end

    def self.get_footer_contents(options)
      # Get the 'footer' section from the requested region
      ge_region = options[:ge_region] || :root
      footer_config = Cdo::GlobalEdition.configuration_for(ge_region)[:footer] || {}
      site = options[:site] || :code_org
      footer_links = footer_config.dig(:links, site) || []

      # We allow an override of the translation method (defaults to I18n.t)
      i18n = options[:i18n] || ::I18n.method(:t)

      privacy_updated = DCDO.get('recent_privacy_policy_update', nil)

      footer_links.map do |link|
        link = link.dup

        # Remember the locale key
        link[:key] = link[:title]
        if privacy_updated && link[:title] == 'privacy'
          link[:title] = 'privacy_updated'
        end

        if link[:domain] == 'studio.code.org'
          link[:url] = CDO.studio_url(link[:url]) if relative_url?(link[:url])
        elsif link[:domain] == 'code.org'
          link[:url] = CDO.code_org_url(link[:url]) if relative_url?(link[:url])
        else
          # It is an external link, so appropriately mark its follow rules
          link[:rel] = "noopener noreferrer nofollow"
        end

        # Localize
        loc_prefix = link[:loc_prefix] || options[:loc_prefix]
        link[:title] = i18n.call("#{loc_prefix}#{link[:key]}")
        link
      end
    end
  end
end

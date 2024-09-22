# This class provides the content for help menu in the header.

require 'cdo/global'

class HelpHeader
  def self.get_help_contents(options)
    loc_prefix = options[:loc_prefix]

    ge_region = options[:ge_region] || :root
    ge_config = Cdo::Global.configuration_for(ge_region)[:header] || {}
    ge_help_config = ge_config[:help] || {}

    # Determine, if possible, the report_bug link for the current page, and
    # whether or not there is a report_abuse link
    report_url = nil
    report_abuse = false
    if options[:level] || options[:script_level]
      report_url = options[:script_level] ?
        options[:script_level].report_bug_url(options[:request]) :
        options[:level].report_bug_url(options[:request])
      report_abuse = true
    elsif options[:lesson]
      report_url = options[:lesson].report_bug_url(options[:request])
    end

    # Gather the entries from the regional configuration
    ge_help_config.filter_map do |link|
      link = link.dup

      next nil if link[:level] && (!options[:level] || Game.find_by_name(link[:level]) != options[:level].game)
      next nil if link[:user_type] && link[:user_type] != options[:user_type]
      next nil if link[:title] == 'report_abuse' && !report_abuse

      # Handle the 'report_bug' link as a special case
      if link[:title] == 'report_bug' && report_url
        link[:url] = report_url
      end

      # Always open 'help' links in their own windows
      link[:target] = "_blank"

      # Add the appropriate domains to the links
      if link[:domain] == 'studio.code.org'
        link[:url] = CDO.studio_url(link[:url])
      elsif link[:domain] == 'code.org'
        link[:url] = CDO.code_org_url(link[:url])
      else
        # We want help links to open in a new window so students can refer to them in parallel with their code.
        # However, there are security (and performance) risks to opening links in new windows.
        # The security risks are partially mitigated by setting the rel attribute to "noopener noreferrer nofollow",
        #
        # 'noreferrer' prevents the next page to get the address of our page
        # https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noreferrer
        # 'noopener' prevents the next page to see any context of our page
        # https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noopener
        # The nofollow rule is for crawlers such that they do not click the link
        # and associate the two pages in, say, search results.
        link[:rel] = "noopener noreferrer nofollow"
      end

      # Translate the title
      link[:title] = I18n.t("#{loc_prefix}#{link[:title]}")
      link
    end
  end
end

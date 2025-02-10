# This class provides the content for both the hamburger and the header.
#
# As part of this content, it also provides CSS classes which determine
# responsive visibility for the header itself and the items inside it.

require 'cdo/global_edition'

require_relative 'help_header'

class Hamburger
  # These are the CSS classes applied to items in the hamburger,
  # and to the hamburger itself.
  SHOW_ALWAYS = "show-always".freeze
  HIDE_ALWAYS = "hide-always".freeze
  SHOW_MOBILE = "show-mobile".freeze
  HIDE_MOBILE = "hide-mobile".freeze
  SHOW_SMALL_DESKTOP = "show-small-desktop".freeze
  HIDE_SMALL_DESKTOP = "hide-small-desktop".freeze

  def self.get_divider_visibility(above_section_visibility, below_section_visibility)
    return HIDE_ALWAYS if above_section_visibility == HIDE_ALWAYS || below_section_visibility == HIDE_ALWAYS
    return SHOW_SMALL_DESKTOP if above_section_visibility == SHOW_SMALL_DESKTOP || below_section_visibility == SHOW_SMALL_DESKTOP
    return SHOW_MOBILE if above_section_visibility == SHOW_MOBILE || below_section_visibility == SHOW_MOBILE
    return SHOW_ALWAYS
  end

  def self.get_visibility(options)
    show_teacher_options = HIDE_ALWAYS
    show_student_options = HIDE_ALWAYS
    show_pegasus_options = HIDE_ALWAYS
    show_intl_about = SHOW_MOBILE
    show_help_options = SHOW_SMALL_DESKTOP

    if options[:level]
      # The header is taken over by level-related UI, so we need the hamburger
      # to show whatever would show up in the header at desktop (and mobile) widths.

      case options[:user_type]
      when 'teacher'
        show_teacher_options = SHOW_ALWAYS
        show_help_options = SHOW_MOBILE
      when 'student'
        show_student_options = SHOW_ALWAYS
        show_help_options = SHOW_MOBILE
      end

      # Regardless of user type, then they also need the pegasus
      # options in the hamburger.
      show_pegasus_options = SHOW_ALWAYS

    else
      # The header is available for showing whichever options we want, but they should
      # appear in the hamburger at mobile widths.
      case options[:user_type]
      when 'teacher'
        show_teacher_options = SHOW_MOBILE
        show_help_options = SHOW_MOBILE
      when 'student'
        show_student_options = SHOW_MOBILE
        show_help_options = SHOW_MOBILE
      end

      # We want to show the pegasus options.  They're in the hamburger for desktop
      # if they didn't fit on the header, or they're just in it for mobile if they did.
      show_pegasus_options =
        (options[:user_type] == "teacher" || options[:user_type] == "student" || options[:level]) ? SHOW_ALWAYS : SHOW_SMALL_DESKTOP
    end

    # Do we show hamburger on all widths, only mobile, or not at all?
    show_set = [show_teacher_options, show_student_options, show_pegasus_options]
    hamburger_class =
      if show_set.include? SHOW_ALWAYS
        SHOW_ALWAYS
      elsif show_set.include? SHOW_MOBILE
        SHOW_MOBILE
      elsif show_set.include? SHOW_SMALL_DESKTOP
        SHOW_SMALL_DESKTOP
      else
        HIDE_ALWAYS
      end

    # Return the various visibility styles.
    {
      hamburger_class: hamburger_class,
      show_teacher_options: show_teacher_options,
      show_student_options: show_student_options,
      show_pegasus_options: show_pegasus_options,
      show_intl_about: show_intl_about,
      show_help_options: show_help_options
    }
  end

  def self.get_hamburger_contents(options)
    loc_prefix = options[:loc_prefix]
    is_teacher_or_student = options[:user_type] == "teacher" || options[:user_type] == "student"
    is_level = options[:level]

    ge_region = Cdo::GlobalEdition.region_available?(options[:ge_region]) ? options[:ge_region] : :root
    ge_config = Cdo::GlobalEdition.configuration_for(ge_region)[:header] || {}
    ge_hamburger_config = ge_config[:hamburger] || {}

    # Get visibility CSS.
    visibility_options = {level: options[:level], language: options[:language], user_type: options[:user_type]}
    visibility = Hamburger.get_visibility(visibility_options)

    # We will build on the menu items here
    entries = []

    # We negotiate the region configuration for the hamburger items
    hamburger_links = ge_hamburger_config[:teacher] || {}
    if options[:user_type] == "student"
      hamburger_links = ge_hamburger_config[:student] || {}
    end
    hamburger_items = hamburger_links.map {|item| item[:title]}

    # Then, we get the header contents, which we put into the hamburger menu
    # when the width prohibits their visibility
    header_links = get_header_contents(options)
    header_items = header_links.map {|item| item[:key]}

    # Then we add those first, with the proper visibility
    # When we find a header entry that matches a hamburger option, we omit
    # it in the hamburger menu unless it has mobile visibility
    header_links_visibility = visibility[:show_teacher_options]
    if options[:user_type] == "student"
      header_links_visibility = visibility[:show_student_options]
    end
    entries.concat(header_links.filter_map do |header_link|
      # Ignore if it is already in the hamburger items
      next nil if hamburger_items.include?(header_link[:key])

      # Convert 'hide' into 'show' to invert the visibility logic
      # so that we 'show' the hamburger options when we 'hide' the
      # header links
      header_link[:class] = header_link[:class].gsub("hide", "show")

      if header_link[:class].include?('show-small-desktop')
        header_links_visibility = SHOW_SMALL_DESKTOP
      end

      # Ensure a unique id that is prepended with 'hamburger-'
      header_link[:id] = "hamburger-#{header_link[:id]}" if header_link[:id]
      if options[:user_type] == "teacher"
        header_link[:class] = "#{header_link[:class]} #{visibility[:show_teacher_options]}"
      elsif options[:user_type] == "student"
        header_link[:class] = "#{header_link[:class]} #{visibility[:show_student_options]}"
      end

      header_link
    end
)

    if options[:user_type] == "teacher"
      entries << {type: "divider", class: get_divider_visibility(header_links_visibility, visibility[:show_help_options]), id: "after-teacher"}
    elsif options[:user_type] == "student"
      entries << {type: "divider", class: get_divider_visibility(header_links_visibility, visibility[:show_help_options]), id: "after-student"}
    end

    # Show help links before Pegasus links for signed in users.
    help_contents = HelpHeader.get_help_contents(options)
    if is_teacher_or_student
      entries.concat(help_contents.each do |e|
        e[:class] = visibility[:show_help_options]
        # Ensure a unique id that is prepended with 'hamburger-'
        e[:id] = "hamburger-#{e[:id]}" if e[:id]
      end
)
      entries << {type: "divider", class: get_divider_visibility(visibility[:show_help_options], visibility[:show_pegasus_options]), id: "after-help"}
    end

    # For each one, we localize the link contents and add it to our list
    entries.concat(hamburger_links.map do |link|
      link = link.dup

      # This item is also in the header, give it the same visibility class
      # so that it appears when the header items disappear.
      header_index = header_items.index(link[:title])
      unless header_index.nil?
        link[:class] = header_links[header_index][:class]
        # Invert the visibility
        link[:class] = link[:class].gsub("hide", "show")
      end

      link[:title] = I18n.t("#{loc_prefix}#{link[:title]}")
      if link[:domain] == 'studio.code.org'
        link[:url] = CDO.studio_url(link[:url])
      elsif link[:domain] == 'code.org'
        link[:url] = CDO.code_org_url(link[:url])
      end

      # Also handle subentries
      if link[:subentries]
        link[:subentries] = link[:subentries].filter_map do |sublink|
          sublink = sublink.dup
          if sublink[:domain] == 'studio.code.org'
            sublink[:url] = CDO.studio_url(sublink[:url])
          elsif sublink[:domain] == 'code.org'
            sublink[:url] = CDO.code_org_url(sublink[:url])
          end

          # Also handle subentries that are already header items and make sure those
          # do not appear in the submenu.
          header_index = header_items.index(sublink[:title])
          next nil unless header_index.nil?

          # Localize the title
          sublink[:title] = I18n.t("#{loc_prefix}#{sublink[:title]}")
          sublink
        end
      end

      link
    end
)

    # Show help links at the bottom of the list for signed out users.
    unless is_teacher_or_student
      entries << {type: "divider", class: get_divider_visibility(visibility[:show_help_options], visibility[:show_pegasus_options]) + (is_level ? "  hide-large-desktop" : ""), id: "before-help"}
      entries.concat(help_contents.each {|e| e[:class] = visibility[:show_help_options]})
    end

    {entries: entries, visibility: visibility[:hamburger_class]}
  end

  # Main header navigation links next to the Code.org logo.
  def self.get_header_contents(options)
    loc_prefix = options[:loc_prefix]

    ge_region = Cdo::GlobalEdition.region_available?(options[:ge_region]) ? options[:ge_region] : :root
    ge_config = Cdo::GlobalEdition.configuration_for(ge_region)[:header] || {}
    ge_top_config = ge_config[:top] || {}

    links = ge_top_config[:signed_out] || []
    if options[:user_type] == "teacher"
      links = ge_top_config[:teacher] || []
    elsif options[:user_type] == "student"
      links = ge_top_config[:student] || []
    end

    # Translate the titles and create fully-formed URLs
    links = links.map.with_index do |info, i|
      if info.is_a? Hash
        info = info.dup
        info[:key] = info[:title]
        i18n_prefix = info[:loc_prefix] || loc_prefix
        info[:title] = I18n.t("#{i18n_prefix}#{info[:title]}")
        if info[:domain] == 'studio.code.org'
          info[:url] = CDO.studio_url(info[:url])
        elsif info[:domain] == 'code.org'
          info[:url] = CDO.code_org_url(info[:url])
        end
      end

      # Only show three options when small
      # We have a 'hide-small-desktop' which hides it when the width gets to be small
      # And, confusingly, a 'show-small-desktop' which is for things that
      # show up when the width is *very* small
      # Specifying both will cause it to disappear for medium width but also
      # continue to appear in very small widths.
      #
      # The exact rule here is: collapse all but the first 3 links when there are
      # 6 or more links total
      info[:class] = if i > 2 && links.length > 5
                       HIDE_SMALL_DESKTOP
                     else
                       HIDE_MOBILE
                     end
      info
    end

    links
  end
end

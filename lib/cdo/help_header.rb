# This class provides the content for help menu in the header.

class HelpHeader
  def self.get_help_contents(options)
    loc_prefix = options[:loc_prefix]

    entries = []

    # Help-related.

    if options[:level] && options[:level].game == Game.gamelab
      entries << {
        title: I18n.t("#{loc_prefix}game_lab_documentation"),
        url: "https://docs.code.org/gamelab/",
        id: "gamelab-docs"
      }

      entries << {
        title: I18n.t("#{loc_prefix}game_lab_tutorials"),
        url: CDO.code_org_url('/educate/gamelab'),
        id: "gamelab-tutorials"
      }
    end

    if options[:level] && options[:level].game == Game.applab
      entries << {
        title: I18n.t("#{loc_prefix}app_lab_documentation"),
        url: "https://docs.code.org/applab/",
        id: "applab-docs"
      }

      entries << {
        title: I18n.t("#{loc_prefix}app_lab_tutorials"),
        url: CDO.code_org_url('/educate/applab'),
        id: "applab-tutorials"
      }
    end

    if options[:level] && options[:level].game == Game.spritelab
      entries << {
        title: I18n.t("#{loc_prefix}sprite_lab_documentation"),
        url: "https://docs.code.org/spritelab/",
        id: "spritelab-docs"
      }

      entries << {
        title: I18n.t("#{loc_prefix}sprite_lab_tutorials"),
        url: CDO.code_org_url('/educate/spritelab'),
        id: "spritelab-tutorials"
      }
    end

    if options[:level] || options[:script_level]
      report_url = options[:script_level] ?
        options[:script_level].report_bug_url(options[:request]) :
        options[:level].report_bug_url(options[:request])
      entries << {
        title: I18n.t("#{loc_prefix}report_bug"),
        url: report_url,
        id: "report-bug",
        target: "_blank"
      }
    else
      entries << {
        title: I18n.t("#{loc_prefix}report_bug"),
        url: "https://support.code.org/hc/en-us/requests/new",
        id: "report-bug",
        target: "_blank"
      }
    end

    entries << {
      title: I18n.t("#{loc_prefix}help_support"),
      url: "https://support.code.org",
      id: "support",
      target: "_blank"
    }

    if options[:user_type] == "teacher"
      entries << {
        title: I18n.t("#{loc_prefix}teacher_community"),
        url: "http://forum.code.org/",
        target: "_blank",
        id: "teacher-community"
      }
    end

    entries
  end
end

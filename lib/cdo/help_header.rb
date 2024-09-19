# This class provides the content for help menu in the header.

class HelpHeader
  def self.get_help_contents(options)
    loc_prefix = options[:loc_prefix]

    ge_region = options[:ge_region]
    ge_config = Cdo::Global.configuration_for(ge_region)[:header] || {}
    ge_help_config = ge_config[:'help-menu'] || {}

    entries = []

    # Help-related.

    if options[:level] && options[:level].game == Game.gamelab
      if ge_help_config[:'gamelab-documentation'] != false
        entries << {
          title: I18n.t("#{loc_prefix}game_lab_documentation"),
          url: "https://studio.code.org/docs/gamelab/",
          id: "gamelab-docs"
        }
      end

      if ge_help_config[:'gamelab-tutorials'] != false
        entries << {
          title: I18n.t("#{loc_prefix}game_lab_tutorials"),
          url: CDO.code_org_url('/educate/gamelab'),
          id: "gamelab-tutorials"
        }
      end
    end

    if options[:level] && options[:level].game == Game.applab
      if ge_help_config[:'applab-documentation'] != false
        entries << {
          title: I18n.t("#{loc_prefix}app_lab_documentation"),
          url: "https://studio.code.org/docs/applab/",
          id: "applab-docs"
        }
      end

      if ge_help_config[:'applab-tutorials'] != false
        entries << {
          title: I18n.t("#{loc_prefix}app_lab_tutorials"),
          url: CDO.code_org_url('/educate/applab'),
          id: "applab-tutorials"
        }
      end
    end

    if options[:level] && options[:level].game == Game.spritelab
      if ge_help_config[:'spritelab-documentation'] != false
        entries << {
          title: I18n.t("#{loc_prefix}sprite_lab_documentation"),
          url: "https://studio.code.org/docs/spritelab/",
          id: "spritelab-docs"
        }
      end

      if ge_help_config[:'spritelab-tutorials'] != false
        entries << {
          title: I18n.t("#{loc_prefix}sprite_lab_tutorials"),
          url: CDO.code_org_url('/educate/spritelab'),
          id: "spritelab-tutorials"
        }
      end
    end

    if options[:level] && options[:level].game == Game.weblab && (ge_help_config[:'weblab-documentation'] != false)
      entries << {
        title: I18n.t("#{loc_prefix}web_lab_documentation"),
        url: "https://studio.code.org/docs/ide/weblab/",
        id: "weblab-docs"
      }
    end

    if options[:level] && options[:level].game == Game.music && (ge_help_config[:'musiclab-documentation'] != false)
      entries << {
        title: I18n.t("#{loc_prefix}music_lab_documentation"),
        url: "/docs/ide/music",
        id: "musiclab-docs"
      }
    end

    if ge_help_config[:support] != false
      entries << {
        title: I18n.t("#{loc_prefix}help_support"),
        url: "https://support.code.org",
        id: "support",
        target: "_blank"
      }
    end

    if options[:level] || options[:script_level]
      report_url = options[:script_level] ?
        options[:script_level].report_bug_url(options[:request]) :
        options[:level].report_bug_url(options[:request])
      if ge_help_config[:'report-bug'] != false
        entries << {
          title: I18n.t("#{loc_prefix}report_bug"),
          url: report_url,
          id: "report-bug"
        }
      end
      if ge_help_config[:'report-abuse'] != false
        entries << {
          title: I18n.t("#{loc_prefix}report_abuse"),
          url: "/report_abuse",
          id: "report-abuse"
        }
      end
    elsif options[:lesson]
      report_url = options[:lesson].report_bug_url(options[:request])
      if ge_help_config[:'report-bug'] != false
        entries << {
          title: I18n.t("#{loc_prefix}report_bug"),
          url: report_url,
          id: "report-bug"
        }
      end
    else
      if ge_help_config[:'report-bug'] != false
        entries << {
          title: I18n.t("#{loc_prefix}report_bug"),
          url: "https://support.code.org/hc/en-us/requests/new",
          id: "report-bug"
        }
      end
    end

    if options[:user_type] == "teacher" && (ge_help_config[:'teacher-forum'] != false)
      entries << {
        title: I18n.t("#{loc_prefix}teacher_community"),
        url: "http://forum.code.org/",
        id: "teacher-community"
      }
    end

    # We want help links to open in a new window so students can refer to them in parallel with their code.
    # However, there are security (and performance) risks to opening links in new windows.
    # The current set of links are safe because they are internal.
    # Adding external links to this help menu should be avoided while we are setting "target = _blank".
    # The security risks are partially mitigated by setting the rel attribute to "noopener noreferrer nofollow",
    # but not all browsers support these -- see these docs for more details:
    # https://developers.google.com/web/tools/lighthouse/audits/noopener
    entries.each do |entry|
      entry[:target] = "_blank"
      # We don't need to protect against cross-site issues if we are staying on our own site. We should avoid adding
      # these protections because we use them. For example, the report abuse page uses the referrer attribute to know
      # which page the user probably wants to report.
      entry[:rel] = "noopener noreferrer nofollow" unless URI(entry[:url]).host.
        blank?
    end
    entries
  end
end

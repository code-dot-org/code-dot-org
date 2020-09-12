require_relative '../../lib/cdo/github'

IN_UP_BRANCH = "i18n-sync-in-up-#{Date.today.strftime('%m-%d-%Y')}".freeze
DOWN_OUT_BRANCH = "i18n-sync-down-out-#{Date.today.strftime('%m-%d-%Y')}".freeze

class CreateI18nPullRequests
  def self.in_and_up
    `git checkout -B #{IN_UP_BRANCH}`

    I18nScriptUtils.git_add_and_commit(
      [
        "dashboard/config/locales/*.en.yml",
        "i18n/locales/source/dashboard"
      ],
      "dashboard i18n sync"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "i18n/locales/source/course_content"
      ],
      "course content i18n sync"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "i18n/locales/source/pegasus",
      ],
      "pegasus i18n sync"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "i18n/locales/source/blockly-mooc",
      ],
      "apps i18n sync"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "i18n/locales/source/animations"
      ],
      "animation library i18n sync"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "i18n/locales/source/hourofcode/",
      ],
      "hoc i18n sync"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "i18n/locales/source/markdown/",
      ],
      "pegasus markdown i18n sync"
    )

    `git push origin #{IN_UP_BRANCH}`
    in_up_pr = GitHub.create_pull_request(
      base: 'staging',
      head: IN_UP_BRANCH,
      body: File.read(File.join(__dir__, 'templates/i18n_sync_in_up.md')),
      title: "I18n sync In & Up #{Date.today.strftime('%m/%d')}"
    )
    GitHub.label_pull_request(in_up_pr, ["i18n"])
    puts "Created In & Up PR: #{GitHub.url(in_up_pr)}"
  end

  def self.down_and_out
    `git checkout -B #{DOWN_OUT_BRANCH}`

    I18nScriptUtils.git_add_and_commit(
      [
        "bin/i18n/crowdin/*etags.json"
      ],
      "etags updates"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "pegasus/cache",
        "i18n/locales/*-*/pegasus",
      ],
      "pegasus i18n updates"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "pegasus/sites.v3/code.org/i18n",
      ],
      "pegasus i18n markdown updates"
    )

    # Break up the dashboard changes, since they frequently end up being large
    # enough to have trouble viewing in github
    Languages.get_crowdin_name_and_locale.each do |prop|
      locale = prop[:locale_s]
      next if locale == 'en-US'
      I18nScriptUtils.git_add_and_commit(
        [
          "dashboard/config/locales/*#{locale}.json",
          "dashboard/config/locales/*#{locale}.yml",
          "i18n/locales/#{locale}/dashboard",
        ],
        "dashboard i18n updates - #{prop[:crowdin_name_s]}"
      )
    end

    I18nScriptUtils.git_add_and_commit(
      [
        "apps/i18n/*/*.json",
        "i18n/locales/*-*/blockly-mooc",
      ],
      "apps i18n updates"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "apps/lib/blockly/*.js",
        "i18n/locales/*-*/blockly-core",
      ],
      "blockly i18n updates"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "i18n/locales/*-*/animations"
      ],
      "animation library i18n updates"
    )

    I18nScriptUtils.git_add_and_commit(
      [
        "i18n/locales/*-*/hourofcode/",
        "pegasus/sites.v3/hourofcode.com/i18n/*.yml",
        "pegasus/sites.v3/hourofcode.com/i18n/public/*/"
      ],
      "hoc i18n updates"
    )

    `git push origin #{DOWN_OUT_BRANCH}`
    down_out_pr = GitHub.create_pull_request(
      base: 'staging',
      head: DOWN_OUT_BRANCH,
      body: File.read(File.join(__dir__, 'templates/i18n_sync_down_out.md')),
      title: "I18n sync Down & Out #{Date.today.strftime('%m/%d')}"
    )
    GitHub.label_pull_request(down_out_pr, ["i18n"])

    puts "Created Down & Out PR: #{GitHub.url(down_out_pr)}"
  end
end

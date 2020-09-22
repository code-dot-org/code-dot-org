module CourseBlockHelper
  class << self
    include Rails.application.routes.url_helpers
    include LocaleHelper
  end

  # Given a Script ID or string and an optional course family name, returns
  # an object that represents a tall course block (_course_tall_block.haml), if
  # one exists.
  #
  # Example return value:
  # {
  #   url: "https://my.url",
  #   title: "Tall Course Block",
  #   body: "Click to find out more!",
  #   teacher_guide: "https://my.teacher/guide",
  #   image_url: "https://my.image",
  #   audience: "Pre-reader"
  # }
  #
  def self.get_tall_course_block(id, family_name = nil)
    default = {
      url: script_url(id),
      title: I18n.t("upsell.#{id}.title"),
      body: I18n.t("upsell.#{id}.body"),
      image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
    }

    block_override_data = {
      'applab' => {
        url: CDO.code_org_url('/educate/applab'),
        body: I18n.t('upsell.applab.body_short')
      },
      'gamelab' => {
        url: CDO.code_org_url('/educate/gamelab'),
        body: I18n.t('upsell.gamelab.body')
      },
      'weblab' => {
        url: CDO.code_org_url('/educate/weblab'),
        title: "Web Lab",
        body: I18n.t('upsell.weblab.body')
      },
      'conditionals' => {
        url: CDO.code_org_url('/hourofcode/unplugged-conditionals-with-cards'),
        title: I18n.t('upsell.unplugged_conditionals.title'),
        body: I18n.t('upsell.unplugged_conditionals.body'),
        teacher_guide: CDO.code_org_url("/hourofcode/unplugged-conditionals-with-cards")
      },
      Script::APPLAB_INTRO => {
        url: script_reset_url(Script::APPLAB_INTRO),
        title: I18n.t('upsell.applab.title'),
        body: I18n.t('upsell.applab.body_short')
      },
      Script::ARTIST_NAME => {
        url: script_reset_url(Script::ARTIST_NAME),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/artist")
      },
      Script::COURSE1_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Script::COURSE2_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Script::COURSE3_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Script::COURSE4_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Script::COURSEA_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Script::COURSEB_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Script::COURSEC_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Script::COURSED_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Script::COURSEE_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Script::COURSEF_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Script::DANCE_PARTY_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/dance'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.gif")
      },
      Script::DANCE_PARTY_2019_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/dance'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.gif")
      },
      Script::FLAPPY_NAME => {
        url: script_reset_url(id),
        teacher_guide: CDO.code_org_url("/hourofcode/flappy")
      },
      Script::FROZEN_NAME => {
        url: script_reset_url(id),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/frozen")
      },
      Script::HOC_ENCRYPTION_NAME => {
        url: script_reset_url(id),
        teacher_guide: "https://curriculum.code.org/hoc/2016/2/"
      },
      Script::HOC_NAME => {
        url: script_reset_url(id),
        title: I18n.t("upsell.hoc.title"),
        body: I18n.t("upsell.hoc.body"),
        teacher_guide: CDO.code_org_url("/hourofcode/hourofcode")
      },
      Script::INFINITY_NAME => {
        url: script_reset_url(id),
        body: data_t_suffix('script.name', id, 'description_short'),
        title: I18n.t('upsell.infinity.title'),
        teacher_guide: CDO.code_org_url("/hourofcode/infinity")
      },
      Script::MINECRAFT_AQUATIC_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/api/hour/begin/mc')
      },
      Script::MINECRAFT_DESIGNER_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/api/hour/begin/mc')
      },
      Script::MINECRAFT_HERO_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/api/hour/begin/mc')
      },
      Script::MINECRAFT_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/api/hour/begin/mc')
      },
      Script::PLAYLAB_NAME => {
        url: CDO.code_org_url('/playlab'),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/playlab")
      },
      Script::SPORTS_NAME => {
        url: CDO.code_org_url('/athletes')
      },
      Script::STARWARS_BLOCKS_NAME => {
        url: CDO.code_org_url('/starwars'),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/starwars")
      },
      Script::STARWARS_NAME => {
        url: CDO.code_org_url('/starwars'),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/starwars")
      },
      Script::TEXT_COMPRESSION_NAME => {
        url: script_reset_url(id),
        teacher_guide: "https://curriculum.code.org/hoc/2016/1/"
      },
      Script::TWENTY_HOUR_NAME => {
        title: I18n.t('upsell.20hour.title'),
        body: I18n.t('upsell.20hour.body')
      },
      Script::OCEANS_NAME => {
        url: CDO.code_org_url('/oceans'),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short')
      }
    }

    # The CourseA-F families should all be rendered the same.
    if [Script::COURSEA, Script::COURSEB, Script::COURSEC, Script::COURSED, Script::COURSEE, Script::COURSEF].include? family_name
      return {
        url: script_url(id),
        image_url: CDO.shared_image_url("courses/logo_tall_#{family_name}.jpg"),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      }
    end

    default.merge!(block_override_data[id] || {})
  end
end

module CourseBlockHelper
  class << self
    include Rails.application.routes.url_helpers
    include LocaleHelper
  end

  # Given a Unit ID or string and an optional course family name, returns
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
      image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg"),
      image_alt: I18n.t("upsell.#{id}.image_alt", default: "")
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
      Unit::APPLAB_INTRO => {
        url: script_reset_url(Unit::APPLAB_INTRO),
        title: I18n.t('upsell.applab.title'),
        body: I18n.t('upsell.applab.body_short')
      },
      Unit::ARTIST_NAME => {
        url: script_reset_url(Unit::ARTIST_NAME),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/artist")
      },
      Unit::COURSE1_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Unit::COURSE2_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Unit::COURSE3_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Unit::COURSE4_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Unit::COURSEA_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Unit::COURSEB_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Unit::COURSEC_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Unit::COURSED_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Unit::COURSEE_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Unit::COURSEF_NAME => {
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      },
      Unit::DANCE_PARTY_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/dance'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.gif")
      },
      Unit::DANCE_PARTY_2019_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/dance'),
        image_url: CDO.shared_image_url("courses/logo_tall_dance-2022.png")
      },
      Unit::FLAPPY_NAME => {
        url: script_reset_url(id),
        teacher_guide: CDO.code_org_url("/hourofcode/flappy")
      },
      Unit::FROZEN_NAME => {
        url: script_reset_url(id),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/frozen")
      },
      Unit::HOC_ENCRYPTION_NAME => {
        url: script_reset_url(id),
        teacher_guide: "https://curriculum.code.org/hoc/2016/2/"
      },
      Unit::HOC_NAME => {
        url: script_reset_url(id),
        title: I18n.t("upsell.hoc.title"),
        body: I18n.t("upsell.hoc.body"),
        teacher_guide: CDO.code_org_url("/hourofcode/hourofcode")
      },
      Unit::INFINITY_NAME => {
        url: script_reset_url(id),
        body: data_t_suffix('script.name', id, 'description_short'),
        title: I18n.t('upsell.infinity.title'),
        teacher_guide: CDO.code_org_url("/hourofcode/infinity")
      },
      Unit::MINECRAFT_AQUATIC_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/api/hour/begin/mc')
      },
      Unit::MINECRAFT_DESIGNER_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/api/hour/begin/mc')
      },
      Unit::MINECRAFT_HERO_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/api/hour/begin/mc')
      },
      Unit::MINECRAFT_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/api/hour/begin/mc')
      },
      Unit::STARWARS_BLOCKS_NAME => {
        url: CDO.code_org_url('/starwars'),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/starwars")
      },
      Unit::STARWARS_NAME => {
        url: CDO.code_org_url('/starwars'),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/starwars")
      },
      Unit::TEXT_COMPRESSION_NAME => {
        url: script_reset_url(id),
        teacher_guide: "https://curriculum.code.org/hoc/2016/1/"
      },
      Unit::TWENTY_HOUR_NAME => {
        title: I18n.t('upsell.20hour.title'),
        body: I18n.t('upsell.20hour.body')
      },
      Unit::OCEANS_NAME => {
        url: CDO.code_org_url('/oceans'),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short')
      },
      Unit::POEM_ART => {
        url: "https://studio.code.org/s/poem-art-2021/reset"
      },
      Unit::HELLO_WORLD_FOOD => {
        url: CDO.code_org_url('/helloworld'),
        title: I18n.t('upsell.hello-world.title'),
        body: I18n.t('upsell.hello-world.body')
      },
    }

    # The CourseA-F families should all be rendered the same.
    if [Unit::COURSEA, Unit::COURSEB, Unit::COURSEC, Unit::COURSED, Unit::COURSEE, Unit::COURSEF].include? family_name
      return {
        url: script_url(id),
        image_url: CDO.shared_image_url("courses/logo_tall_#{family_name}.jpg"),
        image_alt: I18n.t("upsell.#{family_name}.image_alt", default: ""),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience')
      }
    end

    default.merge!(block_override_data[id] || {})
  end
end

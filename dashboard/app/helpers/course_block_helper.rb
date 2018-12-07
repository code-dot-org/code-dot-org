module CourseBlockHelper
  class << self
    include Rails.application.routes.url_helpers
    include LocaleHelper
  end

  #
  # Given a Script ID or a string, returns an object that represents
  # a tall course block (_course_tall_block.haml), if one exists.
  #
  # Example return value:
  # {
  #   url: "https://my.url",
  #   title: "Tall Course Block",
  #   body: "Click to find out more!",
  #   teacher_guide: "https://my.teacher/guide",
  #   image_url: "https://my.image"
  # }
  #
  def self.get_tall_course_block(id)
    block_data = {
      Script::HOC_NAME => {
        url: script_reset_url(Script::HOC_NAME),
        title: I18n.t('upsell.hoc.title'),
        body: I18n.t('upsell.hoc.body'),
        teacher_guide: CDO.code_org_url("/hourofcode/hourofcode"),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::FLAPPY_NAME => {
        url: script_reset_url('flappy'),
        title: I18n.t('upsell.flappy.title'),
        body: I18n.t('upsell.flappy.body'),
        teacher_guide: CDO.code_org_url("/hourofcode/flappy"),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::TWENTY_HOUR_NAME => {
        url: script_url(id),
        title: I18n.t('upsell.20hour.title'),
        body: I18n.t('upsell.20hour.body'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      'gallery' => {
        url: '/gallery',
        title: I18n.t('upsell.gallery.title'),
        body: I18n.t('upsell.gallery.body'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      'applab' => {
        url: CDO.code_org_url('/educate/applab'),
        title: I18n.t('upsell.applab.title'),
        body: I18n.t('upsell.applab.body_short'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::APPLAB_INTRO => {
        url: CDO.studio_url('/s/applab-intro/reset'),
        title: I18n.t('upsell.applab.title'),
        body: I18n.t('upsell.applab.body_short'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      'conditionals' => {
        url: CDO.code_org_url('/hourofcode/unplugged-conditionals-with-cards'),
        title: I18n.t('upsell.unplugged_conditionals.title'),
        body: I18n.t('upsell.unplugged_conditionals.body'),
        teacher_guide: CDO.code_org_url("/hourofcode/unplugged-conditionals-with-cards"),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::SPORTS_NAME => {
        url: CDO.code_org_url('/athletes'),
        title: I18n.t('upsell.sports.title'),
        body: I18n.t('upsell.sports.body'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::TEXT_COMPRESSION_NAME => {
        url: CDO.studio_url('/s/text-compression/reset'),
        title: I18n.t('upsell.text-compression.title'),
        body: I18n.t('upsell.text-compression.body'),
        teacher_guide: "https://curriculum.code.org/hoc/2016/1/",
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::HOC_ENCRYPTION_NAME => {
        url: CDO.studio_url('/s/hoc-encryption/reset'),
        title: I18n.t('upsell.hoc-encryption.title'),
        body: I18n.t('upsell.hoc-encryption.body'),
        teacher_guide: "https://curriculum.code.org/hoc/2016/2/",
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSE1_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSE2_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSE3_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSE4_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSEA_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSEB_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSEC_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSED_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSEE_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSEA_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::COURSEF_NAME => {
        url: script_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        audience: data_t_suffix('script.name', id, 'description_audience'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::ARTIST_NAME => {
        url: script_reset_url(id),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/artist"),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::PLAYLAB_NAME => {
        url: CDO.code_org_url('/playlab'),
        title: data_t_suffix('script.name', id, 'title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/playlab"),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::FROZEN_NAME => {
        url: script_reset_url(id),
        title: I18n.t('upsell.frozen.title'),
        body: data_t_suffix('script.name', id, 'description_short'),
        teacher_guide: CDO.code_org_url("/hourofcode/frozen"),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::INFINITY_NAME => {
        url: script_reset_url(id),
        body: data_t_suffix('script.name', id, 'description_short'),
        title: I18n.t('upsell.infinity.title'),
        teacher_guide: CDO.code_org_url("/hourofcode/infinity"),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::STARWARS_NAME => {
        url: CDO.code_org_url('/starwars'),
        body: data_t_suffix('script.name', id, 'description_short'),
        title: I18n.t('upsell.starwars.title'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg"),
        teacher_guide: CDO.code_org_url("/hourofcode/starwars")
      },
      Script::STARWARS_BLOCKS_NAME => {
        url: CDO.code_org_url('/starwars'),
        body: data_t_suffix('script.name', id, 'description_short'),
        title: I18n.t('upsell.starwars.title'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg"),
        teacher_guide: CDO.code_org_url("/hourofcode/starwars")
      },
      Script::MINECRAFT_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        title: I18n.t('upsell.minecraft.title'),
        url: CDO.code_org_url('/api/hour/begin/mc'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::MINECRAFT_DESIGNER_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        title: I18n.t('upsell.minecraft2016.title'),
        url: CDO.code_org_url('/api/hour/begin/mc'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::MINECRAFT_HERO_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        title: I18n.t('upsell.hero.title'),
        url: CDO.code_org_url('/api/hour/begin/mc'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::MINECRAFT_AQUATIC_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        title: I18n.t('upsell.aquatic.title'),
        url: CDO.code_org_url('/api/hour/begin/mc'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.jpg")
      },
      Script::DANCE_PARTY_NAME => {
        body: data_t_suffix('script.name', id, 'description_short'),
        url: CDO.code_org_url('/dance'),
        title: I18n.t('upsell.dance.title'),
        image_url: CDO.shared_image_url("courses/logo_tall_#{id}.gif")
      }
    }

    block_data[id]
  end
end

# Centralized social metadata for a few key pages:
#
#   code.org/
#   code.org/challenge
#   code.org/coldplay
#   code.org/dance
#   code.org/minecraft
#   code.org/oceans
#   code.org/hourofcode/overview
#
#   hourofcode.com/
#   hourofcode.com/learn
#   hourofcode.com/thanks

def get_social_metadata_for_page(request)
  # Not currently used, but left here for reference in case we want to use videos again.
  # rubocop:disable UselessAssignment
  videos = {
    what_most_schools_dont_teach: {youtube_key: "nKIu9yen5nc", width: 640, height: 360},
    computer_science_is_changing_everything: {youtube_key: "QvyTEx1wyOY", width: 640, height: 360},
    hour_of_code_worldwide: {youtube_key: "KsOIlDT145A", width: 640, height: 360},
    creativity_is: {youtube_key: "VYqHGIR7a_k", width: 640, height: 640}
  }
  # rubocop:enable UselessAssignment

  images = {
    kids_with_ipads: {path: "/images/default-og-image.png", width: 1220, height: 640},
    celeb_challenge: {path: "/images/fit-1220/social-media/celeb-challenge.png", width: 1220, height: 640},
    creativity: {path: "/images/social-media/code-2018-creativity.png", width: 1200, height: 630},
    cs_is_everything_thumbnail: {path: "/images/cs-is-everything-thumbnail.png", width: 1200, height: 627},
    hoc_2018_creativity: {path: "/images/social-media/hoc-2018-creativity.png", width: 1200, height: 630},
    hoc_student_challenge: {path: "/images/fit-1920/social-media/hoc-student-challenge.png", width: 1920, height: 1080},
    hoc_student_challenge_new: {path: "/images/fit-1920/social-media/hoc-student-challenge.png", width: 1920, height: 1080},
    mc_social_2017: {path: "/images/mc/mc_social_2017.png", width: 1200, height: 630},
    mc_social_2018: {path: "/images/social-media/mc-social-2018.png", width: 1200, height: 630},
    dance_2018: {path: "/images/social-media/dance-social-2018.png", width: 1200, height: 630},
    dance_2019: {path: "/images/social-media/dance-social-2019.png", width: 1200, height: 630},
    hoc_thanks: {path: "/images/hourofcode-2015-video-thumbnail.png", width: 1440, height: 900},
    hoc_2019_social: {path: "/shared/images/social-media/hoc2019_social.png", width: 1200, height: 630},
    oceans: {path: "/shared/images/social-media/oceans_social.png", width: 1200, height: 630},
    codeorg2019_social: {path: "/shared/images/social-media/codeorg2019_social.png", width: 1200, height: 630},
    codeorg2020_social: {path: "/shared/images/social-media/codeorg2020_social.png", width: 1200, height: 630},
    hoc_2020_social: {path: "/shared/images/social-media/hoc2020_social.png", width: 1200, height: 630},
    hoc_cse_social: {path: "/shared/images/social-media/hoc_cse_social.png", width: 1200, height: 630},
    coldplay: {path: "/shared/images/social-media/coldplay_social.png", width: 1920, height: 1080},
  }

  # Important:
  #   - image should always come before video
  #   - description should always come before description_twitter
  social_tags = {
    "code.org" => {
      "default" => {
        title: hoc_s(:hoc2019_header),
        description: I18n.t(:og_description),
        image: images[:kids_with_ipads]
      }
    },
    "hourofcode.com" => {
      "default" => {
        title: hoc_s(:social_hoc_anybody),
        description: hoc_s(:social_hoc2021_cse),
        image: images[:hoc_cse_social]
      }
    },
    "challenge" => {
      "soon-hoc" => {
        title: "Celebrity Challenge",
        description: "Win a celebrity video chat for your class!",
        image: images[:hoc_student_challenge]
      },
      "actual-hoc" => {
        title: "Celebrity Challenge",
        description: "Win a celebrity video chat for your class!",
        image: images[:celeb_challenge]
      },
      "default" => {
        title: "Celebrity Challenge",
        description: "Win a celebrity video chat for your class!",
        image: images[:celeb_challenge]
      }
    },
    "coldplay" => {
      "default" => {
        title: hoc_s(:social_coldplay_title),
        description: hoc_s(:social_coldplay_desc),
        image: images[:coldplay]
      }
    },
    "minecraft" => {
      "soon-hoc" => {
        title: hoc_s(:tutorial_mchoc_name),
        description: hoc_s(:social_hoc2018_mc),
        image: images[:mc_social_2017]
      },
      "soon-hoc-mc" => {
        title: hoc_s(:tutorial_mchoc_name),
        description: hoc_s(:social_hoc2018_mc_creativity),
        image: images[:mc_social_2018]
      },
      "soon-hoc-dance" => {
        title: hoc_s(:tutorial_mchoc_name),
        description: hoc_s(:social_hoc2018_mc_creativity),
        image: images[:mc_social_2018]
      },
      "default" => {
        title: hoc_s(:tutorial_mchoc_name),
        description: hoc_s(:social_hoc2018_mc_creativity),
        image: images[:mc_social_2018]
      }
    },
    "dance" => {
      "default" => {
        title: hoc_s(:social_hoc2018_dance_party),
        description: hoc_s(:social_hoc2019_dance),
        image: images[:dance_2019]
      }
    },
    "oceans" => {
      "default" => {
        title: hoc_s(:social_hoc2019_oceans_title),
        description: hoc_s(:social_hoc2019_oceans_desc),
        image: images[:oceans]
      }
    },
    "thanks" => {
      "default" => {
        title: hoc_s(:meta_tag_og_title_cs_movement),
        description: hoc_s(:meta_tag_og_description_campaign),
        image: images[:hoc_thanks]
      },
    },
    "learn" => {
      "default" => {
        title: hoc_s(:social_hoc_anybody),
        description: hoc_s(:social_hoc2021_cse),
        image: images[:hoc_cse_social]
      }
    },
    "hoc-overview" => {
      "default" => {
        title: hoc_s(:social_hoc_anybody),
        description: hoc_s(:social_hoc2021_cse),
        image: images[:hoc_cse_social]
      }
    }
  }

  if request.path == "/challenge" && request.site == "code.org"
    page = "challenge"
  elsif request.path == "/coldplay" && request.site == "code.org"
    page = "coldplay"
  elsif request.path == "/minecraft" && request.site == "code.org"
    page = "minecraft"
  elsif request.path == "/dance" && request.site == "code.org"
    page = "dance"
  elsif request.path == "/oceans" && request.site == "code.org"
    page = "oceans"
  elsif request.path == "/" && ["code.org", "hourofcode.com"].include?(request.site)
    page = request.site
  elsif request.path == "/thanks" && request.site == "hourofcode.com"
    page = "thanks"
  elsif request.path == "/learn" && request.site == "hourofcode.com"
    page = "learn"
  elsif request.path == "/hourofcode/overview" && request.site == "code.org"
    page = "hoc-overview"
  else
    return {}
  end

  hoc_mode = DCDO.get("hoc_mode", CDO.default_hoc_mode)

  # For now, post-hoc, pre-hoc and false act as the default.
  if ["post-hoc", "pre-hoc", false].include? hoc_mode
    hoc_mode = "default"
  end

  # Additional hoc variants.
  extension = ""
  hoc_launch = DCDO.get("hoc_launch", CDO.default_hoc_launch)
  if hoc_launch == "mc"
    extension = "-mc"
  elsif hoc_launch == "dance"
    extension = "-dance"
  end

  social_tag_set =
    social_tags[page][hoc_mode + extension] ||
    social_tags[page][hoc_mode] ||
    social_tags[page]["default"]

  output = {}
  social_tag_set.each do |name, value|
    if name == :image
      output["og:image"] = "https://#{request.host}#{value[:path]}"
      output["twitter:image:src"] = "https://#{request.host}#{value[:path]}"
      output["og:image:width"] = value[:width]
      output["og:image:height"] = value[:height]
      output["twitter:card"] = "photo"
    elsif name == :video
      output["og:video:url"] = "http://youtube.com/v/#{value[:youtube_key]}"
      output["og:video:secure_url"] = "https://youtube.com/v/#{value[:youtube_key]}"
      output["og:video:type"] = "video/mp4"
      output["og:video:width"] = value[:width]
      output["og:video:height"] = value[:height]
      output["twitter:player"] = "https://youtube.com/embed/#{value[:youtube_key]}"
      output["twitter:player:width"] = value[:width]
      output["twitter:player:height"] = value[:height]
      output["twitter:card"] = "player"
    elsif name == :title
      output["og:title"] = value
      output["twitter:title"] = value
    elsif name == :description
      output["og:description"] = value
      output["twitter:description"] = value
    elsif name == :description_twitter
      output["twitter:description"] = value
    end
  end

  output
end

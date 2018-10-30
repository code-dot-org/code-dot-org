# Centralized social metadata for a few key pages:
#   code.org/
#   csedweek.org/
#   hourofcode.com/
#   code.org/challenge

def get_social_metadata_for_page(request)
  videos = {
    what_most_schools_dont_teach: {youtube_key: "nKIu9yen5nc", width: 640, height: 360},
    computer_science_is_changing_everything: {youtube_key: "QvyTEx1wyOY", width: 640, height: 360},
    hour_of_code_worldwide: {youtube_key: "KsOIlDT145A", width: 640, height: 360},
    creativity_is: {youtube_key: "VYqHGIR7a_k", width: 640, height: 640}
  }

  # Important:
  #   - image should always come before video
  #   - description should always come before description_twitter
  social_tags = {
    "code.org" => {
      "soon-hoc" => {
        title: hoc_s(:social_hoc2018_what_create),
        description: hoc_s(:social_hoc2018_every_student),
        image: {path: "/images/social-media/hourofcode-2018-creativity.jpg", width: 846, height: 529},
        video: videos[:creativity_is]
      },
      "soon-hoc-mc" => {
        title: hoc_s(:social_hoc2018_what_create),
        description: hoc_s(:social_hoc2018_every_student),
        image: {path: "/images/social-media/mc-social-2018.jpg", width: 1200, height: 630},
        video: videos[:creativity_is]
      },
      "soon-hoc-dance" => {
        title: hoc_s(:social_hoc2018_what_create),
        description: hoc_s(:social_hoc2018_every_student),
        image: {path: "/images/social-media/hourofcode-2018-dance.jpg", width: 846, height: 529},
        video: videos[:creativity_is]
      },
      "actual-hoc" => {
        title: I18n.t(:og_title_here),
        description: I18n.t(:og_description_celeb),
        image: {path: "/images/fit-1220/social-media/celeb-challenge.jpg", width: 1220, height: 640}
      },
      "actual-hoc-dance" => {
        title: hoc_s(:social_hoc2018_what_create),
        description: hoc_s(:social_hoc2018_every_student_try_what_create),
        image: {path: "/images/social-media/hourofcode-2018-dance.jpg", width: 846, height: 529},
        video: videos[:creativity_is]
      },
      "default" => {
        title: hoc_s(:social_hoc2018_code_org_what_create),
        description: I18n.t(:og_description),
        image: {path: "/images/fit-1220/social-media/default-og-image.jpg", width: 1220, height: 640},
        video: videos[:what_most_schools_dont_teach]
      }
    },
    "csedweek.org" => {
      "soon-hoc" => {
        title: I18n.t(:csedweek_og_title),
        description: I18n.t(:csedweek_og_description_soon),
        image: {path: "/images/cs-is-everything-thumbnail.png", width: 1200, height: 627},
        video: videos[:computer_science_is_changing_everything]
      },
      "actual-hoc" => {
        title: I18n.t(:og_title_here),
        description: I18n.t(:csedweek_og_description_here),
        image: {path: "/images/cs-is-everything-thumbnail.png", width: 1200, height: 627},
        video: videos[:computer_science_is_changing_everything]
      },
      "default" => {
        title: I18n.t(:csedweek_og_title),
        description: I18n.t(:csedweek_og_description),
        image: {path: "/images/cs-is-everything-thumbnail.png", width: 1200, height: 627},
        video: videos[:computer_science_is_changing_everything]
      }
    },
    "hourofcode.com" => {
      "soon-hoc" => {
        title: hoc_s(:social_hoc2018_hoc_coming_create),
        description: hoc_s(:social_hoc2018_creativity_in_are_you),
        image: {path: "/images/social-media/hourofcode-2018-creativity.jpg", width: 846, height: 529},
        video: videos[:creativity_is]
      },
      "actual-hoc" => {
        title: hoc_s(:social_hoc2018_hoc_here),
        description: hoc_s(:social_hoc2018_creativity_in_are_you),
        image: {path: "/images/social-media/hourofcode-2018-creativity.jpg", width: 846, height: 529},
        video: videos[:creativity_is]
      },
      "default" => {
        title: hoc_s(:social_hoc2018_join),
        description: hoc_s(:social_hoc2018_creativity_in_are_you),
        image: {path: "/images/social-media/hourofcode-2018-creativity.jpg", width: 1440, height: 900},
        video: videos[:creativity_is]
      }
    },
    "challenge" => {
      "soon-hoc" => {
        title: "Celebrity Challenge",
        description: "Win a celebrity video chat for your class!",
        image: {path: "/images/fit-1920/social-media/hoc-student-challenge.jpg", width: 1920, height: 1080}
      },
      "actual-hoc" => {
        title: "Celebrity Challenge",
        description: "Win a celebrity video chat for your class!",
        image: {path: "/images/fit-1220/social-media/celeb-challenge.jpg", width: 1220, height: 640}
      },
      "default" => {
        title: "Celebrity Challenge",
        description: "Win a celebrity video chat for your class!",
        image: {path: "/images/fit-1220/social-media/celeb-challenge.jpg", width: 1220, height: 640}
      }
    },
    "minecraft" => {
      "soon-hoc" => {
        title: hoc_s(:tutorial_mchoc_name),
        description: hoc_s(:social_hoc2018_mc),
        image: {path: "/images/mc/mc_social_2017.jpg", width: 1200, height: 630}
      },
      "soon-hoc-mc" => {
        title: hoc_s(:tutorial_mchoc_name),
        description: hoc_s(:social_hoc2018_mc_creativity),
        image: {path: "/images/social-media/mc-social-2018.jpg", width: 1200, height: 630}
      },
      "soon-hoc-dance" => {
        title: hoc_s(:tutorial_mchoc_name),
        description: hoc_s(:social_hoc2018_mc_creativity),
        image: {path: "/images/social-media/mc-social-2018.jpg", width: 1200, height: 630}
      },
      "default" => {
        title: hoc_s(:tutorial_mchoc_name),
        description: hoc_s(:social_hoc2018_mc_creativity),
        image: {path: "/images/social-media/mc-social-2018.jpg", width: 1200, height: 630}
      }
    },
    "dance" => {
      "default" => {
        title: hoc_s(:social_hoc2018_dance_party),
        description: hoc_s(:social_hoc2018_dance_what_create),
        image: {path: "/images/social-media/hourofcode-2018-creativity.jpg", width: 846, height: 529}
      }
    }
  }

  if request.path == "/challenge" && request.site == "code.org"
    page = "challenge"
  elsif request.path == "/minecraft" && request.site == "code.org"
    page = "minecraft"
  elsif request.path == "/dance" && request.site == "code.org"
    page = "dance"
  elsif request.path == "/" && ["code.org", "csedweek.org", "hourofcode.com"].include?(request.site)
    page = request.site
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
  hoc_launch = DCDO.get("hoc_launch", nil)
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

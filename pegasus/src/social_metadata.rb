# Centralized social metadata for a few key pages:
#   code.org/
#   csedweek.org/
#   hourofcode.com/
#   code.org/challenge

def get_social_metadata_for_page(request)
  videos = {
    what_most_schools_dont_teach: {youtube_key: "nKIu9yen5nc", width: 640, height: 360},
    computer_science_is_changing_everything: {youtube_key: "QvyTEx1wyOY", width: 640, height: 360},
    hour_of_code_worldwide: {youtube_key: "KsOIlDT145A", width: 640, height: 360}
  }

  # Important:
  #   - image should always come before video
  #   - description should always come before description_twitter
  social_tags = {
    "code.org" => {
      "soon-hoc" => {
        title: I18n.t(:og_title),
        description: I18n.t(:og_description),
        image: {path: "/images/fit-1220/social-media/default-og-image.jpg", width: 1220, height: 640}
      },
      "week-before-hoc" => {
        title: I18n.t(:og_title_soon),
        description: I18n.t(:og_description_celeb),
        image: {path: "/images/fit-1220/social-media/celeb-challenge.jpg", width: 1220, height: 640}
      },
      "actual-hoc" => {
        title: I18n.t(:og_title_here),
        description: I18n.t(:og_description_celeb),
        image: {path: "/images/fit-1220/social-media/celeb-challenge.jpg", width: 1220, height: 640}
      },
      "default" => {
        title: I18n.t(:og_title),
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
      "week-before-hoc" => {
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
        title: I18n.t(:og_title_soon),
        description: hoc_s(:meta_tag_og_description),
        description_twitter: hoc_s(:meta_tag_twitter_description),
        image: {path: "/images/social-media/hourofcode-2015-video-thumbnail.jpg", width: 1440, height: 900},
        video: videos[:hour_of_code_worldwide]
      },
      "week-before-hoc" => {
        title: I18n.t(:og_title_soon),
        description: hoc_s(:meta_tag_og_description),
        description_twitter: hoc_s(:meta_tag_twitter_description),
        image: {path: "/images/social-media/hourofcode-2015-video-thumbnail.jpg", width: 1440, height: 900},
        video: videos[:hour_of_code_worldwide]
      },
      "actual-hoc" => {
        title: I18n.t(:og_title_here),
        description: hoc_s(:meta_tag_og_description),
        description_twitter: hoc_s(:meta_tag_twitter_description),
        image: {path: "/images/social-media/hourofcode-2015-video-thumbnail.jpg", width: 1440, height: 900},
        video: videos[:hour_of_code_worldwide]
      },
      "default" => {
        title: hoc_s(:meta_tag_og_title),
        description: hoc_s(:meta_tag_og_description),
        description_twitter: hoc_s(:meta_tag_twitter_description),
        image: {path: "/images/social-media/hourofcode-2015-video-thumbnail.jpg", width: 1440, height: 900},
        video: videos[:hour_of_code_worldwide]
      }
    },
    "challenge" => {
      "soon-hoc" => {
        title: "Celebrity Challenge",
        description: "Win a celebrity video chat for your class!",
        image: {path: "/images/fit-1920/social-media/hoc-student-challenge.jpg", width: 1920, height: 1080}
      },
      "week-before-hoc" => {
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
    }
  }

  if request.path == "/challenge" && request.site == "code.org"
    page = "challenge"
  elsif request.path == "/" && ["code.org", "csedweek.org", "hourofcode.com"].include?(request.site)
    page = request.site
  else
    return {}
  end

  hoc_mode = DCDO.get("hoc_mode", "default")

  # For now, post-hoc looks the same as the default.
  if hoc_mode == "post-hoc"
    hoc_mode = "default"
  end

  output = {}
  social_tags[page][hoc_mode].each do |name, value|
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

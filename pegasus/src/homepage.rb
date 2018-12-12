class Homepage
  MAX_HEROES_IN_ROTATION = 6

  def self.get_heroes
    [
      {
        text: "homepage_hero_text_stat_loc",
        centering: "50% 40%",
        type: "stat",
        textposition: "bottom",
        image: "/images/homepage/girl2.jpg"
      },
      {
        text: "homepage_hero_text_stat_students",
        centering: "50% 30%",
        type: "stat",
        textposition: "bottom",
        image: "/images/homepage/girl6.jpg"
      },
      {
        text: "homepage_hero_text_stat_served",
        centering: "50% 35%",
        type: "stat",
        textposition: "top",
        image: "/images/homepage/girl9.jpg"
      },
      {
        text: "homepage_hero_text_malala",
        centering: "50% 30%",
        type: "celeb",
        textposition: "bottom",
        image: "/images/homepage/malala.jpg"
      },
      {
        text: "homepage_hero_text_susan",
        centering: "52% 6%",
        type: "celeb",
        textposition: "top",
        image: "/images/homepage/susan.jpg"
      },
      {
        text: "homepage_hero_text_satya_new",
        centering: "47% 21%",
        type: "celeba",
        textposition: "bottom",
        image: "/images/homepage/satya_new.jpg"
      },
      {
        text: "homepage_hero_text_sheryl",
        centering: "59% 22%",
        type: "celeb",
        textposition: "bottom",
        image: "/images/homepage/sheryl.jpg"
      },
      {
        text: "homepage_hero_text_student1",
        centering: "50% 30%",
        type: "student",
        textposition: "bottom",
        image: "/images/homepage/girl.jpg"
      },
      {
        text: "homepage_hero_text_student2",
        centering: "55% 7%",
        type: "student",
        textposition: "top",
        image: "/images/homepage/boy5.jpg"
      },
      {
        text: "homepage_hero_text_bosh",
        centering: "62% 33%",
        type: "celeb",
        textposition: "bottom",
        image: "/images/homepage/boy7.jpg"
      },
      {
        text: "homepage_hero_text_student4",
        centering: "41% 20%",
        type: "student",
        textposition: "bottom",
        image: "/images/homepage/kids4.jpg"
      },
      {
        text: "homepage_hero_text_student5",
        centering: "45% 31%",
        type: "student",
        textposition: "top",
        image: "/images/homepage/boy3.jpg"
      },
      {
        text: "homepage_hero_text_teacher1",
        centering: "24% 11%",
        type: "teacher",
        textposition: "bottom",
        image: "/images/homepage/girl10.jpg"
      },
      {
        text: "homepage_hero_text_teacher2",
        centering: "49% 17%",
        type: "teacher",
        textposition: "bottom",
        image: "/images/homepage/kids10.jpg"
      }
    ]
  end

  def self.get_actions
    # Show a Latin American specific video to users browsing in Spanish or
    # Portuguese to promote LATAM HOC.
    latam_language_codes = [:"es-MX", :"es-ES", :"pt-BR", :"pt-PT"]
    if latam_language_codes.include?(I18n.locale)
      youtube_id = "EGgdCryC8Uo"
      download_path = "//videos.code.org/social/latam-hour-of-code-2018.mp4"
      facebook = "https://www.facebook.com/Code.org/videos/173765420214608/"
      twitter = "Aprender las ciencias de la computación es fundamental para trabajar en el siglo XXI. Si aprendan crear la tecnología del futuro, podrán controlar sus futuros. ¿Qué vas a crear? #HoraDelCodigo #QueVasACrear https://twitter.com/codeorg/status/1047063784949460995"
    else
      youtube_id = "nKIu9yen5nc"
      download_path = "//videos.code.org/social/what-most-schools-dont-teach.mp4"
      facebook = "https://www.facebook.com/Code.org/videos/10100689712053311/"
      twitter = "Anybody can learn computer science, starting with an #HourOfCode. https://twitter.com/codeorg/status/828716370053304321"
    end

    hoc_mode = DCDO.get('hoc_mode', CDO.default_hoc_mode)
    if hoc_mode == "actual-hoc"
      [
        {
          text: "get_started",
          type: "cta_button_solid_white",
          url: "/hourofcode/overview"
        }
      ]
    elsif hoc_mode == "soon-hoc"
      [
        {
          text: "homepage_action_text_join_us",
          type: "cta_button_solid_white",
          url: CDO.hourofcode_url("#join")
        },
        {
          text: "homepage_action_text_try_it",
          type: "cta_button_hollow_white",
          url: "/hourofcode/overview"
        }
      ]
    elsif hoc_mode == "post-hoc"
      [
        {
          text: "homepage_action_text_learn",
          type: "cta_button",
          url: CDO.studio_url("/courses"),
        },
        {
          text: "homepage_action_text_codevideo",
          type: "video",
          youtube_id: youtube_id,
          download_path: download_path,
          facebook: facebook,
          twitter: twitter
        }
      ]
    else
      [
        {
          text: "homepage_action_text_join_us",
          type: "cta_button_solid_white",
          url: CDO.hourofcode_url("#join")
        },
        {
          text: "homepage_action_text_try_it",
          type: "cta_button_hollow_white",
          url: "/learn"
        },
        {
          text: "homepage_action_text_codevideo",
          type: "video",
          youtube_id: youtube_id,
          download_path: download_path,
          facebook: facebook,
          twitter: twitter
        }
      ]
    end
  end

  def self.get_blocks(request)
    if request.language == "en"
      [
        {
          id: "students-en",
          type: "block",
          title: "homepage_slot_text_title_students",
          text: "homepage_slot_text_blurb_students_courses",
          color1: "118, 101, 160",
          color2: "166, 155, 193",
          url: CDO.studio_url("/courses"),
          image: "/shared/images/courses/logo_tall_elementary.jpg",
          links:
            [
              {
                text: "homepage_slot_text_link_codestudio",
                url: CDO.studio_url("/")
              },
              {
                text: "homepage_slot_text_link_local",
                url: "/learn/local"
              },
              {
                text: "homepage_slot_text_link_othercourses",
                url: "/learn/beyond"
              }
            ]
        },

        {
          id: "educators-en",
          type: "block",
          title: "homepage_slot_text_title_educators",
          text: "homepage_slot_text_blurb_educators",
          color1: "0, 148, 202",
          color2: "89, 185, 220",
          url: "/educate",
          image: "/shared/images/courses/logo_tall_teacher2.jpg",
          links:
            [
              {
                text: "homepage_slot_text_link_elementary",
                url: "/educate/curriculum/elementary-school"
              },
              {
                text: "homepage_slot_text_link_middle",
                url: "/educate/curriculum/middle-school"
              },
              {
                text: "homepage_slot_text_link_high",
                url: "/educate/curriculum/high-school"
              }
            ]
        },

        {
          id: "hoc-en",
          type: "block",
          title: "homepage_slot_text_title_hoc",
          text: "homepage_slot_text_blurb_hoc",
          color1: "0, 173, 188",
          color2: "89, 202, 211",
          url: "/hourofcode/overview",
          image: "/images/mc/2016_homepage_hocblock.jpg",
          links:
            [
              {
                text: "homepage_slot_text_link_about_hoc",
                url: "https://hourofcode.com/"
              },
              {
                text: "homepage_slot_text_link_host",
                url: "https://hourofcode.com/how-to"
              },
              {
                text: "homepage_slot_text_link_hocserved",
                url: "/leaderboards"
              }
            ]
        },

        {
          id: "advocate-en",
          type: "block",
          title: "homepage_slot_text_link_buy",
          text: "homepage_slot_text_blurb_advocates",
          color1: "185, 191, 21",
          color2: "209, 213, 103",
          url: "/help",
          image: "/shared/images/courses/logo_tall_map.jpg",
          links:
            [
              {
                text: "homepage_slot_text_link_stats",
                url: "/promote"
              },
              {
                text: "homepage_slot_text_link_administrators",
                url: "/yourschool"
              },
              {
                text: "homepage_slot_text_link_shop",
                url: "/shop"
              }
            ]
        }
      ].each {|entry| entry[:image].gsub!("/images/", "/images/fit-400/")}
    else
      [
        {
          id: "students-nonen",
          type: "blockshort",
          title: "homepage_slot_text_title_students",
          text: "homepage_slot_text_blurb_students",
          color1: "118, 101, 160",
          color2: "166, 155, 193",
          url: CDO.studio_url("/courses"),
          image: "/shared/images/courses/logo_tall_elementary.jpg"
        },
        {
          id: "educators-nonen",
          type: "blockshort",
          title: "homepage_slot_text_title_educators",
          text: "homepage_slot_text_blurb_educators",
          color1: "0, 148, 202",
          color2: "89, 185, 220",
          url: CDO.studio_url("/courses?view=teacher"),
          image: "/shared/images/courses/logo_tall_teacher2.jpg"
        },
        {
          id: "hoc-nonen",
          type: "blockshort",
          title: "homepage_slot_text_title_hoc",
          text: "homepage_slot_text_blurb_hoc",
          color1: "0, 173, 188",
          color2: "89, 202, 211",
          url: "/hourofcode/overview",
          image: "/images/mc/2016_homepage_hocblock.jpg"
        },
        {
          id: 'dance-nonen',
          type: "blockshort",
          title: 'studiobar_dance_title',
          text: 'studiobar_dance_body',
          color1: "185, 191, 21",
          color2: "209, 213, 103",
          url: '/dance',
          image: '/shared/images/courses/logo_tall_dance.jpg'
        }
      ].each {|entry| entry[:image].gsub!("/images/", "/images/fit-400/")}
    end
  end

  def self.get_video
    video = get_actions.find {|a| a[:type] == "video"}

    if video
      {
        video_code: video[:youtube_id],
        download_path: video[:download_path],
        facebook: {u: video[:facebook]},
        twitter: {related: 'codeorg', text: video[:twitter]}
      }
    else
      nil
    end
  end

  def self.show_single_hero
    "create"
  end

  def self.get_heroes_arranged(request)
    hero_create = [{text: "homepage_hero_text_stat_students", centering: "50% 30%", type: "stat", textposition: "bottom", image: "/images/homepage/announcement.jpg"}]

    # Generate a random set of hero images alternating between non-celeb and celeb.
    heroes = get_heroes
    hero_display_time = 13 * 1000

    if show_single_hero == "create"
      heroes_arranged = hero_create
    else
      # The order alternates person & stat.  Person alternates non-celeb and
      # celeb.  Non-celeb is student or teacher. We open with a celeb, i.e.,
      # celeb, stat, non-celeb, stat, celeb, stat, non-celeb, stat, celeb, stat,
      # etc.
      heroes.shuffle!
      heroes_nonceleb = heroes.select {|hero| ["student", "teacher"].include? hero[:type]}
      heroes_celeb = heroes.select {|hero| hero[:type] == "celeb"}
      heroes_stat = heroes.select {|hero| hero[:type] == "stat"}
      heroes_arranged =
        if heroes_stat.empty?
          heroes_nonceleb.zip(heroes_celeb).flatten.compact.first(MAX_HEROES_IN_ROTATION)
        else
          heroes_stat.zip(heroes_nonceleb.zip(heroes_celeb).flatten).flatten.compact.first(MAX_HEROES_IN_ROTATION)
        end

      heroes_celeba = heroes.select {|hero| hero[:type] == "celeba"}
      unless heroes_celeba.empty?
        heroes_celeba.shuffle!
        heroes_arranged.unshift(heroes_celeba.first)
      end
    end

    if rack_env != :production
      if request.params["preview"]
        # On non-production, special "?preview=true" flag shows all heroes, and more quickly, for easier previewing
        hero_display_time = 6 * 1000
      elsif request.params["lock-hero"]
        # For UI tests just lock to the first hero image
        heroes_arranged = heroes_arranged[0, 1]
      end
    end

    return heroes_arranged, hero_display_time
  end

  def self.get_below_hero_announcement
    {
      showing: false,
      text: "homepage_below_hero_announcement_text",
      link: "/privacy-may2018",
      link_text: "homepage_below_hero_announcement_link_text"
    }
  end

  def self.get_dance_stars
    stars = [
      "Ace of Base", "A-ha", "Ariana Grande", "Avicii and Aloe Blacc", "Bruce Springsteen", "Calvin Harris",
      "Carly Rae Jepsen", "Ciara", "Coldplay", "Ed Sheeran", "Imagine Dragons",
      "J Balvin and Willy William", "Justin Bieber", "Katy Perry", "Keith Urban", "Lady Antebellum", "Lady Gaga",
      "Los del Río", "Luke Bryan", "Macklemore and Ryan Lewis", "Madonna", "Mark Ronson (ft. Bruno Mars)",
      "MC Hammer", "Miley Cyrus", "OutKast", "Selena Gomez", "Sia", "Village People", "The Weeknd", "will.i.am",
      "Yolanda Be Cool"
    ]
    DCDO.get("hoc2018_dance_stars", stars)
  end
end

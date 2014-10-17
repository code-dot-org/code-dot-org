FactoryGirl.define do
  factory :user do
    birthday Date.new(1991, 03, 14)
    sequence(:email) { |n| "testuser#{n}@example.com.xx" }
    password "00secret"
    locale 'en-US'
    sequence(:name) { |n| "User#{n} Codeberg" }
    user_type User::TYPE_STUDENT

    # Child of :user factory, since it's in the `factory :user` block
    factory :admin do
      admin true
    end

    factory :teacher do
      user_type User::TYPE_TEACHER
    end

    factory :student do
      user_type User::TYPE_STUDENT
    end
  end

  factory :section do
    sequence(:name) { |n| "Section #{n}"}
    user { create :teacher }
  end

  factory :game do
    sequence(:name) { |n| "game#{n}.com"}
    app "maze"
  end

  factory :level, :class => Blockly do
    sequence(:name) { |n| "Level #{n}" }
    sequence(:level_num) {|n| "1_2_#{n}" }

    # User id must be non-nil for custom level
    user_id '1'
    game

    trait :with_autoplay_video do
      video_key {create(:video).key}
    end

    trait :blockly do
      game {create(:game, app: "maze", name: "Maze")}
    end

    trait :unplugged do
      game {create(:game, app: "unplug")}
    end

  end

  factory :unplugged, :parent => Level, :class => Unplugged do
    game {create(:game, app: "unplug")}
  end

  factory :match, :parent => Level, :class => Match do
    game {create(:game, app: "match")}
  end

  factory :artist, :parent => Level, :class => Artist do
  end

  factory :maze, :parent => Level, :class => Maze do
  end

  factory :level_source do
    level
    data '<xml/>'
    md5 { Digest::MD5.hexdigest(data) }
  end

  factory :level_source_image do
    level_source
    image File.read(Rails.root.join('test/fixtures/artist_image_blank.png'), binmode: true)
  end

  factory :script do
    sequence(:name) { |n| "Bogus Script #{n}" }
  end

  factory :script_level do
    script

    trait :with_stage do
      stage
      script do |script_level|
        script_level.stage.script
      end
    end

    trait :with_autoplay_video do
      level {create(:level, :with_autoplay_video)}
    end

    level

    chapter do |script_level|
      (script_level.script.script_levels.maximum(:chapter) || 0) + 1
    end

    game_chapter do |script_level|
      (script_level.script.script_levels.maximum(:game_chapter) || 0) + 1
    end

    position do |script_level|
      (script_level.stage.script_levels.maximum(:position) || 0) + 1 if script_level.stage
    end
  end

  factory :stage do
    sequence(:name) { |n| "Bogus Stage #{n}" }
    script

    position do |stage|
      (stage.script.stages.maximum(:position) || 0) + 1
    end
  end

  factory :callout do
    sequence(:element_id) { |n| "#pageElement#{n}" }
    localization_key 'drag_blocks'
    script_level
  end

  factory :activity do
    level
    user
    level_source
  end

  factory :concept do
    sequence(:name) { |n| "Algorithm #{n}" }
    trait :with_video do
      video
    end
  end

  factory :video do
    sequence(:key) { |n| "concept_#{n}" }
    youtube_code 'Bogus text'
  end

  factory :prize do
    prize_provider
    sequence(:code) { |n| "prize_code_#{n}" }
  end

  factory :prize_provider do
  end

  factory :follower do
    section
    user { section.user }
    student_user { create :student }
  end

  factory :level_source_hint do
    level_source
    sequence(:hint) { |n| "Hint #{n}" }
  end

  factory :activity_hint do
    activity
  end

  factory :user_level do
    user {create :student}
  end

  factory :user_script do
    user {create :student}
    script
  end
end

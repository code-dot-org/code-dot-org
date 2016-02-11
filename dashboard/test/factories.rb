FactoryGirl.define do
  factory :survey_result do
    user { create :teacher }
    properties {{survey2016_ethnicity_asian: "1"}}
    properties {{survey2016_foodstamps: "3"}}
  end

  factory :professional_learning_course do
    name "Some course"
  end

  factory :professional_learning_module do
    name "Some module"
    learning_module_type "Some learning module type"
  end

  factory :professional_learning_task do
    name "Some task"
    professional_learning_module nil
  end

  factory :user do
    birthday Date.new(1991, 03, 14)
    sequence(:email) { |n| "testuser#{n}@example.com.xx" }
    password "00secret"
    locale 'en-US'
    sequence(:name) { |n| "User#{n} Codeberg" }
    user_type User::TYPE_STUDENT
    confirmed_at Time.now

    # Child of :user factory, since it's in the `factory :user` block
    factory :admin do
      admin true
    end

    factory :teacher do
      user_type User::TYPE_TEACHER
      birthday Date.new(1980, 03, 14)
      factory :facilitator do
        name 'Facilitator Person'
        after(:create) do |facilitator|
          facilitator.permission = 'facilitator'
          facilitator.save
        end
      end
      factory :district_contact do
        name 'District Contact Person'
        ops_first_name 'District'
        ops_last_name 'Person'
      end
    end

    factory :student do
      user_type User::TYPE_STUDENT
    end

    factory :young_student do
      user_type User::TYPE_STUDENT
      birthday Time.zone.today - 10.years
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
    sequence(:name) { |n| "Level_#{n}" }
    sequence(:level_num) {|n| "1_2_#{n}" }

    # User id must be non-nil for custom level
    user_id '1'
    game

    trait :with_autoplay_video do
      video_key {create(:video).key}
    end

    trait :never_autoplay_video_true do
      with_autoplay_video
      after(:create) do |level|
        level.never_autoplay_video = 'true'
        level.save!
      end
    end

    trait :never_autoplay_video_false do
      with_autoplay_video
      after(:create) do |level|
        level.never_autoplay_video = 'false'
        level.save!
      end
    end

    trait :blockly do
      game {create(:game, app: "maze", name: "Maze")}
    end

    trait :unplugged do
      game {create(:game, app: "unplug")}
    end

    trait :with_ideal_level_source do
      after :create do |level, _|
        level.ideal_level_source = create(:level_source, level: level)
        level.save!
      end
    end

    trait :script do
      create(:script_level)
    end
  end

  factory :unplugged, :parent => Level, :class => Unplugged do
    game {create(:game, app: "unplug")}
  end

  factory :match, :parent => Level, :class => Match do
    game {create(:game, app: "match")}
    properties{{title: 'title', answers: [{text: 'test', correct: true}], questions: [{text: 'test'}], options: {hide_submit: false}}}
  end

  factory :text_match, :parent => Level, :class => TextMatch do
    game {create(:game, app: "textmatch")}
    properties{{title: 'title', questions: [{text: 'test'}], options: {hide_submit: false}}}
  end

  factory :artist, :parent => Level, :class => Artist do
  end

  factory :maze, :parent => Level, :class => Maze do
    skin 'birds'
  end

  factory :applab, :parent => Level, :class => Applab do
    game {Game.applab}
  end

  factory :level_source do
    level
    data '<xml/>'
    md5 { Digest::MD5.hexdigest(data) }
    trait :with_image do
      level { create(:level, game: Game.find_by_app(Game::ARTIST))}
      after :create do |level_source, _|
        create :level_source_image, level_source: level_source
      end
    end
  end

  factory :level_source_image do
    level_source
  end

  factory :gallery_activity do
    user
    activity { create(:activity, level_source: create(:level_source, :with_image)) }
  end

  factory :script do
    sequence(:name) { |n| "bogus_script_#{n}" }
  end

  factory :script_level do
    script

    stage do |script_level|
      create(:stage, script: script_level.script)
    end

    trait :with_autoplay_video do
      level {create(:level, :with_autoplay_video)}
    end

    level

    trait :never_autoplay_video_true do
      level {create(:level, :never_autoplay_video_true)}
    end

    trait :never_autoplay_video_false do
      level {create(:level, :never_autoplay_video_false)}
    end

    chapter do |script_level|
      (script_level.script.script_levels.maximum(:chapter) || 0) + 1
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
    level {create :applab}
  end

  factory :user_script do
    user {create :student}
    script
  end

  factory :cohorts_district do
    cohort
    district
    max_teachers 5
  end

  factory :cohort do
    name 'Test Cohort'
  end

  factory :district do
    sequence(:name) { |n| "District #{n}" }
    location 'Panem'
    contact {create(:district_contact).tap{|dc|dc.permission = 'district_contact'}}
  end

  factory :workshop do
    sequence(:name) { |n| "My Workshop #{n}" }
    program_type '1'
    location 'Somewhere, USA'
    instructions 'Test workshop instructions.'
    facilitators {[create(:facilitator)]}
    cohorts {[create(:cohort)]}
    after :create do |workshop, _|
      create_list :segment, 1, workshop: workshop
    end
  end

  factory :segment do
    workshop
    start DateTime.now.utc
    self.send(:end, DateTime.now.utc + 1.day)
  end

  factory :attendance, class: WorkshopAttendance do
    segment
    teacher {create :teacher}

    status 'present'
  end
end

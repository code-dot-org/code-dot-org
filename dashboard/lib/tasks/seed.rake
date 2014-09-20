require "csv"

namespace :seed do
  verbose false

  task videos: :environment do
    Video.transaction do
      Video.reset_db
      CSV.read('config/videos.csv', { col_sep: "\t", headers: true }).each_with_index do |row, id|
        Video.create!(id: id + 1, key: row['Key'], youtube_code: row['YoutubeCode'], download: row['Download'])
      end
    end
  end

  STANFORD_HINTS_FILE = 'config/stanford-hints-bestPath1.tsv'
  STANFORD_HINTS_IMPORTED = 'config/scripts/.hints_imported'
  file STANFORD_HINTS_IMPORTED => STANFORD_HINTS_FILE do
    require_relative '../../config/environment'
    LevelSourceHint.transaction do
      source_name = LevelSourceHint::STANFORD
      LevelSourceHint.delete_all(['source=?', source_name])
      CSV.read(STANFORD_HINTS_FILE, { col_sep: "\t" }).each do |row|
        LevelSourceHint.create!(
            level_source_id: row[0], hint: row[1],
            status: 'experiment', source: source_name)
      end
    end
    touch STANFORD_HINTS_IMPORTED
  end

  task concepts: :environment do
    Concept.setup
  end

  task games: :environment do
    Game.setup
  end

  SCRIPTS_GLOB = Dir.glob('config/scripts/**/*.script').sort.flatten
  SEEDED = 'config/scripts/.seeded'

  file SEEDED => [SCRIPTS_GLOB, :environment].flatten do
    update_scripts
  end

  def update_scripts
    # Only process modified scripts on staging/levelbuilder to speed up seed time
    scripts_seeded_mtime = ((Rails.env.staging? || Rails.env.levelbuilder?) && File.exist?(SEEDED)) ?
      File.mtime(SEEDED) : Time.at(0)

    custom_scripts = SCRIPTS_GLOB.select { |script| File.mtime(script) > scripts_seeded_mtime }
    default_scripts = Dir.glob("config/scripts/default/*.yml").sort.select { |script| File.mtime(script) > scripts_seeded_mtime }
    Level.update_unplugged if File.mtime('config/locales/unplugged.en.yml') > scripts_seeded_mtime
    script, custom_i18n = Script.setup(default_scripts, custom_scripts)
    Script.update_i18n(custom_i18n)
    touch SEEDED
  end

  task scripts: [:environment, :games, :custom_levels, :multis, :matches] do
    update_scripts
  end

  # cronjob that detects changes to .multi files
  MULTIS_GLOB = Dir.glob('config/scripts/**/*.multi').sort.flatten
  file 'config/scripts/.multis_seeded' => MULTIS_GLOB do |t|
    Rake::Task['seed:multis'].invoke
    touch t.name
  end

  # explicit execution of "seed:multis"
  task multis: :environment do
    Multi.transaction do
      multi_strings = {}
      # Parse each .multi file and setup its model.
      MULTIS_GLOB.each do |script|
        data, i18n = MultiDSL.parse_file(script)
        Multi.setup data
        multi_strings.deep_merge! i18n
      end
      File.write("config/locales/multi.en.yml", multi_strings.to_yaml(options = {:line_width => -1}))
    end
  end

  # cronjob that detects changes to .match files
  MATCHES_GLOB = Dir.glob('config/scripts/**/*.match').sort.flatten
  file 'config/scripts/.matches_seeded' => MATCHES_GLOB do |t|
    Rake::Task['seed:matches'].invoke
    touch t.name
  end

 # explicit execution of "seed:matches"
  task matches: :environment do
    Match.transaction do
      match_strings = {}
      # Parse each .match file and setup its model.
      MATCHES_GLOB.each do |script|
        data, i18n = MatchDSL.parse_file(script)
        Match.setup data
        match_strings.deep_merge! i18n
      end
      File.write("config/locales/match.en.yml", match_strings.to_yaml(options = {:line_width => -1}))
    end
  end

  task import_custom_levels: :environment do
    Level.load_custom_levels
  end

  # Generate the database entry from the custom levels json file
  task custom_levels: :environment do
    if !Rails.env.levelbuilder? || ENV["FORCE_CUSTOM_LEVELS"]
      Level.load_custom_levels
    end
  end

  task callouts: :environment do
    Callout.transaction do
      Callout.reset_db
      # TODO if the id of the callout is important, specify it in the tsv
      # preferably the id of the callout is not important ;)
      Callout.find_or_create_all_from_tsv!('config/callouts.tsv')
    end
  end

  task trophies: :environment do
    # code in user.rb assumes that broze id: 1, silver id: 2 and gold id: 3.
    Trophy.transaction do
      Trophy.reset_db
      %w(Bronze Silver Gold).each_with_index do |trophy, id|
        Trophy.create!(id: id + 1, name: trophy, image_name: "#{trophy.downcase}trophy.png")
      end
    end
  end

  task prize_providers: :environment do
    PrizeProvider.transaction do
      PrizeProvider.reset_db
      # placeholder data - id's are assumed to start at 1 so prizes below can be loaded properly
      [{name: 'Apple iTunes', description_token: 'apple_itunes', url: 'http://www.apple.com/itunes/', image_name: 'itunes_card.jpg'},
      {name: 'Dropbox', description_token: 'dropbox', url: 'http://www.dropbox.com/', image_name: 'dropbox_card.jpg'},
      {name: 'Valve Portal', description_token: 'valve', url: 'http://www.valvesoftware.com/games/portal.html', image_name: 'portal2_card.png'},
      {name: 'EA Origin Bejeweled 3', description_token: 'ea_bejeweled', url: 'https://www.origin.com/en-us/store/buy/181609/mac-pc-download/base-game/standard-edition-ANW.html', image_name: 'bejeweled_card.jpg'},
      {name: 'EA Origin FIFA Soccer 13', description_token: 'ea_fifa', url: 'https://www.origin.com/en-us/store/buy/fifa-2013/pc-download/base-game/standard-edition-ANW.html', image_name: 'fifa_card.jpg'},
      {name: 'EA Origin SimCity 4 Deluxe', description_token: 'ea_simcity', url: 'https://www.origin.com/en-us/store/buy/sim-city-4/pc-download/base-game/deluxe-edition-ANW.html', image_name: 'simcity_card.jpg'},
      {name: 'EA Origin Plants vs. Zombies', description_token: 'ea_pvz', url: 'https://www.origin.com/en-us/store/buy/plants-vs-zombies/mac-pc-download/base-game/standard-edition-ANW.html', image_name: 'pvz_card.jpg'},
      {name: 'DonorsChoose.org $750', description_token: 'donors_choose', url: 'http://www.donorschoose.org/', image_name: 'donorschoose_card.jpg'},
      {name: 'DonorsChoose.org $250', description_token: 'donors_choose_bonus', url: 'http://www.donorschoose.org/', image_name: 'donorschoose_card.jpg'},
      {name: 'Skype', description_token: 'skype', url: 'http://www.skype.com/', image_name: 'skype_card.jpg'}].each_with_index do |pp, id|
        PrizeProvider.create!(pp.merge!({:id=>id + 1}))
      end
    end
  end

  task ideal_solutions: :environment do
    Level.order(:ideal_level_source_id). # trick to do the ones that don't have solutions yet first
      each do |level|
      level.calculate_ideal_level_source_id
    end
  end

  task :frequent_level_sources, [:freq_cutoff, :game_name] => :environment do |t, args|
    freq_cutoff = args[:freq_cutoff].to_i > 0 ? args[:freq_cutoff].to_i : 100
    FrequentUnsuccessfulLevelSource.populate(freq_cutoff, args[:game_name])
  end

  task dummy_prizes: :environment do
    # placeholder data
    Prize.connection.execute('truncate table prizes')
    TeacherPrize.connection.execute('truncate table teacher_prizes')
    TeacherBonusPrize.connection.execute('truncate table teacher_bonus_prizes')
    10.times do |n|
      string = n.to_s
      Prize.create!(prize_provider_id: 1, code: "APPL-EITU-NES0-000" + string)
      Prize.create!(prize_provider_id: 2, code: "DROP-BOX0-000" + string)
      Prize.create!(prize_provider_id: 3, code: "VALV-EPOR-TAL0-000" + string)
      Prize.create!(prize_provider_id: 4, code: "EAOR-IGIN-BEJE-000" + string)
      Prize.create!(prize_provider_id: 5, code: "EAOR-IGIN-FIFA-000" + string)
      Prize.create!(prize_provider_id: 6, code: "EAOR-IGIN-SIMC-000" + string)
      Prize.create!(prize_provider_id: 7, code: "EAOR-IGIN-PVSZ-000" + string)
      TeacherPrize.create!(prize_provider_id: 8, code: "DONO-RSCH-OOSE-750" + string)
      TeacherBonusPrize.create!(prize_provider_id: 9, code: "DONO-RSCH-OOSE-250" + string)
      Prize.create!(prize_provider_id: 10, code: "SKYP-ECRE-DIT0-000" + string)
    end
  end

  task :import_users, [:file] => :environment do |t, args|
    CSV.read(args[:file], { col_sep: "\t", headers: true }).each do |row|
      User.create!(
          provider: User::PROVIDER_MANUAL,
          name: row['Name'],
          username: row['Username'],
          password: row['Password'],
          password_confirmation: row['Password'],
          birthday: row['Birthday'].blank? ? nil : Date.parse(row['Birthday']))
    end
  end

  def import_prize_from_text(file, provider_id, col_sep)
    Rails.logger.info "Importing prize codes from: " + file + " for provider id " + provider_id.to_s
    CSV.read(file, { col_sep: col_sep, headers: false }).each do |row|
      if row[0].present?
        Prize.create!(prize_provider_id: provider_id, code: row[0])
      end
    end
  end

  task :import_itunes, [:file] => :environment do |t, args|
    import_prize_from_text(args[:file], 1, "\t")
  end

  task :import_dropbox, [:file] => :environment do |t, args|
    import_prize_from_text(args[:file], 2, "\t")
  end

  task :import_valve, [:file] => :environment do |t, args|
    import_prize_from_text(args[:file], 3, "\t")
  end

  task :import_ea_bejeweled, [:file] => :environment do |t, args|
    import_prize_from_text(args[:file], 4, "\t")
  end

  task :import_ea_fifa, [:file] => :environment do |t, args|
    import_prize_from_text(args[:file], 5, "\t")
  end

  task :import_ea_simcity, [:file] => :environment do |t, args|
    import_prize_from_text(args[:file], 6, "\t")
  end

  task :import_ea_pvz, [:file] => :environment do |t, args|
    import_prize_from_text(args[:file], 7, "\t")
  end

  task :import_skype, [:file] => :environment do |t, args|
    import_prize_from_text(args[:file], 10, ",")
  end

  task :import_donorschoose_750, [:file] => :environment do |t, args|
    Rails.logger.info "Importing teacher prize codes from: " + args[:file] + " for provider id 8"
    CSV.read(args[:file], { col_sep: ",", headers: true }).each do |row|
      if row['Gift Code'].present?
        TeacherPrize.create!(prize_provider_id: 8, code: row['Gift Code'])
      end
    end
  end

  task :import_donorschoose_250, [:file] => :environment do |t, args|
    Rails.logger.info "Importing teacher bonus prize codes from: " + args[:file] + " for provider id 9"
    CSV.read(args[:file], { col_sep: ",", headers: true }).each do |row|
      if row['Gift Code'].present?
        TeacherBonusPrize.create!(prize_provider_id: 9, code: row['Gift Code'])
      end
    end
  end

  task analyze_data: [:ideal_solutions, :frequent_level_sources]

  task secret_words: :environment do
    SecretWord.setup
  end

  task secret_pictures: :environment do
    SecretPicture.setup
  end

  task all: [:videos, :concepts, :scripts, :trophies, :prize_providers, :callouts, STANFORD_HINTS_IMPORTED, :secret_words, :secret_pictures]
end

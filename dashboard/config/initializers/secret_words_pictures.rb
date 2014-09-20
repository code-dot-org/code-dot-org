# configuration for secret words and pictures
Dashboard::Application.config.secret_words_csv = [secrets_dir('words.csv'), Rails.root.join('config/secret_words.csv')].select{|i|File.file?(i)}.first
Dashboard::Application.config.secret_pictures_csv = CDO.secret_pictures_csv || Rails.root.join('config/secret_pictures.csv')

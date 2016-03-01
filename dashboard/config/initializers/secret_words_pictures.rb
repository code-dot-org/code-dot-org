# configuration for secret words and pictures
Dashboard::Application.config.secret_words_csv = [Rails.root.join('config/real_secret_words.csv'), Rails.root.join('config/secret_words.csv')].find{|i|File.file?(i)}
Dashboard::Application.config.secret_pictures_csv = CDO.secret_pictures_csv || Rails.root.join('config/secret_pictures.csv')

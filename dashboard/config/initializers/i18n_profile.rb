require 'i18n'
require 'i18n/backend/base'

module I18n
  module Backend
    module Base
      alias_method :orig_load, :load_translations

    def load_translations(*filenames)
      start = Time.now.to_f
      orig_load
      puts "LOADING I18N TOOK #{1000 * (Time.now.to_f - start)}"
      return true
    end
    end
  end
end

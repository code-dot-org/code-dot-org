require 'i18n'
require 'active_support/core_ext/numeric/bytes'
require 'cdo/lmdb_key_value'

module Cdo
  # I18n backend instance used by the web application.
  class I18nBackend < ::I18n::Backend::KeyValue
    include ::I18n::Backend::CacheFile

    CACHE_DIR = pegasus_dir('cache', 'i18n/cache')
    CACHE_SIZE = 1.gigabyte

    def initialize
      store = LMDBKeyValue.new(CACHE_DIR, size: CACHE_SIZE)
      super(store, false)
      self.path_roots = [Gem.dir, deploy_dir]
    end

    def load_translations(*filenames)
      store.transaction {super}
    end

    alias init_translations load_translations
    alias reload! load_translations
  end
end
# Use custom i18n backend by enabling `CDO.i18n_key_value`.
# Default false in production environment during controlled roll-out.
CDO.i18n_backend = CDO.with_default(!rack_env?(:production)).i18n_key_value ?
  Cdo::I18nBackend.new :
  I18n::Backend::Simple.new

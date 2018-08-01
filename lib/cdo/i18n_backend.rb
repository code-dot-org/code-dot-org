require 'i18n'
require 'active_support/core_ext/numeric/bytes'
require 'cdo/key_value'

module Cdo
  # I18n backend instance used by the web application.
  class I18nBackend < ::I18n::Backend::KeyValue
    include ::I18n::Backend::CacheFile

    CACHE_DIR = pegasus_dir('cache', 'i18n/cache')

    def initialize
      store = KeyValue.new(CACHE_DIR)
      super(store, false)
      self.path_roots = [Gem.dir, deploy_dir]
    end

    def load_translations(*filenames)
      @loading = true
      super
      store.flush
      @loading = false
    end

    alias init_translations load_translations
    alias reload! load_translations

    def store_translations(*args)
      super.tap {store.flush unless @loading}
    end
  end
end
# Use custom i18n backend by enabling `CDO.i18n_key_value`.
# Default false during testing and controlled roll-out.
CDO.i18n_backend = CDO.with_default(false).i18n_key_value ?
  Cdo::I18nBackend.new :
  I18n::Backend::Simple.new

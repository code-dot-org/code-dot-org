# frozen_string_literal: true

module HocLegacy
  module Tutorials
    CACHE_KEY = 'hoc_legacy:tutorials'
    FETCH_ORDER = 'fields.tutorialID'
    FETCH_LIMIT = 200

    class << self
      # @param code [String] the tutorial code (tutorial_id)
      # @return [Contentful::Entry, nil] the Tutorial entry with the given code
      def get(code)
        store[code]
      end

      # @return [Boolean] true if the store was refreshed
      def refresh
        cache.write(CACHE_KEY, fetch_all)
      end

      # @return [Hash{String => Contentful::Entry}] a hash mapping tutorial codes to their Tutorial entries
      private def store
        cache.fetch(CACHE_KEY, force: CDO.rack_env?(:development)) {fetch_all} || {}
      end

      private def cache
        CDO.shared_cache
      end

      private def fetch_all
        CdoContentful::CsForAll::Entry::Tutorial.
          find_each(order: FETCH_ORDER, limit: FETCH_LIMIT).
          with_object({}) {|tutorial, data| data[tutorial.tutorial_id] = tutorial}
      end
    end
  end
end

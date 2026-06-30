# frozen_string_literal: true

require 'cdo/honeybadger'

module HocLegacy
  module Tutorials
    CACHE_KEY = 'hoc_legacy:tutorials'
    FETCH_ORDER = 'fields.tutorialID'
    FETCH_LIMIT = 200

    # Stub Tutorial entries for our ui-test-* courses, keyed by tutorial_id.
    #
    # The real tutorial store is backed by the Contentful CS-for-all space and
    # needs CDO.contentful_cs_for_all_access_token. To let the HoC begin/finish
    # -> congrats/certificate UI tests exercise a ui-test-* course without that
    # token, we serve these entries directly from hard-coded values in
    # development and test, without accessing Contentful.
    #
    # Each value is the primary_target that /api/hour/begin redirects to. It is
    # an absolute studio URL so the redirect lands on the studio host.
    #
    # /api/hour/finish/ routes do not need an explicit target, instead they
    # validate the tutorial id and then pass it to the congrats page.
    UI_TEST_TUTORIAL_PATHS = {
      'ui-test-artist' => '/s/ui-test-artist/reset',
    }.freeze

    # Minimal stand-in for a Contentful::Entry Tutorial, exposing only what the
    # HoC controller reads: #tutorial_id and #primary_link_ref.fields[:primary_target].
    StubLink = Struct.new(:fields)
    StubTutorial = Struct.new(:tutorial_id, :primary_target) do
      def primary_link_ref
        StubLink.new({primary_target: primary_target})
      end
    end

    class << self
      # @param code [String] the tutorial code (tutorial_id)
      # @return [Contentful::Entry, StubTutorial, nil] the Tutorial entry with the given code
      def get(code)
        ui_test_tutorials[code] || store[code]
      end

      # @return [Boolean] true if the store was refreshed
      def refresh
        cache.write(CACHE_KEY, fetch_all)
      end

      # @return [Boolean] true if the store was cleared
      def clear
        cache.delete(CACHE_KEY)
      end

      # Stub entries for ui-test- courses, keyed by tutorial_id. Empty
      # outside development and test, so production always resolves tutorials
      # through Contentful.
      #
      # @return [Hash{String => StubTutorial}]
      private def ui_test_tutorials
        return {} unless CDO.rack_env?(:development) || CDO.rack_env?(:test)

        UI_TEST_TUTORIAL_PATHS.to_h do |code, path|
          [code, StubTutorial.new(code, CDO.studio_url(path))]
        end
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
          find_each(order: FETCH_ORDER, limit: FETCH_LIMIT, 'tutorialID[exists]': true).
          with_object({}) do |tutorial, data|
            data[tutorial.tutorial_id] = tutorial
          rescue StandardError => exception
            Honeybadger.notify(
              exception,
              error_message: '[Contentful] Invalid Tutorial entry',
              context: {
                tutorial: tutorial.sys,
              },
            )
          end
      end
    end
  end
end

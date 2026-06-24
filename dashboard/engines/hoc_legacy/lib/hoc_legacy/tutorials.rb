# frozen_string_literal: true

require 'cdo/honeybadger'

module HocLegacy
  module Tutorials
    CACHE_KEY = 'hoc_legacy:tutorials'
    FETCH_ORDER = 'fields.tutorialID'
    FETCH_LIMIT = 200

    # The tutorial store is normally backed by the Contentful CS-for-all space,
    # which needs CDO.contentful_cs_for_all_access_token. The HoC UI tests must
    # not depend on that token, and instead rely on a stub implementation.
    #
    # When the `stub_tutorial_targets` config flag is set, we serve this small
    # allow-list of stub Tutorial entries instead of querying Contentful. It
    # takes priority over the access token.
    #
    # Each key is a tutorial_id (also the certificate course name passed by the
    # finish flow); each value is the primary_target that /api/hour/begin
    # redirects to.
    STUB_TUTORIAL_TARGETS = {
      'ui-test-artist' => '/s/ui-test-artist/reset',
      'flappy'         => '/s/flappy/reset',
      'oceans'         => '/s/oceans/reset',
      'mc'             => '/s/mc/reset',
      'kodable'        => 'https://www.kodable.com',
    }.freeze

    # Minimal stand-in for a Contentful::Entry Tutorial, exposing only what the
    # HoC controller and services read: `tutorial_id` and
    # `primary_link_ref.fields[:primary_target]`.
    StubLinkRef = Struct.new(:fields)
    StubTutorial = Struct.new(:tutorial_id, :primary_target) do
      def primary_link_ref
        StubLinkRef.new({primary_target: primary_target})
      end
    end

    class << self
      # @param code [String] the tutorial code (tutorial_id)
      # @return [Contentful::Entry, StubTutorial, nil] the Tutorial entry with the given code
      def get(code)
        store[code]
      end

      # @return [Boolean] true if the store was refreshed
      def refresh
        return false if CDO.stub_tutorial_targets

        cache.write(CACHE_KEY, fetch_all)
      end

      # @return [Boolean] true if the store was cleared
      def clear
        cache.delete(CACHE_KEY)
      end

      # @return [Hash{String => Contentful::Entry, StubTutorial}] a hash mapping tutorial codes to their Tutorial entries
      private def store
        return stub_store if CDO.stub_tutorial_targets

        cache.fetch(CACHE_KEY, force: CDO.rack_env?(:development)) {fetch_all} || {}
      end

      private def stub_store
        STUB_TUTORIAL_TARGETS.to_h do |code, primary_target|
          [code, StubTutorial.new(code, primary_target)]
        end
      end

      private def cache
        CDO.shared_cache
      end

      # Raises an actionable error when the Contentful query is attempted with
      # neither the stub nor an access token configured.
      private def require_contentful_access!
        return if CDO.contentful_cs_for_all_access_token.present?

        raise <<~MESSAGE
          HocLegacy::Tutorials cannot reach the Contentful CS-for-all space: neither
          stub_tutorial_targets nor contentful_cs_for_all_access_token is set.
          Set `stub_tutorial_targets: true` in locals.yml to run without Contentful
          (for example, to run UI tests), or set contentful_cs_for_all_access_token
          for prod-like behavior. stub_tutorial_targets takes priority when both are set.
        MESSAGE
      end

      private def fetch_all
        require_contentful_access!

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

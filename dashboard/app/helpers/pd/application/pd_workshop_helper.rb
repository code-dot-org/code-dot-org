module Pd::Application
  module PdWorkshopHelper
    include Pd::Application::RegionalPartnerTeacherconMapping
    def self.included(base)
      base.send :include, InstanceMethods
      base.extend ClassMethods
    end

    CACHE_TTL = 30.seconds.freeze

    module InstanceMethods
      def workshop
        return nil unless pd_workshop_id

        # attempt to retrieve from cache
        cache_fetch self.class.get_workshop_cache_key(pd_workshop_id) do
          Pd::Workshop.includes(:sessions, :enrollments).find_by(id: pd_workshop_id)
        end
      end

      def workshop_date_and_location
        workshop.try(&:date_and_location_name)
      end

      def log_summer_workshop_change(user)
        update_status_timestamp_change_log(user, "Summer Workshop: #{pd_workshop_id ? workshop_date_and_location : 'Unassigned'}")
      end

      def registered_workshop?
        # inspect the cached workshop.enrollments rather than querying the DB
        workshop&.enrollments&.any? {|e| e.user_id == user.id}
      end

      # Attempts to fetch a value from the Rails cache, executing the supplied block
      # when the specified key doesn't exist or has expired
      # @param key [String] cache key
      # @yield [Object] the raw, uncached, object.
      #   Note, when this is run, the result will be stored in the cache
      def cache_fetch(key)
        Rails.cache.fetch(key, expires_in: CACHE_TTL) do
          yield
        end
      end
    end

    module ClassMethods
      def prefetch_workshops(workshop_ids)
        return if workshop_ids.empty?

        Pd::Workshop.includes(:sessions, :enrollments).where(id: workshop_ids).each do |workshop|
          Rails.cache.write get_workshop_cache_key(workshop.id), workshop, expires_in: CACHE_TTL
        end
      end

      def get_workshop_cache_key(workshop_id)
        "#{self.class.name}.workshop(#{workshop_id})"
      end
    end
  end
end

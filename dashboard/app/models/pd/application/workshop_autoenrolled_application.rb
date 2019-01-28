# == Schema Information
#
# Table name: pd_applications
#
#  id                          :integer          not null, primary key
#  user_id                     :integer
#  type                        :string(255)      not null
#  application_year            :string(255)      not null
#  application_type            :string(255)      not null
#  regional_partner_id         :integer
#  status                      :string(255)
#  locked_at                   :datetime
#  notes                       :text(65535)
#  form_data                   :text(65535)      not null
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  course                      :string(255)
#  response_scores             :text(65535)
#  application_guid            :string(255)
#  accepted_at                 :datetime
#  properties                  :text(65535)
#  deleted_at                  :datetime
#  status_timestamp_change_log :text(65535)
#
# Indexes
#
#  index_pd_applications_on_application_guid     (application_guid)
#  index_pd_applications_on_application_type     (application_type)
#  index_pd_applications_on_application_year     (application_year)
#  index_pd_applications_on_course               (course)
#  index_pd_applications_on_regional_partner_id  (regional_partner_id)
#  index_pd_applications_on_status               (status)
#  index_pd_applications_on_type                 (type)
#  index_pd_applications_on_user_id              (user_id)
#

# This subclass exists to allow Applications to be associated with a Workshop
# and to automatically enroll the associated user in the workshop upon
# acceptance

module Pd::Application
  class WorkshopAutoenrolledApplication < ApplicationBase
    include RegionalPartnerTeacherconMapping

    CACHE_TTL = 30.seconds.freeze

    before_save :destroy_autoenrollment, if: -> {status_changed? && status != "accepted"}
    def destroy_autoenrollment
      return unless auto_assigned_enrollment_id

      Pd::Enrollment.find_by(id: auto_assigned_enrollment_id).try(:destroy)
      self.auto_assigned_enrollment_id = nil
    end

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

    # override
    def lock!
      return if locked?
      super
    end

    def enroll_user
      return unless pd_workshop_id

      enrollment = Pd::Enrollment.where(
        pd_workshop_id: pd_workshop_id,
        email: user.email
      ).first_or_initialize

      # If this is a new enrollment, we want to:
      #   - save it with all required data
      #   - save a reference to it in properties
      #   - delete the previous auto-created enrollment if it exists
      if enrollment.new_record?
        enrollment.update(
          user: user,
          school_info: user.school_info,
          full_name: user.name
        )
        enrollment.save!

        destroy_autoenrollment
        self.auto_assigned_enrollment_id = enrollment.id
      end
    end

    def workshop_course
      return Pd::Workshop::COURSE_CSD if course == 'csd'
      return Pd::Workshop::COURSE_CSP if course == 'csp'
    end

    def registered_workshop?
      # inspect the cached workshop.enrollments rather than querying the DB
      workshop&.enrollments&.any? {|e| e.user_id == user.id} if pd_workshop_id
    end

    def self.prefetch_associated_models(applications)
      prefetch_workshops applications.map(&:pd_workshop_id).uniq.compact
    end

    def self.prefetch_workshops(workshop_ids)
      return if workshop_ids.empty?

      Pd::Workshop.includes(:sessions, :enrollments).where(id: workshop_ids).each do |workshop|
        Rails.cache.write get_workshop_cache_key(workshop.id), workshop, expires_in: CACHE_TTL
      end
    end

    def self.get_workshop_cache_key(workshop_id)
      "Pd::Application::WorkshopAutoenrolledApplication.workshop(#{workshop_id})"
    end

    # Attempts to fetch a value from the Rails cache, executing the supplied block
    # when the specified key doesn't exist or has expired
    # @param key [String] cache key
    # @yieldreturn [Object] the raw, uncached, object.
    #   Note, when this is run, the result will be stored in the cache
    def cache_fetch(key, &block)
      Rails.cache.fetch(key, expires_in: CACHE_TTL) do
        yield
      end
    end
  end
end

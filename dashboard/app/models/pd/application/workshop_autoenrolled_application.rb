# == Schema Information
#
# Table name: pd_applications
#
#  id                                  :integer          not null, primary key
#  user_id                             :integer
#  type                                :string(255)      not null
#  application_year                    :string(255)      not null
#  application_type                    :string(255)      not null
#  regional_partner_id                 :integer
#  status                              :string(255)
#  locked_at                           :datetime
#  notes                               :text(65535)
#  form_data                           :text(65535)      not null
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  course                              :string(255)
#  response_scores                     :text(65535)
#  application_guid                    :string(255)
#  decision_notification_email_sent_at :datetime
#  accepted_at                         :datetime
#  properties                          :text(65535)
#  deleted_at                          :datetime
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
    include SerializedProperties

    CACHE_TTL = 30.seconds.freeze

    serialized_attrs %w(
      pd_workshop_id
      auto_assigned_enrollment_id
    )

    has_one :pd_teachercon1819_registration,
      class_name: 'Pd::Teachercon1819Registration',
      foreign_key: 'pd_application_id'

    before_save :destroy_autoenrollment, if: -> {status_changed? && status != "accepted"}
    def destroy_autoenrollment
      return unless auto_assigned_enrollment_id

      Pd::Enrollment.find_by(id: auto_assigned_enrollment_id).try(:destroy)
      self.auto_assigned_enrollment_id = nil
    end

    # Queries for locked and (accepted or withdrawn) and assigned to a teachercon workshop
    # @param [ActiveRecord::Relation<Pd::Application::WorkshopAutoenrolledApplication>] applications_query
    #   (optional) defaults to all
    # @note this is not chainable since it inspects pd_workshop_id from serialized attributes,
    #   which must be done in the model.
    # @return [array]
    def self.teachercon_cohort(applications_query = all)
      teachercon_ids = Pd::Workshop.
        in_year(2018).
        where(subject: Pd::Workshop::SUBJECT_TEACHER_CON).
        pluck(:id)

      return applications_query.
        where(type: descendants.map(&:name)). # this is an abstract class, so query descendant types
        where(status: [:accepted, :withdrawn]).
        where.not(locked_at: nil).
        includes(:pd_teachercon1819_registration).
        all.
        select {|application| application.pd_workshop_id && teachercon_ids.include?(application.pd_workshop_id)}
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

    # override
    def lock!
      return if locked?
      super
      enroll_user if status == "accepted"
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

    # Assigns the default workshop, if one is not yet assigned
    def assign_default_workshop!
      return if pd_workshop_id
      update! pd_workshop_id: find_default_workshop.try(:id)
    end

    def find_default_workshop
      return unless regional_partner

      # If this application is associated with a G3 partner who in turn is
      # associated with a specific teachercon, return the workshop for that
      # teachercon
      if regional_partner.group == 3
        teachercon = get_matching_teachercon(regional_partner)
        if teachercon
          return find_teachercon_workshop(course: workshop_course, city: teachercon[:city], year: 2018)
        end
      end

      # Default to just assigning whichever of the partner's eligible workshops
      # is scheduled to start first. We expect to hit this case for G1 and G2
      # partners, and for any G3 partners without an associated teachercon
      regional_partner.
        pd_workshops_organized.
        where(
          course: workshop_course,
          subject: [
            Pd::Workshop::SUBJECT_TEACHER_CON,
            Pd::Workshop::SUBJECT_SUMMER_WORKSHOP
          ]
        ).
        order_by_scheduled_start.
        first
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

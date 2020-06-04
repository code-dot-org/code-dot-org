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

module Pd::Application
  class Facilitator1920Application < FacilitatorApplicationBase
    include Pd::Facilitator1920ApplicationConstants

    has_one :pd_fit_weekend1920_registration,
      class_name: 'Pd::FitWeekend1920Registration',
      foreign_key: 'pd_application_id'

    validates_uniqueness_of :user_id

    before_save :log_status, if: -> {status_changed?}

    after_create :clear_extraneous_answers

    serialized_attrs %w(
      status_log
    )

    #override
    def year
      YEAR_19_20
    end

    # Are we still accepting applications?
    APPLICATION_CLOSE_DATE = Date.new(2019, 5, 1)
    def self.open?
      Time.zone.now < APPLICATION_CLOSE_DATE
    end

    #override
    def self.statuses
      %w(
        unreviewed
        pending
        interview
        accepted
        declined
        waitlisted
        withdrawn
      )
    end

    # These statuses are considered "decisions", and will queue an email that will be sent by cronjob the next morning
    # In these decision emails, status and email_type are the same.
    AUTO_EMAIL_STATUSES = %w(
      declined
      waitlisted
    )

    has_many :emails, class_name: 'Pd::Application::Email', foreign_key: 'pd_application_id'

    def on_successful_create
      queue_email :confirmation, deliver_now: true
    end

    # Queries for locked and (accepted or withdrawn) CSD/CSP facilitator applications
    # that have filled out the FiT Weekend Registration form.
    # @param [ActiveRecord::Relation<Pd::Application::Facilitator1920Application>] applications_query
    #   (optional) defaults to all
    # @note this is not chainable since it inspects fit_workshop_id from serialized attributes,
    #   which must be done in the model.
    # @return [array]
    def self.fit_cohort(applications_query = all)
      applications_query.
        where(type: name).
        where(course: [:csd, :csp]).
        where(status: [:accepted, :withdrawn]).
        where.not(locked_at: nil).
        includes(:pd_fit_weekend1920_registration)
    end

    # @override
    def check_idempotency
      Pd::Application::Facilitator1920Application.find_by(user: user)
    end

    def fit_weekend_registration
      Pd::FitWeekend1920Registration.find_by_pd_application_id(id)
    end

    # @override
    # @param [Pd::Application::Email] email
    # Note - this should only be called from within Pd::Application::Email.send!
    def deliver_email(email)
      unless email.pd_application_id == id
        raise "Expected application id #{id} from email #{email.id}. Actual: #{email.pd_application_id}"
      end

      # email_type maps to the mailer action
      FacilitatorApplicationMailer.send(email.email_type, self).deliver_now
    end

    def log_status
      self.status_log ||= []
      status_log.push({status: status, at: Time.zone.now})
    end

    def lock!
      super

      # delete any unsent emails, and queue a new status email if appropriate
      emails.unsent.destroy_all
      queue_email(status) if should_send_decision_email?
    end

    def should_send_decision_email?
      AUTO_EMAIL_STATUSES.include?(status)
    end

    # memoize in a hash, per course
    FILTERED_LABELS ||= Hash.new do |h, key|
      labels_to_remove = key == 'csf' ?
        [
          :csd_csp_lead_summer_workshop_requirement,
          :csd_csp_which_fit_weekend,
          :csd_csp_workshop_requirement,
          :csd_csp_lead_summer_workshop_requirement,
          :csd_csp_deeper_learning_requirement,
          :csd_csp_good_standing_requirement,
          :csd_csp_partner_with_summer_workshop,
          :csd_csp_which_summer_workshop
        ]
        : # csd / csp
        [
          :csf_good_standing_requirement,
          :csf_summit_requirement,
          :csf_workshop_requirement,
          :csf_community_requirement
        ]

      h[key] = ALL_LABELS_WITH_OVERRIDES.except(*labels_to_remove)
    end

    # @override
    # Filter out extraneous answers, based on selected program (course)
    def self.filtered_labels(course)
      raise "Invalid course #{course}" unless VALID_COURSES.include?(course)
      FILTERED_LABELS[course]
    end

    # List of columns to be filtered out based on selected program (course)
    def self.columns_to_remove(course)
      if course == 'csf'
        CSV_LABELS.keys.select {|k| k.to_s.start_with?('csd', 'csp')}
      elsif course == 'csd'
        CSV_LABELS.keys.select {|k| k.to_s.start_with?('csf', 'csp')}
      else
        CSV_LABELS.keys.select {|k| k.to_s.start_with?('csf', 'csd_training')}
      end
    end

    def self.csv_filtered_labels(course)
      labels = {}
      labels_to_remove = Pd::Application::Facilitator1920Application.columns_to_remove(course)

      CSV_LABELS.keys.each do |k|
        unless labels_to_remove.include? k.to_sym
          labels[k] = CSV_LABELS[k]
        end
      end
      labels
    end

    # @override
    def self.csv_header(course)
      # strip all markdown formatting out of the labels
      markdown = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)
      CSV.generate do |csv|
        columns = csv_filtered_labels(course).values.map {|l| markdown.render(l)}.map(&:strip)
        csv << columns
      end
    end

    # @override
    def to_csv_row(course)
      columns_to_exclude = Pd::Application::Facilitator1920Application.columns_to_remove(course)
      CSV.generate do |csv|
        row = []
        CSV_LABELS.keys.each do |k|
          unless columns_to_exclude.include? k.to_sym
            row.push(full_answers[k] || try(k) || all_scores[k])
          end
        end
        csv << row
      end
    end

    # @override
    def default_response_score_hash
      {
        meets_minimum_criteria_scores: {},
        bonus_points_scores: {}
      }
    end

    def meets_criteria
      response_scores = response_scores_hash[:meets_minimum_criteria_scores] || {}

      scored_questions = SCOREABLE_QUESTIONS["criteria_score_questions_#{course}".to_sym]

      scores = scored_questions.map {|q| response_scores[q]}

      if scores.uniq == [YES]
        YES
      elsif NO.in? scores
        NO
      else
        REVIEWING_INCOMPLETE
      end
    end

    def total_score
      (response_scores_hash[:bonus_points_scores] || {}).values.map(&:to_i).reduce(:+) || 0
    end

    def all_scores
      bonus_points_scores = response_scores_hash[:bonus_points_scores]
      all_score_hash = {
        total_score: "#{bonus_points_scores.values.map(&:to_i).reduce(:+) || 0} / #{SCOREABLE_QUESTIONS[:bonus_points].size * 5}"
      }

      BONUS_POINT_CATEGORIES.each_pair do |category, keys|
        all_score_hash[category] = "#{bonus_points_scores.slice(*keys).values.map(&:to_i).reduce(:+) || 0} / #{keys.length * 5}"
      end

      all_score_hash
    end

    def clear_extraneous_answers
      course_specific_questions_to_remove =
        if course == 'csf'
          [CSD_SPECIFIC_KEYS, CSP_SPECIFIC_KEYS].flatten.uniq
        elsif course == 'csd'
          [CSF_SPECIFIC_KEYS, CSP_SPECIFIC_KEYS - CSD_SPECIFIC_KEYS].flatten.uniq
        elsif course == 'csp'
          [CSF_SPECIFIC_KEYS, CSD_SPECIFIC_KEYS - CSP_SPECIFIC_KEYS].flatten.uniq
        end

      self.form_data_hash = sanitize_form_data_hash.except(*course_specific_questions_to_remove)

      save
    end
  end
end

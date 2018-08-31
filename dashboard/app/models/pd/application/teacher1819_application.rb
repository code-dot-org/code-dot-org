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

module Pd::Application
  class Teacher1819Application < TeacherApplicationBase
    include ::Pd::Teacher1819ApplicationConstants

    # @override
    def year
      YEAR_18_19
    end

    # @override
    def check_idempotency
      Teacher1819Application.find_by(user: user)
    end

    def teachercon_registration
      Pd::Teachercon1819Registration.find_by_pd_application_id(id)
    end

    def send_decision_notification_email
      # We only want to email unmatched and G3-matched teachers. All teachers
      # matched with G1 or G2 partners will be emailed by their partners.
      return if regional_partner && regional_partner.group != 3

      # Accepted, declined, and waitlisted are the only valid "final" states;
      # all other states shouldn't need emails
      return unless %w(accepted declined waitlisted).include?(status)

      if status == "accepted"
        # Acceptance emails need to be handled specially, since they not only
        # require an associated workshop but also come in two flavors depending
        # on the nature of the workshop
        return unless pd_workshop_id

        if workshop.teachercon?
          Pd::Application::Teacher1819ApplicationMailer.teachercon_accepted(self).deliver_now
        elsif workshop.local_summer?
          Pd::Application::Teacher1819ApplicationMailer.local_summer_accepted(self).deliver_now
        else
          # Applications should only ever be associated with a workshop that
          # falls into one of the above two categories, but if a mistake was
          # made, notify honeybadger
          Honeybadger.notify(
            error_message: 'Accepted application has invalid workshop',
            context: {
              application_id: id,
              pd_workshop_id: pd_workshop_id,
            }
          )
        end
      else
        Pd::Application::Teacher1819ApplicationMailer.send(status, self).deliver_now
      end
      update!(decision_notification_email_sent_at: Time.zone.now)
    end

    # @override
    def to_cohort_csv_row(optional_columns)
      columns = [
        date_accepted,
        applicant_name,
        district_name,
        school_name,
        user.email,
        status,
        workshop_date_and_location
      ]
      if optional_columns[:registered_workshop]
        if workshop.try(:local_summer?)
          columns.push(registered_workshop? ? 'Yes' : 'No')
        else
          columns.push nil
        end
      end
      if optional_columns[:accepted_teachercon]
        if workshop.try(:teachercon?)
          columns.push(pd_teachercon1819_registration ? 'Yes' : 'No')
        else
          columns.push nil
        end
      end

      CSV.generate do |csv|
        csv << columns
      end
    end

    # Called once after the application is submitted, and the principal approval is done
    # Automatically scores the application based on given responses for this and the
    # principal approval application. It is idempotent, and will not override existing
    # scores on this application
    def auto_score!
      responses = sanitize_form_data_hash

      scores = {
        regional_partner_name: regional_partner ? YES : NO,
        committed: responses[:committed] == YES ? YES : NO
      }

      if responses[:able_to_attend_single]
        scores[:able_to_attend_single] = able_attend_single_to_yes_no_score(responses[:able_to_attend_single])
      elsif responses[:able_to_attend_multiple]
        scores[:able_to_attend_multiple] = able_attend_multiple_to_yes_no_score(responses[:able_to_attend_multiple])
      end

      if responses[:principal_approval] == YES
        scores.merge!(
          {
            principal_approval: YES,
            schedule_confirmed: yes_no_response_to_yes_no_score(responses[:schedule_confirmed]),
            diversity_recruitment: yes_no_response_to_yes_no_score(responses[:diversity_recruitment]),
            free_lunch_percent: responses[:free_lunch_percent].to_f >= 50 ? 5 : 0,
            underrepresented_minority_percent:  responses[:underrepresented_minority_percent].to_f >= 50 ? 5 : 0,
            wont_replace_existing_course: responses[:wont_replace_existing_course].try(:start_with?, NO) ? 5 : nil,
          }
        )
      elsif responses[:principal_approval] == NO
        scores[:principal_approval] = NO
      end

      if course == 'csp'
        scores[:csp_which_grades] = responses[:csp_which_grades].any? ? YES : NO
        scores[:csp_course_hours_per_year] = responses[:csp_course_hours_per_year] == COMMON_OPTIONS[:course_hours_per_year].first ? YES : NO
        scores[:previous_yearlong_cdo_pd] = responses[:previous_yearlong_cdo_pd].exclude?('CS Principles') ? YES : NO
        scores[:csp_how_offer] = responses[:csp_how_offer] != Pd::Application::Teacher1819Application.options[:csp_how_offer].first ? 2 : 0
        scores[:taught_in_past] = responses[:taught_in_past].none? {|x| x.include? 'AP'} ? 2 : 0
      elsif course == 'csd'
        scores[:csd_which_grades] = (responses[:csd_which_grades].map(&:to_i) & (6..10).to_a).any? ? YES : NO
        scores[:csd_course_hours_per_year] = responses[:csd_course_hours_per_year] != COMMON_OPTIONS[:course_hours_per_year].last ? YES : NO
        scores[:previous_yearlong_cdo_pd] = (responses[:previous_yearlong_cdo_pd] & ['CS Discoveries', 'Exploring Computer Science']).empty? ? YES : NO
        scores[:taught_in_past] = responses[:taught_in_past].include?(Pd::Application::Teacher1819Application.options[:taught_in_past].last) ? 2 : 0
      end

      # Update the hash, but don't override existing scores
      update(response_scores: response_scores_hash.merge(scores) {|_, old_value, _| old_value}.to_json)
    end
  end
end

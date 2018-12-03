module Pd::WorkshopSurveyResultsHelper
  LOCAL_WORKSHOP_MULTIPLE_CHOICE_FIELDS_IN_SUMMARY = [
    :how_much_learned,
    :how_motivating,
    :how_clearly_presented,
    :how_interesting,
    :how_often_given_feedback,
    :how_comfortable_asking_questions,
    :how_often_taught_new_things,
    :help_quality,
    :how_much_participated,
    :how_often_talk_about_ideas_outside,
    :how_often_lost_track_of_time,
    :how_excited_before,
    :overall_how_interested,
    :more_prepared_than_before,
    :know_where_to_go_for_help,
    :suitable_for_my_experience,
    :would_recommend,
    :part_of_community,
    :confident_can_teach,
    :anticipate_continuing,
    :received_clear_communication,
    :believe_all_students
  ]

  FREE_RESPONSE_FIELDS_IN_SUMMARY = [
    :venue_feedback,
    :things_you_liked,
    :things_you_would_change,
    :things_facilitator_did_well,
    :things_facilitator_could_improve,
    :who_facilitated
  ]

  LOCAL_WORKSHOP_FIELDS_IN_SUMMARY = (LOCAL_WORKSHOP_MULTIPLE_CHOICE_FIELDS_IN_SUMMARY + FREE_RESPONSE_FIELDS_IN_SUMMARY).freeze
  TEACHERCON_MULTIPLE_CHOICE_FIELDS = (Pd::TeacherconSurvey.public_required_fields & Pd::TeacherconSurvey.options.keys).freeze
  TEACHERCON_FIELDS_IN_SUMMARY = (Pd::TeacherconSurvey.public_fields).freeze

  QUESTIONS_FOR_FACILITATOR_AVERAGES = {
    FACILITATOR_EFFECTIVENESS: [
      {primary_id: 'overallHow'},
      {primary_id: 'duringYour'},
      {primary_id: 'forThis54'},
      {primary_id: 'howInteresting55'},
      {primary_id: 'howOften56'},
      {primary_id: 'howComfortable', all_ids: %w(howComfortable howComfortable57)},
      {primary_id: 'howOften'}
    ],
    TEACHER_ENGAGEMENT: [
      {primary_id: 'pleaseRate120_0'},
      {primary_id: 'pleaseRate120_1'},
      {primary_id: 'pleaseRate120_2'}
    ],
    OVERALL_SUCCESS: [
      {primary_id: 'iFeel133', all_ids: ['iFeel133', 'pleaseRate_0', 'iFeel45']},
      {primary_id: 'regardingThe_2', all_ids: ['regardingThe_2', 'pleaseRate_1']},
      {primary_id: 'pleaseRate_2', all_ids: ['pleaseRate_2', 'regardingThe_3']},
      {primary_id: 'iWould', all_ids: ['iWould', 'pleaseRate_4']},
      {primary_id: 'pleaseRate_3'}
    ]
  }

  QUESTIONS_FOR_FACILITATOR_AVERAGES_LIST = QUESTIONS_FOR_FACILITATOR_AVERAGES.values.flatten(1)

  include Pd::JotForm
  include Pd::WorkshopSurveyConstants

  # The output is a hash where
  # - Multiple choice answers (aka scored answers) that are not facilitator specific turn
  #   into an average of all responses
  # - Free responses that are not facilitator specific turn into an array of all responses
  # - Multiple choice answers that are facilitator specific turn into:
  #   A hash of facilitators and the average of their scores if no facilitator specified
  #   OR The average of all responses for one facilitator if facilitator specified
  # - Free response answers that are facilitator specific turn into:
  #   A hash of facilitators and a list of all their answers
  #   OR A list of all responses for one facilitator if facilitator specified
  #
  # @param workshops List of Workshops to aggregate surveys
  # @param facilitator_name_filter Facilitator name to restrict responses for
  # @param facilitator_breakdown Whether to have a facilitator breakdown
  # @returns Hash representing an average of all the respones, or array of free text responses
  def summarize_workshop_surveys(workshops:, facilitator_name_filter: nil, facilitator_breakdown: true, include_free_response: true)
    # Works on arrays where everything is either a teachercon survey or workshop survey
    # (but not both)
    surveys = workshops.flat_map(&:survey_responses)

    raise 'Currently just summarizes Local Summer and Teachercon surveys' unless
      surveys.all? {|survey| survey.is_a? Pd::TeacherconSurvey} ||
        surveys.all? {|survey| survey.is_a? Pd::LocalSummerWorkshopSurvey}

    return Hash.new if surveys.empty?

    questions = surveys.first.class.options
    facilitator_specific_options = surveys.first.class.facilitator_required_fields

    # Hash representing overall score sums
    sum_hash = Hash.new(0)
    responses_per_facilitator = Hash.new(0)

    fields_to_summarize =
      if surveys.first.is_a? Pd::LocalSummerWorkshopSurvey
        include_free_response ? LOCAL_WORKSHOP_FIELDS_IN_SUMMARY : LOCAL_WORKSHOP_MULTIPLE_CHOICE_FIELDS_IN_SUMMARY
      else
        include_free_response ? TEACHERCON_FIELDS_IN_SUMMARY : TEACHERCON_MULTIPLE_CHOICE_FIELDS
      end

    # Ugly branchy way to compute the summarization for the user
    surveys.each do |response|
      response_hash = facilitator_name_filter ?
                        response.generate_summary_for_facilitator(facilitator_name_filter) :
                        response.public_sanitized_form_data_hash

      response_hash[:who_facilitated].each {|name| responses_per_facilitator[name] += 1}

      response_hash.each do |k, v|
        next unless fields_to_summarize.include? k
        # Multiple choice questions
        if questions.key? k
          if v.is_a? Hash
            if facilitator_breakdown
              # Multiple choice answers for each facilitator
              sum_hash[k] = Hash.new(0) if sum_hash[k] == 0

              v.each do |name, answer|
                sum_hash[k][name] += questions[k].index(answer) + 1
              end
            else
              sum_hash[k] += v.values.map {|value| questions[k].index(value) + 1}.reduce(:+)
            end
          else
            next unless v.presence && questions[k].include?(v)

            # Multiple choice answer for the workshop as a whole
            sum_hash[k] += questions[k].index(v) + 1
          end
        else
          # The answer is a free response - either specific to the faciliator or in general
          if v.is_a? Hash
            # Hash, indicating facilitator specific free responses
            sum_hash[k] = Hash.new if sum_hash[k] == 0

            v.each do |name, answer|
              if sum_hash[k].key? name
                sum_hash[k][name] << answer
              else
                sum_hash[k][name] = [answer]
              end
            end
          else
            # Free response answers for the workshop as a whole
            sum_hash[k] = [] if sum_hash[k] == 0

            sum_hash[k] << v if v.presence
          end
        end
      end
    end

    sum_hash.each do |k, v|
      next unless questions.key? k

      if v.is_a? Integer
        sum_hash[k] =
          if facilitator_specific_options.include?(k)
            if facilitator_name_filter
              # For facilitator specific questions, take the average over all responses for that facilitator
              (v / responses_per_facilitator[facilitator_name_filter].to_f).round(2)
            else
              (v / responses_per_facilitator.values.reduce(:+).to_f).round(2)
            end
          else
            # For non facilitator specific answers, take the average over all surveys
            (v / surveys.count.to_f).round(2)
          end
      else
        v.each do |name, value|
          sum_hash[k][name] = (value / responses_per_facilitator[name].to_f).round(2)
        end
      end
    end

    sum_hash[:num_enrollments] = workshops.flat_map(&:enrollments).size
    sum_hash[:num_surveys] = surveys.size

    sum_hash.default = nil

    sum_hash
  end

  def generate_workshop_daily_session_summary(workshop)
    summary = {
      this_workshop: {},
      course_name: workshop.course
    }

    questions = get_questions_for_forms(workshop)

    summary[:questions] = questions

    summary[:this_workshop] = generate_workshops_survey_summary([workshop], questions)

    related_workshops =
      if current_user.permission?(UserPermission::WORKSHOP_ADMIN)
        [workshop]
      elsif current_user.permission?(UserPermission::WORKSHOP_ORGANIZER) || current_user.permission?(UserPermission::PROGRAM_MANAGER)
        Pd::Workshop.organized_by(current_user).where(course: workshop.course)
      else
        Pd::Workshop.facilitated_by(current_user).where(course: workshop.course)
      end

    summary[:all_my_workshops] = generate_workshops_survey_summary(related_workshops, questions) if related_workshops

    summary[:facilitators] = Hash[*workshop.facilitators.pluck(:id, :name).flatten]

    if should_only_show_current_user?
      summary[:facilitators].slice! current_user.id
    end

    generate_facilitator_averages(summary)

    generate_facilitator_response_counts(summary, workshop, related_workshops)

    summary
  end

  def generate_workshops_survey_summary(workshops, questions)
    surveys = get_surveys_for_workshops(workshops)

    workshop_summary = {}
    facilitator_map = Hash[*workshops.flat_map(&:facilitators).pluck(:id, :name).flatten]

    # if the current user is a facilitator and not a program manager, workshop
    # organizer, or workshop admin, only show them responses about themselves,
    # not any other facilitator
    show_only_user = should_only_show_current_user?

    # Each session has a general response section.
    # Some also have a facilitator response section
    questions.each do |session, response_sections|
      surveys_for_session = surveys[session]

      next unless surveys_for_session

      session_summary = {
        response_count: surveys[session][:response_count]
      }

      response_sections.each do |response_section, section_questions|
        session_summary[response_section] = {}
        section_questions.each do |q_key, question|
          if question[:answer_type] == 'text'
            if response_section == :facilitator
              # For facilitator specific free responses, we want a hash of facilitator IDs
              # to an array of all of their specific responses
              facilitator_responses = Hash.new
              surveys_for_session[:facilitator]&.each do |survey|
                next unless survey[q_key].presence
                facilitator_responses[survey['facilitatorId'].to_i] = (facilitator_responses[survey['facilitatorId'].to_i] || []).append survey[q_key]
              end

              if show_only_user
                facilitator_responses.slice! current_user.id
              end
              session_summary[:facilitator][q_key] = facilitator_responses.transform_keys {|k| facilitator_map[k]}
            else
              # Otherwise, we just want a list of all responses
              sum = surveys_for_session[response_section].map {|survey| survey[q_key]}.reduce([], :append).compact
              session_summary[response_section][q_key] = sum
            end
          else
            # For multiple-choice responses, return a frequency map with nulls removed
            # [1, 1, 2, 2, 3, 5, 7, 7, 7, 7, 7, nil, nil] => {1: 2, 2: 2, 3: 1, 5: 1, 7: 5}
            #
            # For facilitator-specific responses, return a map per facilitator:
            # { "Facilitator Name 1": {1: 2, 2: 2, ...}, "Facilitator Name 2": ... }
            if response_section == :facilitator
              facilitator_responses = Hash.new
              surveys_for_session[:facilitator]&.each do |survey|
                next unless survey[q_key].presence
                facilitator_responses[survey['facilitatorId'].to_i] = (facilitator_responses[survey['facilitatorId'].to_i] || []).append survey[q_key]
              end

              if show_only_user
                facilitator_responses.slice! current_user.id
              end

              facilitator_responses.each do |facilitator, responses|
                facilitator_responses[facilitator] = responses.group_by {|v| v}.transform_values(&:size).reject {|k, _| k.nil?}
              end

              session_summary[:facilitator][q_key] = facilitator_responses.transform_keys {|k| facilitator_map[k]}
            else
              summary = surveys_for_session[response_section].map {|survey| survey[q_key]}.group_by {|v| v}.transform_values(&:size)
              session_summary[response_section][q_key] = summary.reject {|k, _| k.nil?}
            end
          end
        end
      end

      workshop_summary[session] = session_summary
    end

    workshop_summary
  end

  def get_surveys_for_workshops(workshops)
    workshop_subjects = workshops.map(&:subject).uniq

    responses = workshops.any?(&:summer?) ? {
      'Pre Workshop' => {
        general: Pd::WorkshopDailySurvey.with_answers.where(pd_workshop: workshops, day: 0).map(&:form_data_hash)
      }
    } : {}

    max_sessions_for_workshop = workshops.map(&:sessions).map(&:size).max

    max_sessions_for_workshop.times do |index|
      day = index + 1
      responses["Day #{day}"] = {
        general: Pd::WorkshopDailySurvey.with_answers.where(
          pd_workshop: workshops,
          form_id: Pd::WorkshopDailySurvey.get_form_id_for_subjects_and_day(workshop_subjects, day)
        ).map(&:form_data_hash),
        facilitator: Pd::WorkshopFacilitatorDailySurvey.with_answers.where(
          pd_workshop: workshops,
          form_id: Pd::WorkshopFacilitatorDailySurvey.form_ids_for_subjects(workshop_subjects),
          day: day
        ).map {|x| x.form_data_hash(show_hidden_questions: true)}
      }
    end

    unless workshops.all?(&:summer?)
      responses["Post Workshop"] = {
        general: Pd::WorkshopDailySurvey.with_answers.where(
          pd_workshop: workshops,
          form_id: Pd::WorkshopDailySurvey.get_form_id_for_subjects_and_day(workshops.reject(&:summer?).map(&:subject), POST_WORKSHOP_FORM_KEY)
        ).map(&:form_data_hash)
      }
    end

    responses.each do |k, v|
      responses[k][:response_count] = v[:general].size
    end

    responses
  end

  def get_questions_for_forms(workshop)
    questions = workshop.summer? ? {
      'Pre Workshop' => {
        general: get_summary_for_form(
          Pd::WorkshopDailySurvey.get_form_id_for_subject_and_day(workshop.subject, 0),
          workshop
        )
      }
    } : {}

    workshop.sessions.each_with_index do |_, index|
      day = index + 1
      questions["Day #{day}"] = {
        general: get_summary_for_form(
          Pd::WorkshopDailySurvey.get_form_id_for_subject_and_day(workshop.subject, day),
          workshop
        ),
        facilitator: get_summary_for_form(
          Pd::WorkshopFacilitatorDailySurvey.form_id(workshop.subject),
          workshop
        )
      }
    end

    unless workshop.summer?
      questions["Post Workshop"] = {
        general: get_summary_for_form(
          Pd::WorkshopDailySurvey.get_form_id_for_subject_and_day(workshop.subject, POST_WORKSHOP_FORM_KEY), workshop
        )
      }
    end

    questions
  end

  def generate_facilitator_averages(summary)
    facilitators = summary[:facilitators].values

    flattened_this_workshop_histograms = summary[:this_workshop].values.flat_map(&:values).select {|x| x.is_a? Hash}.reduce(&:merge)
    flattened_all_my_workshop_histograms = summary[:all_my_workshops].values.flat_map(&:values).select {|x| x.is_a? Hash}.reduce(&:merge)

    flattened_questions = summary[:questions].values.flat_map(&:values).reduce(:merge)
    flattened_questions.transform_values do |question|
      question[:option_map] = question[:options].each_with_index.map {|x, i| [x, i + 1]}.to_h if question[:options]
    end

    facilitator_averages = facilitators.map {|name| [name, {}]}.to_h
    facilitator_averages[:questions] = {}

    QUESTIONS_FOR_FACILITATOR_AVERAGES_LIST.each do |question_group|
      facilitators.each do |facilitator|
        histogram_for_this_workshop = (question_group[:all_ids] || [question_group[:primary_id]]).map {|x| flattened_this_workshop_histograms[x]}.compact.first
        histogram_for_this_workshop = histogram_for_this_workshop.try(:[], facilitator) || histogram_for_this_workshop
        histogram_for_all_my_workshops = (question_group[:all_ids] || [question_group[:primary_id]]).map {|x| flattened_all_my_workshop_histograms[x]}.compact.first
        histogram_for_all_my_workshops = histogram_for_all_my_workshops.try(:[], facilitator) || histogram_for_all_my_workshops

        question = flattened_questions[question_group[:primary_id]] || question_group[:all_ids].map {|x| flattened_questions[x]}.compact.first

        next if histogram_for_this_workshop.nil?

        total_responses_for_this_workshop = histogram_for_this_workshop.values.reduce(:+) || 0

        puts question

        total_answer_for_this_workshop_sum = histogram_for_this_workshop.map {|k, v| question[:option_map][k] * v}.reduce(:+) || 0
        facilitator_averages[facilitator][question_group[:primary_id]] = {this_workshop: (total_answer_for_this_workshop_sum / total_responses_for_this_workshop.to_f).round(2)}

        total_responses_for_all_workshops = histogram_for_all_my_workshops.values.reduce(:+) || 0
        total_answer_for_all_workshops_sum = histogram_for_all_my_workshops.map {|k, v| question[:option_map][k] * v}.reduce(:+) || 0
        facilitator_averages[facilitator][question_group[:primary_id]][:all_my_workshops] = (total_answer_for_all_workshops_sum / total_responses_for_all_workshops.to_f).round(2)
      end

      facilitator_averages[:questions][question_group[:primary_id]] = question_group[:all_ids] ? question_group[:all_ids].map {|x| flattened_questions[x]}.compact.first[:text] : flattened_questions[question_group[:primary_id]][:text]
    end

    facilitators.each do |facilitator|
      QUESTIONS_FOR_FACILITATOR_AVERAGES.each do |category, questions|
        facilitator_averages[facilitator][category.to_s.downcase.to_sym] = {}
        [:this_workshop, :all_my_workshops].each do |column|
          average = facilitator_averages[facilitator].slice(*(questions.map {|question| question[:primary_id]})).values.map {|x| x[column]}.reduce(:+) / questions.size.to_f
          facilitator_averages[facilitator][category.to_s.downcase.to_sym][column] = average.round(2)
        end
      end
    end

    summary[:facilitator_averages] = facilitator_averages
  end

  def generate_facilitator_response_counts(summary, workshop, related_workshops)
    facilitator_response_counts = {
      this_workshop: Pd::WorkshopFacilitatorDailySurvey.where(pd_workshop_id: workshop.id).group(:facilitator_id).size,
      all_my_workshops: Pd::WorkshopFacilitatorDailySurvey.where(pd_workshop_id: related_workshops.map(&:id)).group(:facilitator_id).size
    }

    if should_only_show_current_user?
      facilitator_response_counts.transform_values! {|v| v.slice current_user.id}
    end

    summary[:facilitator_response_counts] = facilitator_response_counts
  end

  private

  def get_summary_for_form(form_id, workshop)
    survey = Pd::SurveyQuestion.find_by(form_id: form_id)
    summary = survey&.summarize || {}

    summary.each do |_, question|
      if question[:text].match? '{.*}'
        question[:text] = question[:text].gsub '{workshopCourse}', workshop.course
      end
    end

    summary
  end

  def should_only_show_current_user?
    current_user &&
      current_user.facilitator? &&
      !(current_user.program_manager? ||
        current_user.workshop_organizer? ||
        current_user.workshop_admin?)
  end
end

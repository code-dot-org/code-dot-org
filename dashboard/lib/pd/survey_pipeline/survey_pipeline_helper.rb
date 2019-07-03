require 'pd/survey_pipeline/daily_survey_retriever.rb'
require 'pd/survey_pipeline/daily_survey_parser.rb'
require 'pd/survey_pipeline/daily_survey_joiner.rb'
require 'pd/survey_pipeline/mapper.rb'
require 'pd/survey_pipeline/daily_survey_decorator.rb'

module Pd::SurveyPipeline::Helper
  # TODO: keep question category name in Decorator? or use dependency injection!
  FACILITATOR_EFFECTIVENESS_CATEGORY = 'facilitator_effectiveness'
  WORKSHOP_OVERALL_SUCCESS_CATEGORY = 'overall_success'
  WORKSHOP_TEACHER_ENGAGEMENT_CATEGORY = 'teacher_engagement'

  # Roll up all facilitator-specific results for 1 facilitator across workshops of 1 course
  # Organize results in UI-specific format.
  # @param
  #   fac_id: number
  #   workshop: Pd::Workshop
  # @return:
  #   Hash{decorated_summaries => Hash{facilitators, facilitator_response_counts, facilitator_averages, errors}}
  #   Sub-hash is empty-able
  #     facilitators => {fac_id => fac_name}
  #     facilitator_response_counts => {this_workshop => {fac_id => count}, all_my_workshops => {fac_id => count}}
  #     facilitator_averages => {
  #       fac_name => {qcategory, qname => {this_workshop, all_my_workshops => score}},
  #       questions => {qname => qtext}
  #     }
  #     errors => {?}
  # @pre:
  #   fac_id: a valid User id
  #   workshop: valid workshop
  def rollup_facilitator(fac_id, workshop, logger)
    context = {
      current_workshop: workshop,
      facilitator_ids: [fac_id]
    }
    related_ws_ids = find_related_workshops([fac_id], workshop.course, logger)

    # Retriever
    context.merge! retrieve_facilicator_surveys([fac_id], related_ws_ids, logger)
    logger&.info "context[survey_questions].count = #{context[:survey_questions].count}"
    logger&.info "context[facilitator_submissions].count = #{context[:facilitator_submissions].count}"
    logger&.debug "context[survey_questions] = #{context[:survey_questions].inspect}"
    logger&.debug "context[facilitator_submissions] = #{context[:facilitator_submissions].inspect}"

    # Parser
    Pd::SurveyPipeline::DailySurveyParser.process_data context
    logger&.info "context[parsed_questions].count = #{print_kv_count(context[:parsed_questions])}"
    logger&.info "context[parsed_submissions].count = #{print_kv_count(context[:parsed_submissions])}"
    logger&.debug "context[parsed_questions] = #{context[:parsed_questions]}"
    logger&.debug "context[parsed_submissions] = #{context[:parsed_submissions]}"

    # Joiner
    Pd::SurveyPipeline::DailySurveyJoiner.process_data context
    logger&.info "context[question_answer_joined].count = #{context[:question_answer_joined].count}"
    logger&.info "context[parsed_questions].count after transform = #{print_kv_count(context[:parsed_questions])}"
    logger&.info "context[parsed_submissions].count after transform = #{print_kv_count(context[:parsed_submissions])}"
    logger&.debug "context[parsed_questions] = #{context[:parsed_questions]}"
    logger&.debug "context[question_answer_joined] = #{context[:question_answer_joined]}"

    # Convert string answer to number. Not quite functional because it modifies input
    # TODO: move to separate Modifier? Send modifies to other components as params, e.g. Modifier_for_MapReducer
    context[:question_answer_joined].each do |qa|
      if qa.dig(:option_map, qa[:answer])
        qa[:answer_to_number] = qa[:option_map][qa[:answer]]
      end
    end

    # Mapper + Reducer
    # Summarize results for all workshops
    group_config_all_ws = [:facilitator_id, :name, :type, :answer_type]
    is_selected_question_all_ws =
      lambda {|hash| hash[:name]&.start_with?(FACILITATOR_EFFECTIVENESS_CATEGORY)}
    map_config_all_ws = [
      {
        condition: is_selected_question_all_ws,
        field: :answer_to_number,
        reducers: [Pd::SurveyPipeline::AvgReducer]
      }
    ]
    mapper_all_ws = Pd::SurveyPipeline::GenericMapper.new(
      group_config: group_config_all_ws, map_config: map_config_all_ws
    )
    mapper_all_ws.process_data context

    # Summarize results for the current workshopz
    # TODO: keep question category name in Decorator?
    group_config_this_ws = [:facilitator_id, :workshop_id, :name, :type, :answer_type]
    is_selected_question_this_ws = lambda do |hash|
      hash[:workshop_id] == workshop.id &&
      hash[:name]&.start_with?(FACILITATOR_EFFECTIVENESS_CATEGORY)
    end
    map_config_this_ws = [
      {
        condition: is_selected_question_this_ws,
        field: :answer_to_number,
        reducers: [Pd::SurveyPipeline::AvgReducer]
      }
    ]
    mapper_this_ws = Pd::SurveyPipeline::GenericMapper.new(
      group_config: group_config_this_ws, map_config: map_config_this_ws
    )
    mapper_this_ws.process_data context

    logger&.info "context[:summaries].count = #{context[:summaries].count}"
    logger&.debug "context[:summaries] = #{context[:summaries].inspect}"
    logger&.info "context[:errors].count = #{context[:errors].count}"
    logger&.debug "context[:errors] = #{context[:errors].inspect}"

    # Decorate
    Pd::SurveyPipeline::FacilitatorRollupResultDecorator.process_data context

    logger&.info "context[:decorated_summaries].count = #{print_kv_count(context[:decorated_summaries])}"
    logger&.debug "context[:decorated_summaries] = #{context[:decorated_summaries].inspect}"
    logger&.debug "context = #{context}"

    context[:decorated_summaries]
  end

  # Roll up workshop-general results across workshops of 1 course facilitated by 1 facilitator
  # @param
  #   fac_id: number
  #   workshop: Pd::Workshop
  # @return
  #   Hash{decorated_summaries => Hash{facilitators, facilitator_response_counts, facilitator_averages, errors}}
  #   Sub-hash is empty-able
  #     facilitators => {fac_id => fac_name}
  #     workshop_response_counts => {this_workshop => {fac_id => count}, all_my_workshops => {fac_id => count}}
  #     workshop_averages/facilitator_averages => {
  #       fac_name => {qcategory, qname => {this_workshop, all_my_workshops => score}},
  #       questions => {qname => qtext}
  #     }
  #     errors => {?}
  #     TODO: there should be different reponse counts for facilitator-specific and workshop-general submissions.
  # @pre
  #   fac_id: a valid User id
  #   workshop: valid workshop
  def rollup_workshop(fac_id, workshop, logger)
    context = {
      current_workshop: workshop,
      facilitator_id: fac_id
    }
    related_ws_ids = find_related_workshops([fac_id], workshop.course, logger)
    context[:related_workshop_ids] = related_ws_ids

    # Retriever
    context.merge! retrieve_workshop_surveys(related_ws_ids, logger)
    logger&.info "context[survey_questions].count = #{context[:survey_questions].count}"
    logger&.info "context[workshop_submissions].count = #{context[:workshop_submissions].count}"
    logger&.debug "context[survey_questions] = #{context[:survey_questions].inspect}"
    logger&.debug "context[workshop_submissions] = #{context[:workshop_submissions].inspect}"

    # Parser
    Pd::SurveyPipeline::DailySurveyParser.process_data context
    logger&.info "context[parsed_questions].count = #{print_kv_count(context[:parsed_questions])}"
    logger&.info "context[parsed_submissions].count = #{print_kv_count(context[:parsed_submissions])}"
    logger&.debug "context[parsed_questions] = #{context[:parsed_questions]}"
    logger&.debug "context[parsed_submissions] = #{context[:parsed_submissions]}"

    # Joiner
    Pd::SurveyPipeline::DailySurveyJoiner.process_data context
    logger&.info "context[question_answer_joined].count = #{context[:question_answer_joined].count}"
    logger&.info "context[parsed_questions].count after transform = #{print_kv_count(context[:parsed_questions])}"
    logger&.info "context[parsed_submissions].count after transform = #{print_kv_count(context[:parsed_submissions])}"
    logger&.debug "context[parsed_questions] = #{context[:parsed_questions]}"
    logger&.debug "context[question_answer_joined] = #{context[:question_answer_joined]}"

    # Convert string answer to number. Not quite functional because it modifies input
    # TODO: move to separate Modifier? Send modifies to other components as params, e.g. Modifier_for_MapReducer
    context[:question_answer_joined].each do |qa|
      if qa.dig(:option_map, qa[:answer])
        qa[:answer_to_number] = qa[:option_map][qa[:answer]]
      end
    end

    # Mapper + Reducer
    # Summarize results for all workshops
    group_config_all_ws = [:name, :type, :answer_type]
    is_selected_question_all_ws = lambda do |hash|
      hash[:name]&.start_with?(WORKSHOP_OVERALL_SUCCESS_CATEGORY) ||
      hash[:name]&.start_with?(WORKSHOP_TEACHER_ENGAGEMENT_CATEGORY)
    end
    map_config_all_ws = [
      {
        condition: is_selected_question_all_ws,
        field: :answer_to_number,
        reducers: [Pd::SurveyPipeline::AvgReducer]
      }
    ]
    mapper_all_ws = Pd::SurveyPipeline::GenericMapper.new(
      group_config: group_config_all_ws, map_config: map_config_all_ws
    )
    mapper_all_ws.process_data context

    # Summarize results for the current workshopz
    group_config_this_ws = [:workshop_id, :name, :type, :answer_type]
    is_selected_question_this_ws = lambda do |hash|
      hash[:workshop_id] == workshop.id && (
        hash[:name]&.start_with?(WORKSHOP_OVERALL_SUCCESS_CATEGORY) ||
        hash[:name]&.start_with?(WORKSHOP_TEACHER_ENGAGEMENT_CATEGORY)
      )
    end
    map_config_this_ws = [
      {
        condition: is_selected_question_this_ws,
        field: :answer_to_number,
        reducers: [Pd::SurveyPipeline::AvgReducer]
      }
    ]
    mapper_this_ws = Pd::SurveyPipeline::GenericMapper.new(
      group_config: group_config_this_ws, map_config: map_config_this_ws
    )
    mapper_this_ws.process_data context

    logger&.info "context[:summaries].count = #{context[:summaries].count}"
    logger&.debug "context[:summaries] = #{context[:summaries].inspect}"
    logger&.info "context[:errors].count = #{context[:errors].count}"
    logger&.debug "context[:errors] = #{context[:errors].inspect}"

    # Decorate
    Pd::SurveyPipeline::WorkshopRollupResultDecorator.process_data context

    logger&.info "context[:decorated_summaries].count = #{print_kv_count(context[:decorated_summaries])}"
    logger&.debug "context[:decorated_summaries] = #{context[:decorated_summaries].inspect}"
    logger&.debug "context = #{context}"

    context[:decorated_summaries]
  end

  # Roll up facilitator-specifc & workshop-general results for facilitators in this workshop
  # @pre
  #   workshop: Pd::Workshop, valid!
  #   current_user: User, valid!
  # @post: Hash, empty-able
  def summarize_rollup(workshop, current_user, logger = nil)
    # Get list of facilitators based on current user permissions
    # PM can see all. Facilitator can only see himself.
    # (ws_id, u_id) -> (fac_ids)
    # pre: valid Pd::Workshop + User
    # post: Array[Number], empty-able
    fac_ids =
      if current_user.program_manager? || current_user.workshop_organizer? || current_user.workshop_admin?
        workshop.facilitators.pluck(:id)
      else
        [current_user.id]
      end
    logger&.info "selected fac_ids = #{fac_ids}"

    # Summarize for each facilitator
    results = {}
    fac_ids.each do |fac_id|
      # Facilitator-specific results
      results.deep_merge! rollup_facilitator(fac_id, workshop, logger)

      # Workshop-general results
      results.deep_merge! rollup_workshop(fac_id, workshop, logger)

      # break   # TODO: remove
    end

    logger&.debug("FINAL RESULT = #{results}")
    results
  end

  # Find all workshops (ids) of the same course and facilitated by facilitators
  # @return Array[number], empty-able
  # @pre: strict, could be loosen up later
  #   fac_ids: array of ids, non-empty
  #   course name: string, non-empty
  def find_related_workshops(fac_ids, course, logger = nil)
    # TODO: Generalize to check list of required input values (exist + present)?
    # Raise if missing input? violate pre-condition
    return {} unless fac_ids.present?

    logger&.debug "fac_ids = #{fac_ids}, course = #{course}"

    # Get list of related workshops to those facilitators.
    # Related = same course, facilitated by same facilitators
    # Result ws_ids = array of workshop ids, could empty
    # Another option: workshop.rb#facilitated_by
    ws_facilitated_query =
      "SELECT DISTINCT pd_workshop_id FROM pd_workshops_facilitators "\
      "WHERE user_id IN (#{fac_ids.join(',')})"

    ws_facilitated = ActiveRecord::Base.connection.exec_query(ws_facilitated_query).rows.flatten
    ws_ids = Pd::Workshop.where(id: ws_facilitated, course: course).pluck(:id)

    logger&.debug "ws_facilitated = #{ws_facilitated}"
    logger&.debug "ws_ids = #{ws_ids}"

    ws_ids
  end

  # Get list of workshop daily submissions and questions for a list of workshops
  # @param
  #   ws_ids: Array[number]
  # @return
  #   survey_questions, workshop_submissions: Array[number], empty-able
  # @pre: strict
  #   ws_ids: non-empty array
  def retrieve_workshop_surveys(ws_ids, logger = nil)
    ws_submissions = Pd::WorkshopDailySurvey.where(pd_workshop_id: ws_ids)
    form_ids = ws_submissions.pluck(:form_id).uniq
    questions = Pd::SurveyQuestion.where(form_id: form_ids)
    logger&.debug "form_ids = #{form_ids.inspect}"

    {
      survey_questions: questions,
      workshop_submissions: ws_submissions
    }
  end

  # Get list of facilitator daily submissions and questions for a list of facilitators in specific workshops
  # @param
  #   fac_ids, ws_ids: Array[number]
  # @return
  #   survey_questions, facilitator_submissions: Array[number], empty-able
  # @pre: strict
  #   fac_ids, ws_ids: non-empty arrays
  def retrieve_facilicator_surveys(fac_ids, ws_ids, logger = nil)
    fac_submissions = Pd::WorkshopFacilitatorDailySurvey.where(facilitator_id: fac_ids, pd_workshop_id: ws_ids)
    form_ids = fac_submissions.pluck(:form_id).uniq
    questions = Pd::SurveyQuestion.where(form_id: form_ids)

    logger&.debug "form_ids = #{form_ids.inspect}"

    {
      survey_questions: questions,
      facilitator_submissions: fac_submissions
    }
  end

  def summarize_this_workshop(workshop, current_user)
    # Fields used to group survey answers
    group_config = [:workshop_id, :form_id, :facilitator_id, :name, :type, :answer_type]

    is_single_select_answer = lambda {|hash| hash[:answer_type] == 'singleSelect'}
    is_free_format_question = lambda {|hash| ['textbox', 'textarea'].include?(hash[:type])}
    is_number_question = lambda {|hash| hash[:type] == 'number'}

    # Rules to map groups of survey answers to reducers
    map_config = [
      {
        condition: is_single_select_answer,
        field: :answer,
        reducers: [Pd::SurveyPipeline::HistogramReducer]
      },
      {
        condition: is_free_format_question,
        field: :answer,
        reducers: [Pd::SurveyPipeline::NoOpReducer]
      },
      {
        condition: is_number_question,
        field: :answer,
        reducers: [Pd::SurveyPipeline::AvgReducer]
      },
    ]

    # Centralized context object shared by all workers in the pipeline.
    # Workers read from and write to this object.
    context = {
      current_user: current_user,
      filters: {workshop_ids: workshop.id}
    }

    # Assembly line to summarize CSF surveys
    workers = [
      Pd::SurveyPipeline::DailySurveyRetriever,
      Pd::SurveyPipeline::DailySurveyParser,
      Pd::SurveyPipeline::DailySurveyJoiner,
      Pd::SurveyPipeline::GenericMapper.new(
        group_config: group_config, map_config: map_config
      ),
      Pd::SurveyPipeline::SingleWorkshopResultDecorator
    ]

    create_generic_survey_report context, workers

    context[:decorated_summaries]
  end

  # Create survey report by having a group of workers process data in the same context.
  def create_generic_survey_report(context, workers)
    workers&.each do |w|
      w.process_data context
    end
  end
end

__END__

def summarize_facilitator_rollup(workshop, current_user, logger = nil)
  # Get list of facilitators based on current user permissions
  # PM can see all. Facilitator can only see himself.
  # (ws_id, u_id) -> (fac_ids)
  # pre: valid workshop + user
  # post: Array[Number], empty-able
  # TODO: shortcut the pipeline if output is empty array or carry on?
  fac_ids =
    if current_user.program_manager? || current_user.workshop_organizer? || current_user.workshop_admin?
      workshop.facilitators.pluck(:id)
    else
      [current_user.id]
    end

  context = {
    current_user: current_user,
    current_workshop: workshop,
    facilitator_ids: fac_ids
  }
  logger&.info "context[facilitator_ids] = #{context[:facilitator_ids]}"

  # Find workshops
  ws_ids = find_related_workshops(fac_ids, workshop.course, logger)

  # Retriever
  context.merge! retrieve_facilicator_surveys(fac_ids, ws_ids, logger)
  logger&.info "context[survey_questions].count = #{context[:survey_questions].count}"
  logger&.info "context[facilitator_submissions].count = #{context[:facilitator_submissions].count}"
  logger&.debug "context[survey_questions] = #{context[:survey_questions].inspect}"
  logger&.debug "context[facilitator_submissions] = #{context[:facilitator_submissions].inspect}"

  # Parser
  Pd::SurveyPipeline::DailySurveyParser.process_data context
  logger&.info "context[parsed_questions].count = #{print_kv_count(context[:parsed_questions])}"
  logger&.info "context[parsed_submissions].count = #{print_kv_count(context[:parsed_submissions])}"
  logger&.debug "context[parsed_questions] = #{context[:parsed_questions]}"
  logger&.debug "context[parsed_submissions] = #{context[:parsed_submissions]}"

  # Joiner
  Pd::SurveyPipeline::DailySurveyJoiner.process_data context
  logger&.info "context[question_answer_joined].count = #{context[:question_answer_joined].count}"
  logger&.info "context[parsed_questions].count after transform = #{print_kv_count(context[:parsed_questions])}"
  logger&.info "context[parsed_submissions].count after transform = #{print_kv_count(context[:parsed_submissions])}"
  logger&.debug "context[parsed_questions] = #{context[:parsed_questions]}"
  logger&.debug "context[question_answer_joined] = #{context[:question_answer_joined]}"

  # Convert string answer to number
  # TODO: move to separate Modifier? Send modifies to other components as params, e.g. Modifier_for_MapReducer
  # @post: if a record/row hash option_map & answer fields, creates answer_to_number field
  context[:question_answer_joined].each do |qa|
    if qa.dig(:option_map, qa[:answer])
      qa[:answer_to_number] = qa[:option_map][qa[:answer]]
    end
  end

  # Mapper + Reducer
  # Summarize results for all workshops
  # TODO: keep question category name in Decorator?
  group_config_all_ws = [:facilitator_id, :name, :type, :answer_type]
  is_selected_question_all_ws = lambda {|hash|
    hash[:name]&.start_with?(FACILITATOR_EFFECTIVENESS_CATEGORY)
  }
  map_config_all_ws = [
    {
      condition: is_selected_question_all_ws,
      field: :answer_to_number,
      reducers: [Pd::SurveyPipeline::AvgReducer]
    }
  ]
  mapper_all_ws = Pd::SurveyPipeline::GenericMapper.new(
    group_config: group_config_all_ws, map_config: map_config_all_ws
  )
  mapper_all_ws.process_data context

  # Summarize results for the current workshopz
  # TODO: keep question category name in Decorator?
  group_config_this_ws = [:workshop_id, :facilitator_id, :name, :type, :answer_type]
  is_selected_question_this_ws = lambda {|hash|
    hash[:workshop_id] == workshop.id &&
    hash[:name]&.start_with?(FACILITATOR_EFFECTIVENESS_CATEGORY)
  }
  map_config_this_ws = [
    {
      condition: is_selected_question_this_ws,
      field: :answer_to_number,
      reducers: [Pd::SurveyPipeline::AvgReducer]
    }
  ]
  mapper_this_ws = Pd::SurveyPipeline::GenericMapper.new(
    group_config: group_config_this_ws, map_config: map_config_this_ws
  )
  mapper_this_ws.process_data context

  logger&.info "context[:summaries].count = #{context[:summaries].count}"
  logger&.debug "context[:summaries] = #{context[:summaries].inspect}"
  logger&.info "context[:errors].count = #{context[:errors].count}"
  logger&.debug "context[:errors] = #{context[:errors].inspect}"

  # Decorate
  Pd::SurveyPipeline::FacilitatorRollupResultDecorator.process_data context

  logger&.info "context[:decorated_summaries].count = #{print_kv_count(context[:decorated_summaries])}"
  logger&.debug "context[:decorated_summaries] = #{context[:decorated_summaries].inspect}"
  logger&.debug "context = #{context}"

  context[:decorated_summaries]
end

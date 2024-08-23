class Ability
  include CanCan::Ability

  GENAI_PILOT = 'gen-ai-lab-v1'

  # Define abilities for the passed in user here. For more information, see the
  # wiki at https://github.com/ryanb/cancan/wiki/Defining-Abilities.
  def initialize(user)
    user ||= User.new

    # Abilities for all users, signed in or not signed in.
    can :read, :all
    cannot :read, [
      TeacherFeedback,
      CourseOffering,
      DataDoc,
      UnitGroup, # see override below
      Unit, # see override below
      Lesson, # see override below
      ScriptLevel, # see override below
      ProgrammingClass, # see override below
      ProgrammingEnvironment, # see override below
      ProgrammingExpression, # see override below
      ReferenceGuide, # see override below
      Rubric,
      :reports,
      User,
      UserPermission,
      Follower,
      PeerReview,
      Section,
      # PLC Stuff
      Plc::Course,
      Plc::LearningModule,
      Plc::UserCourseEnrollment,
      Plc::CourseUnit,
      :javabuilder_session,
      CodeReview,
      LearningGoalTeacherEvaluation
    ]
    cannot :index, Level

    can [:show, :index], DataDoc

    # If you can see a level, you can also do these things:
    can [:embed_level, :get_rubric, :get_serialized_maze, :level_properties], Level do |level|
      can? :read, level
    end

    # If you can update a level, you can also do these things:
    can [:edit_blocks, :update_blocks, :update_properties], Level do |level|
      can? :update, level
    end

    can [:read, :docs_show, :docs_index, :get_summary_by_name], ProgrammingEnvironment do |environment|
      environment.published || user.permission?(UserPermission::LEVELBUILDER)
    end

    can [:read, :show_by_keys], ProgrammingClass do |programming_class|
      can? :read, programming_class.programming_environment
    end

    can [:read, :show_by_keys, :docs_show], ProgrammingExpression do |expression|
      can? :read, expression.programming_environment
    end
    cannot :index, ProgrammingExpression

    if user.persisted?
      can :manage, user

      can :create, Activity, user_id: user.id
      can :create, UserLevel, user_id: user.id
      can :update, UserLevel, user_id: user.id
      can :create, Follower, student_user_id: user.id
      can :destroy, Follower do |follower|
        follower.student_user_id == user.id && !user.student?
      end
      can :read, UserPermission, user_id: user.id
      can [:show, :pull_review, :update], PeerReview, reviewer_id: user.id
      can :view_project_commits, User do |project_owner|
        project_owner.id == user.id || can?(:code_review, project_owner)
      end

      can :create, CodeReview do |code_review, project|
        code_review.user_id == user.id &&
          project.owner_id == user.id
      end
      can :edit, CodeReview, user_id: user.id
      can :index_code_reviews, Project do |project|
        # The user can see the code review if one of the following is true:
        # 1) the user is the project owner
        # 2) the user is the teacher of the project owner
        # 3) the user and the project owner are in the same code reivew group
        project.owner&.id == user&.id || can?(:code_review, project.owner)
      end

      # A user can review the code of other_user if they are the other_user's teacher or if
      # they're in a shared section with code review turned on and they're in the same code review group
      can :code_review, User do |other_user|
        return true if other_user.student_of?(user)

        in_shared_section_with_code_review = user.shared_sections_with(other_user).any?(&:code_review_enabled?)
        in_shared_section_with_code_review && user.in_code_review_group_with?(other_user)
      end

      can :create, CodeReviewComment do |code_review_comment|
        code_review_comment.code_review.open? && can?(:code_review, code_review_comment.code_review.owner)
      end

      can :update, CodeReviewComment do |code_review_comment|
        code_review_comment.code_review.user_id == user.id
      end

      can :destroy, CodeReviewComment do |code_review_comment|
        # Teachers can delete comments on their student's projects,
        # their own comments anywhere, and comments on their projects.
        code_review_comment.code_review.owner&.student_of?(user) ||
          (user.teacher? && user.id == code_review_comment.commenter_id) ||
          (user.teacher? && user.id == code_review_comment.code_review.user_id)
      end

      can :index, Section, user_id: user.id
      can [:get_feedbacks, :count, :increment_visit_count, :index], TeacherFeedback, student_id: user.id
      can :create, UserMlModel, user_id: user.id

      can :list_projects, Section do |section|
        can?(:manage, section) || user.sections_as_student.include?(section)
      end

      # all signed in users can get their level source
      can :get_level_source, UserLevel

      if user.teacher?
        can :manage, Section do |s|
          s.instructors.include?(user)
        end
        can :destroy, SectionInstructor do |si|
          can?(:manage, si.section) && si.instructor_id != si.section.user_id
        end
        can [:accept, :decline], SectionInstructor, instructor_id: user.id
        can :manage, :teacher
        can :manage, User do |u|
          user.students.include?(u)
        end
        can [:create, :get_feedback_from_teacher], TeacherFeedback, student_sections: {user_id: user.id}
        can :manage, Follower
        can :manage, UserLevel do |user_level|
          !user.students.where(id: user_level.user_id).empty?
        end
        can :read, Plc::UserCourseEnrollment, user_id: user.id
        can :view_level_solutions, Unit do |script|
          !script.old_professional_learning_course?
        end
        can [:read, :find], :regional_partner_workshops
        can [:new, :create, :show, :update], TEACHER_APPLICATION_CLASS, user_id: user.id
        can :update_last_confirmation_date, UserSchoolInfo, user_id: user.id
        can [:score_lessons_for_section, :get_teacher_scores_for_script], TeacherScore, user_id: user.id
        can :manage, LearningGoalTeacherEvaluation, teacher_id: user.id
        can :manage, LearningGoalAiEvaluationFeedback, teacher_id: user.id
      end


      if user.permission?(UserPermission::PROJECT_VALIDATOR)
        can :manage, FeaturedProject
      end

      if user.permission?(UserPermission::PLC_REVIEWER)
        can :manage, PeerReview
        can :index, :peer_review_submissions
        can :dashboard, :peer_reviews
        can :report_csv, :peer_review_submissions
      end

      if user.has_ai_tutor_access?
        can :chat_completion, :openai_chat
        can :create, AiTutorInteraction, user_id: user.id
        can :index, AiTutorInteraction
      end

      if user.can_view_student_ai_chat_messages?
        can :index, AiTutorInteraction
      end

      if user.has_ai_tutor_access? && user.levelbuilder?
        can :check_message_safety, :aichat
      end
    end

    # Override UnitGroup, Unit, Lesson and ScriptLevel.
    can [:vocab, :resources, :code, :standards, :get_rollup_resources], UnitGroup do |unit_group|
      # Assumes if one unit in a unit group is migrated they all are
      unit_group.default_units[0].is_migrated && !unit_group.plc_course && can?(:read, unit_group)
    end

    can [:vocab, :resources, :code, :standards, :get_rollup_resources], Unit do |script|
      script.is_migrated && can?(:read, script)
    end

    can :read, UnitGroup do |unit_group|
      if unit_group.can_be_participant?(user) || unit_group.can_be_instructor?(user)
        if unit_group.in_development?
          user.permission?(UserPermission::LEVELBUILDER)
        elsif unit_group.pilot?
          unit_group.has_pilot_access?(user)
        else
          true
        end
      else
        false
      end
    end

    can :read, Unit do |script|
      if script.can_be_participant?(user) || script.can_be_instructor?(user)
        if script.in_development?
          user.permission?(UserPermission::LEVELBUILDER)
        elsif script.pilot?
          script.has_pilot_access?(user)
        else
          true
        end
      else
        false
      end
    end

    can :read, ScriptLevel do |script_level, params|
      script = script_level.script
      if can?(:read, script)
        # login is required if this script always requires it or if request
        # params were passed to authorize! and includes login_required=true
        login_required = script.login_required? || (!params.nil? && params[:login_required] == "true")
        user.persisted? || !login_required
      else
        false
      end
    end

    can [:read, :show_by_id, :student_lesson_plan], Lesson do |lesson|
      script = lesson.script
      can?(:read, script)
    end

    can :read, ReferenceGuide do |guide|
      course_or_unit = guide.course_version.content_root
      can?(:read, course_or_unit)
    end

    # Handle standalone projects as a special case.
    # They don't necessarily have a model, permissions and redirects are run
    # through ProjectsController and their view/edit requirements are defined
    # there.
    ProjectsController::STANDALONE_PROJECTS.each_pair do |project_type_key, project_type_props|
      if project_type_props[:levelbuilder_required]
        can :load_project, project_type_key if user.persisted? && user.permission?(UserPermission::LEVELBUILDER)
      elsif project_type_props[:login_required]
        can :load_project, project_type_key if user.persisted?
      else
        can :load_project, project_type_key
      end
    end

    # We allow loading extra links on non-levelbuilder environments (such as prod)
    if user.persisted? && (user.permission?(UserPermission::LEVELBUILDER) || user.permission?(UserPermission::PROJECT_VALIDATOR))
      can :extra_links, Level
    end

    if user.persisted? && (user.permission?(UserPermission::PROJECT_VALIDATOR))
      can :extra_links, ProjectsController
    end

    # In order to accommodate the possibility of there being no database, we
    # need to check that the user is persisted before checking the user
    # permissions.

    # When in levelbuilder_mode, we want to grant users with levelbuilder
    # permissions broad abilities to change curriculum and form objects.
    #
    # Note: We also grant these abilities in the 'test' environment to support
    # running UI tests that cover level editing without having levelbuilder_mode
    # set. An unfortunate side effect of this is that unit tests that cover the
    # levelbuilder permission will mimic levelbuilder_mode instead of production
    # by default.
    if user.persisted? &&
        user.permission?(UserPermission::LEVELBUILDER) &&
        (Rails.application.config.levelbuilder_mode || rack_env?(:test))
      can :manage, [
        Block,
        SharedBlocklyFunction,
        Library,
        Game,
        Level,
        Lesson,
        ProgrammingClass,
        ProgrammingEnvironment,
        ProgrammingExpression,
        ProgrammingMethod,
        ReferenceGuide,
        Rubric,
        DataDoc,
        CourseOffering,
        UnitGroup,
        Resource,
        Unit,
        ScriptLevel,
        Video,
        Vocabulary,
        :foorm_editor,
        Foorm::Form,
        Foorm::Library,
        Foorm::LibraryQuestion,
      ]

      # Only custom levels are editable.
      cannot [:clone, :update, :destroy], Level do |level|
        !level.custom?
      end

      # Ability for LevelStarterAssetsController. Since the controller does not have
      # a corresponding model, use lower/snake-case symbol instead of class name.
      can [:upload, :destroy], :level_starter_asset

      can [:edit_manifest, :update_manifest, :index, :show, :update, :destroy], :dataset

      can [:validate_form, :validate_library_question], :pd_foorm
    end

    if user.persisted?
      can :view_as_user, ScriptLevel do |script_level, user_to_assume, sublevel_to_view|
        user.project_validator? ||
          user_to_assume.student_of?(user) ||
          can?(:view_as_user_for_code_review, script_level, user_to_assume, sublevel_to_view)
      end

      # make sure levelbuilders do not have this permission outside of javalab
      cannot :view_as_user_for_code_review, ScriptLevel
      can :view_as_user_for_code_review, ScriptLevel do |script_level, user_to_assume, level_to_view|
        can_view_as_user_for_code_review = false

        level_to_view ||= script_level&.oldest_active_level

        # Only allow a student to view another student's project
        # only on levels where we have our peer review feature.
        # For now, that's only Javalab.
        if level_to_view.is_a?(Javalab)
          project_level_id = level_to_view.project_template_level.try(:id) ||
            level_to_view.id

          if user != user_to_assume &&
              !user_to_assume.student_of?(user) &&
              can?(:code_review, user_to_assume) &&
              CodeReview.open_reviews.find_by(
                user_id: user_to_assume.id,
                script_id: script_level.script_id,
                project_level_id: project_level_id
              )
            can_view_as_user_for_code_review = true
          end
        end

        can_view_as_user_for_code_review
      end

      # TODO: should add editor experiment for Unit Group
      editor_experiment = Experiment.get_editor_experiment(user)
      if editor_experiment
        can :index, Level
        can :clone, Level, &:custom?
        can :manage, Level, editor_experiment: editor_experiment
        can [:edit, :update], Unit, editor_experiment: editor_experiment
        can [:edit, :update], Lesson, editor_experiment: editor_experiment
      end

      # These checks control access to Javabuilder.
      # All teachers can generate a Javabuilder session token to run Java code,
      # although only verified teachers can generate tokens will be valid for "main" javabuilder.
      # Unverified teachers are given limited access to a separate "demo" javabuilder stack.
      # Students who are also assigned to a CSA section with a verified instructor can run Java code in "main" javabuilder.
      # The get_access_token endpoint is used for normal execution, and the access_token_with_override_sources
      # is used when viewing another version of a student's project (in preview or Code Review mode).
      # It is also used for running exemplars, but only teachers can access exemplars.
      # Levelbuilders can access and update Java Lab validation code (using the
      # access_token_with_override_validation endpoint).
      can [:get_access_token, :access_token_with_override_sources], :javabuilder_session do
        user.teacher? || user.sections_as_student.any? {|s| s.assigned_csa? && s.teacher&.verified_instructor?}
      end

      can :access_token_with_override_validation, :javabuilder_session do
        user.permission?(UserPermission::LEVELBUILDER)
      end

      can :use_unrestricted_javabuilder, :javabuilder_session do
        user.verified_instructor? || user.sections_as_student.any? {|s| s.assigned_csa? && s.teacher&.verified_instructor?}
      end

      if user.has_pilot_experiment?(GENAI_PILOT) ||
          (!user.teachers.empty? &&
          user.teachers.any? {|teacher| teacher.has_pilot_experiment?(GENAI_PILOT)})
        can :chat_completion, :aichat
        can :log_chat_event, :aichat
        can :start_chat_completion, :aichat
        can :chat_request, :aichat
      end
      # Only teachers can view student chat history.
      if user.has_pilot_experiment?(GENAI_PILOT)
        can :student_chat_history, :aichat
      end
    end

    if user.persisted? && user.permission?(UserPermission::PROJECT_VALIDATOR)
      # let them change the hidden state
      can :manage, LevelSource
      # let them change abuse scores
      can :destroy_abuse, :all
      can :update_file_abuse, :all
    end

    if user.admin?
      can :manage, :all

      cannot :manage, [
        Activity,
        Game,
        Level,
        UnitGroup,
        CourseOffering,
        Unit,
        Lesson,
        ReferenceGuide,
        ScriptLevel,
        UserLevel,
        UserScript,
        DataDoc,
        :pd_foorm,
        Foorm::Form,
        Foorm::Library,
        Foorm::LibraryQuestion
      ]
    end
  end
end

class Ability
  include CanCan::Ability
  include Pd::Application::ActiveApplicationModels

  # Define abilities for the passed in user here. For more information, see the
  # wiki at https://github.com/ryanb/cancan/wiki/Defining-Abilities.
  def initialize(user)
    user ||= User.new

    # Abilities for all users, signed in or not signed in.
    can :read, :all
    cannot :read, [
      TeacherFeedback,
      Script, # see override below
      Lesson, # see override below
      ScriptLevel, # see override below
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
      # PD models
      Pd::Workshop,
      Pd::Session,
      Pd::Enrollment,
      Pd::DistrictPaymentTerm,
      :pd_teacher_attendance_report,
      :pd_workshop_summary_report,
      Pd::CourseFacilitator,
      :workshop_organizer_survey_report,
      :pd_workshop_user_management,
      :pd_workshop_admins,
      :peer_review_submissions,
      RegionalPartner,
      :regional_partner_workshops,
      Pd::RegionalPartnerMapping,
      Pd::Application::ApplicationBase,
      Pd::Application::Facilitator1819Application,
      Pd::Application::Facilitator1920Application,
      Pd::Application::Teacher1819Application,
      Pd::Application::Teacher1920Application,
      Pd::Application::Teacher2021Application,
      Pd::Application::Teacher2122Application,
      Pd::InternationalOptIn,
      :maker_discount,
      :edit_manifest,
      :update_manifest,
      :foorm_editor,
      :pd_foorm,
      Foorm::Form,
      Foorm::Library,
      Foorm::LibraryQuestion,
      :javabuilder_session
    ]
    cannot :index, Level

    # If you can see a level, you can also do these things:
    can [:embed_level, :get_rubric], Level do |level|
      can? :read, level
    end

    # If you can update a level, you can also do these things:
    can [:edit_blocks, :update_blocks, :update_properties], Level do |level|
      can? :update, level
    end

    if user.persisted?
      can :manage, user

      can :create, Activity, user_id: user.id
      can :create, UserLevel, user_id: user.id
      can :update, UserLevel, user_id: user.id
      can :create, Follower, student_user_id: user.id
      can :destroy, Follower, student_user_id: user.id
      can :read, UserPermission, user_id: user.id
      can [:show, :pull_review, :update], PeerReview, reviewer_id: user.id
      can :create, Pd::RegionalPartnerProgramRegistration, user_id: user.id
      can :read, Pd::Session
      can :manage, Pd::Enrollment, user_id: user.id
      can :workshops_user_enrolled_in, Pd::Workshop
      can :index, Section, user_id: user.id
      can [:get_feedbacks, :count, :increment_visit_count, :index], TeacherFeedback, student_id: user.id
      can :create, UserMlModel, user_id: user.id

      can :list_projects, Section do |section|
        can?(:manage, section) || user.sections_as_student.include?(section)
      end

      if user.teacher?
        can :manage, Section, user_id: user.id
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
        can :view_level_solutions, Script do |script|
          !script.professional_learning_course?
        end
        can [:read, :find], :regional_partner_workshops
        can [:new, :create, :read], FACILITATOR_APPLICATION_CLASS, user_id: user.id
        can [:new, :create, :read], TEACHER_APPLICATION_CLASS, user_id: user.id
        can :create, Pd::InternationalOptIn, user_id: user.id
        can :manage, :maker_discount
        can :update_last_confirmation_date, UserSchoolInfo, user_id: user.id
        can [:score_lessons_for_section, :get_teacher_scores_for_script], TeacherScore, user_id: user.id
      end

      if user.facilitator?
        can [:read, :start, :end, :workshop_survey_report, :summary, :filter], Pd::Workshop, facilitators: {id: user.id}
        can [:read, :update], Pd::Workshop, organizer_id: user.id
        can :manage_attendance, Pd::Workshop, facilitators: {id: user.id}, ended_at: nil
        can :create, Pd::FacilitatorProgramRegistration, user_id: user.id
        can :read, Pd::CourseFacilitator, facilitator_id: user.id

        if Pd::CourseFacilitator.exists?(facilitator: user, course: Pd::Workshop::COURSE_CSF)
          can :create, Pd::Workshop, course: Pd::Workshop::COURSE_CSF
          can :update, Pd::Workshop, facilitators: {id: user.id}
          can :destroy, Pd::Workshop, organizer_id: user.id
        end
      end

      if user.workshop_organizer? || user.program_manager?
        can :create, Pd::Workshop
        can [:read, :start, :end, :update, :destroy, :summary, :filter], Pd::Workshop, organizer_id: user.id
        can :manage_attendance, Pd::Workshop, organizer_id: user.id, ended_at: nil

        # Regional partner program managers can access workshops assigned to their regional partner
        if user.regional_partners.any?
          can [:read, :start, :end, :update, :destroy, :summary, :filter], Pd::Workshop, regional_partner_id: user.regional_partners.pluck(:id)
          can :manage_attendance, Pd::Workshop, regional_partner_id: user.regional_partners.pluck(:id), ended_at: nil
          can :update_scholarship_info, Pd::Enrollment do |enrollment|
            !!user.regional_partners.pluck(enrollment.workshop.regional_partner_id)
          end
        end

        can :read, Pd::CourseFacilitator
        can :index, :workshop_organizer_survey_report
        can :read, :pd_workshop_summary_report
        can :read, :pd_teacher_attendance_report
        if user.regional_partners.any?
          # regional partners by default have read, quick_view, and update
          # permissions
          can [:read, :quick_view, :cohort_view, :update, :search, :destroy], Pd::Application::ApplicationBase, regional_partner_id: user.regional_partners.pluck(:id)

          # G3 regional partners should have full management permission
          group_3_partner_ids = user.regional_partners.where(group: 3).pluck(:id)
          unless group_3_partner_ids.empty?
            can :manage, Pd::Application::ApplicationBase, regional_partner_id: group_3_partner_ids
          end
          can [:send_principal_approval, :principal_approval_not_required], TEACHER_APPLICATION_CLASS, regional_partner_id: user.regional_partners.pluck(:id)
        end
      end

      if user.workshop_admin?
        can :manage, Pd::Workshop
        can :manage, Pd::CourseFacilitator
        can :manage, :workshop_organizer_survey_report
        can :manage, :pd_workshop_summary_report
        can :manage, :pd_teacher_attendance_report
        can :manage, :pd_workshop_user_management
        can :manage, :pd_workshop_admins
        can :manage, RegionalPartner
        can :report_csv, :peer_review_submissions
        can :manage, Pd::RegionalPartnerMapping
        can :manage, Pd::Application::ApplicationBase
        can :manage, FACILITATOR_APPLICATION_CLASS
        can :manage, TEACHER_APPLICATION_CLASS
        can :move, :workshop_enrollments
        can :update_scholarship_info, Pd::Enrollment
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
    end

    can [:vocab, :resources, :code, :standards], UnitGroup do
      true
    end

    # Override Script and ScriptLevel.
    can :read, Script do |script|
      if script.pilot?
        script.has_pilot_access?(user)
      else
        true
      end
    end

    can :read, ScriptLevel do |script_level, params|
      script = script_level.script
      if script.pilot?
        script.has_pilot_access?(user)
      else
        # login is required if this script always requires it or if request
        # params were passed to authorize! and includes login_required=true
        login_required = script.login_required? || (!params.nil? && params[:login_required] == "true")
        user.persisted? || !login_required
      end
    end

    can [:vocab, :resources, :code, :standards], Script do |script|
      !!script.is_migrated
    end

    can [:read, :student_lesson_plan], Lesson do |lesson|
      script = lesson.script
      if script.pilot?
        script.has_pilot_access?(user)
      else
        true
      end
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

    # In order to accommodate the possibility of there being no database, we
    # need to check that the user is persisted before checking the user
    # permissions.
    if user.persisted? && user.permission?(UserPermission::LEVELBUILDER)
      can :manage, [
        Block,
        SharedBlocklyFunction,
        Library,
        Game,
        Level,
        Lesson,
        UnitGroup,
        Script,
        ScriptLevel,
        Video,
        :foorm_editor,
        Foorm::Form,
        Foorm::Library,
        Foorm::LibraryQuestion,
        :javabuilder_session
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
      editor_experiment = Experiment.get_editor_experiment(user)
      if editor_experiment
        can :index, Level
        can :clone, Level, &:custom?
        can :manage, Level, editor_experiment: editor_experiment
        can [:edit, :update], Script, editor_experiment: editor_experiment
        can [:edit, :update], Lesson, editor_experiment: editor_experiment
      end
    end

    if user.persisted?
      if Experiment.enabled?(user: user, experiment_name: 'csa-pilot')
        can :get_access_token, :javabuilder_session
      end
    end

    if user.persisted? && user.permission?(UserPermission::PROJECT_VALIDATOR)
      # let them change the hidden state
      can :manage, LevelSource
    end

    if user.permission?(UserPermission::CENSUS_REVIEWER)
      can :manage, Census::CensusInaccuracyInvestigation
    end

    if user.admin?
      can :manage, :all

      cannot :manage, [
        Activity,
        Game,
        Level,
        UnitGroup,
        Script,
        Lesson,
        ScriptLevel,
        UserLevel,
        UserScript,
        :pd_foorm,
        Foorm::Form,
        Foorm::Library,
        Foorm::LibraryQuestion
      ]
    end
  end
end

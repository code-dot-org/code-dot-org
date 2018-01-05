class Ability
  include CanCan::Ability

  # Define abilities for the passed in user here. For more information, see the
  # wiki at https://github.com/ryanb/cancan/wiki/Defining-Abilities.
  def initialize(user)
    user ||= User.new

    # Abilities for all users, signed in or not signed in.
    can :read, :all
    cannot :read, [
      Script, # see override below
      ScriptLevel, # see override below
      :reports,
      User,
      UserPermission,
      Follower,
      PeerReview,
      Section,
      # Ops models
      District,
      Workshop,
      Cohort,
      WorkshopAttendance,
      # PLC Stuff
      Plc::Course,
      Plc::LearningModule,
      Plc::Task,
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
      Pd::TeacherApplication,
      :workshop_organizer_survey_report,
      Pd::WorkshopMaterialOrder,
      :pd_workshop_user_management,
      :pd_workshop_admins,
      :peer_review_submissions,
      RegionalPartner,
      :regional_partner_workshops,
      Pd::RegionalPartnerMapping,
      Pd::Application::ApplicationBase,
      Pd::Application::Facilitator1819Application,
      Pd::Application::Teacher1819Application,
      :maker_discount
    ]

    if user.persisted?
      can :manage, user

      can :create, Activity, user_id: user.id
      can :save_to_gallery, UserLevel, user_id: user.id
      can :create, GalleryActivity, user_id: user.id
      can :destroy, GalleryActivity, user_id: user.id
      can :create, UserLevel, user_id: user.id
      can :update, UserLevel, user_id: user.id
      can :create, Follower, student_user_id: user.id
      can :destroy, Follower, student_user_id: user.id
      can :read, UserPermission, user_id: user.id
      can [:show, :pull_review, :update], PeerReview, reviewer_id: user.id
      can :create, Pd::TeacherApplication, user_id: user.id
      can :create, Pd::RegionalPartnerProgramRegistration, user_id: user.id
      can :read, Pd::Session
      can :manage, Pd::Enrollment, user_id: user.id
      can :workshops_user_enrolled_in, Pd::Workshop
      can :index, Section, user_id: user.id

      if user.teacher?
        can :manage, Section, user_id: user.id
        can :manage, :teacher
        can :manage, User do |u|
          user.students.include?(u)
        end
        can :manage, Follower
        can :read, Workshop
        can :manage, UserLevel do |user_level|
          !user.students.where(id: user_level.user_id).empty?
        end
        can :read, Plc::UserCourseEnrollment, user_id: user.id
        can :view_level_solutions, Script do |script|
          !script.professional_learning_course?
        end
        can [:read, :find], :regional_partner_workshops
        can [:new, :create, :read], Pd::WorkshopMaterialOrder, user_id: user.id
        can [:new, :create, :read], Pd::Application::Facilitator1819Application, user_id: user.id
        can [:new, :create, :read], Pd::Application::Teacher1819Application, user_id: user.id
        can :manage, :maker_discount
      end

      if user.facilitator?
        can :read, Workshop
        can :teachers, Workshop
        can :read, District
        # Allow facilitator to manage Workshop/Attendance for
        # workshops in which they are a facilitator.
        can :manage, WorkshopAttendance do |attendance|
          attendance.segment.workshop.facilitators.include? user
        end
        can :manage, Workshop do |workshop|
          workshop.facilitators.include? user
        end
        can [:read, :start, :end, :workshop_survey_report, :summary, :filter], Pd::Workshop, facilitators: {id: user.id}
        can :manage_attendance, Pd::Workshop, facilitators: {id: user.id}, ended_at: nil
        can :create, Pd::FacilitatorProgramRegistration, user_id: user.id
      end

      if user.district_contact?
        can [:cohort, :teacher], WorkshopAttendance
        can :manage, Cohort do |cohort| # if the cohort has the district contact's district
          cohort.districts.any? do |district|
            district.contact_id == user.id
          end
        end
        can :group_view, Plc::UserCourseEnrollment
        can :manager_view, Plc::UserCourseEnrollment do |enrollment|
          DistrictsUsers.exists?(user: enrollment.user, district: District.where(contact: user.id).pluck(:id))
        end
      end

      if user.workshop_organizer?
        can :create, Pd::Workshop
        can [:read, :start, :end, :update, :destroy, :summary, :filter], Pd::Workshop, organizer_id: user.id
        can :manage_attendance, Pd::Workshop, organizer_id: user.id, ended_at: nil
        can :read, Pd::CourseFacilitator
        can :index, :workshop_organizer_survey_report
        can :read, :pd_workshop_summary_report
        can :read, :pd_teacher_attendance_report
        if user.regional_partners.any?
          # regional partners by default have read, quick_view, and update
          # permissions
          can [:read, :quick_view, :cohort_view, :update], Pd::Application::ApplicationBase, regional_partner_id: user.regional_partners.pluck(:id)

          # G3 regional partners should have full management permission
          group_3_partner_ids = user.regional_partners.where(group: 3).pluck(:id)
          unless group_3_partner_ids.empty?
            can :manage, Pd::Application::ApplicationBase, regional_partner_id: group_3_partner_ids
          end
        end
      end

      if user.permission?(UserPermission::WORKSHOP_ADMIN)
        can :manage, Pd::Workshop
        can :manage, Pd::WorkshopMaterialOrder
        can :manage, Pd::CourseFacilitator
        can :manage, :workshop_organizer_survey_report
        can :manage, :pd_workshop_summary_report
        can :manage, :pd_teacher_attendance_report
        can :manage, Pd::TeacherApplication
        can :manage, :pd_workshop_user_management
        can :manage, :pd_workshop_admins
        can :manage, RegionalPartner
        can :report_csv, :peer_review_submissions
        can :manage, Pd::RegionalPartnerMapping
        can :manage, Pd::Application::ApplicationBase
        can :manage, Pd::Application::Facilitator1819Application
        can :manage, Pd::Application::Teacher1819Application
      end

      if user.permission?(UserPermission::PLC_REVIEWER)
        can :manage, PeerReview
        can :index, :peer_review_submissions
        can :dashboard, :peer_reviews
        can :report_csv, :peer_review_submissions
      end
    end

    # Override Script and ScriptLevel.
    if user.persisted?
      can :read, Script
      can :read, ScriptLevel
    else
      can :read, Script do |script|
        !script.login_required?
      end
      can :read, ScriptLevel do |script_level|
        !script_level.script.login_required?
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
        Game,
        Level,
        Course,
        Script,
        ScriptLevel
      ]

      # Only custom levels are editable.
      cannot [:update, :destroy], Level do |level|
        !level.custom?
      end
    end

    if user.persisted? && user.permission?(UserPermission::RESET_ABUSE)
      # let them change the hidden state
      can :manage, LevelSource
    end

    if user.admin?
      can :manage, :all

      cannot :manage, [
        Activity,
        Game,
        Level,
        Course,
        Script,
        ScriptLevel,
        UserLevel,
        UserScript
      ]
    end
  end
end

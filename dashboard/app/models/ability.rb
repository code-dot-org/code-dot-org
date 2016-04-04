class Ability
  include CanCan::Ability

  def initialize(user)
    # Define abilities for the passed in user here. For example:
    #
    user ||= User.new # guest user (not logged in)
    if user.admin?
      can :manage, :all

      # Only custom levels are editable
      cannot [:update, :destroy], Level do |level|
        !level.custom?
      end
    else
      can :read, :all
      cannot :read, [
        Script, # see override below
        ScriptLevel, # see override below
        PrizeProvider,
        Prize,
        TeacherPrize,
        TeacherBonusPrize,
        LevelSourceHint,
        FrequentUnsuccessfulLevelSource,
        :reports,
        User,
        Follower,
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
        Plc::CourseUnit
      ]
    end

    if user.id
      can :manage, user

      can :create, Activity, user_id: user.id
      can :save_to_gallery, Activity, user_id: user.id
      can :create, GalleryActivity, user_id: user.id
      can :destroy, GalleryActivity, user_id: user.id
      can :create, UserLevel, user_id: user.id
      can :update, UserLevel, user_id: user.id
      can :create, Follower, student_user_id: user.id
      can :destroy, Follower, student_user_id: user.id

      if user.hint_access? || user.teacher?
        can :manage, [LevelSourceHint, FrequentUnsuccessfulLevelSource]
      end

      if user.teacher?
        can :manage, Section, user_id: user.id
        can :manage, :teacher
        can :manage, user.students
        can :manage, Follower
        can :read, Workshop
        can :manage, UserLevel do |user_level|
          !user.students.where(id: user_level.user_id).empty?
        end
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
      end

      if user.district_contact?
        can [:cohort, :teacher], WorkshopAttendance
        can :manage, Cohort do |cohort| # if the cohort has the district contact's district
          cohort.districts.any? do |district|
            district.contact_id == user.id
          end
        end
      end
    end

    if user.id && user.admin?
      can :read, Script
      can :read, ScriptLevel
    elsif user.id # logged in, not admin
      can :read, Script do |script|
        !script.admin_required?
      end
      can :read, ScriptLevel do |script_level|
        !script_level.script.admin_required?
      end
    else # not logged in
      can :read, Script do |script|
        !script.admin_required? && !script.login_required?
      end
      can :read, ScriptLevel do |script_level|
        !script_level.script.login_required? && !script_level.script.admin_required?
      end
    end

    #
    # The first argument to `can` is the action you are giving the user
    # permission to do.
    # If you pass :manage it will apply to every action. Other common actions
    # here are :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on.
    # If you pass :all it will apply to every resource. Otherwise pass a Ruby
    # class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the
    # objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details:
    # https://github.com/ryanb/cancan/wiki/Defining-Abilities
  end
end

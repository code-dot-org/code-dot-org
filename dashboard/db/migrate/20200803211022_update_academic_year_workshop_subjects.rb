class UpdateAcademicYearWorkshopSubjects < ActiveRecord::Migration[5.0]
  CUTOFF_DATE = '2020-08-05'

  # The top 6 subjects here are straight string changes for the names of
  # our academic year workshops.
  # The "Virtual Workshop #" workshops represent regional partners
  # who have scheduled these "Virtual Workshop #" workshops instead of
  # the more traditional "Academic Year Workshop #" workshops.
  # This migration moves those workshops to to the more traditional
  # workhop naming convention. These regional partners also likely have
  # "Virtual Workshop 2/4/6/8" scheduled - we are working
  # with this limited group to manually delete or
  # update these workshops, as appropriate.
  CSD_COURSE = 'CS Discoveries'.freeze
  CSD_SUBJECTS = [
    {from: 'Workshop 1: Unit 3', to: 'Academic Year Workshop 1'},
    {from: 'Workshop 2: Unit 4', to: 'Academic Year Workshop 2'},
    {from: 'Workshop 3: Unit 5', to: 'Academic Year Workshop 3'},
    {from: 'Workshop 4: Unit 6', to: 'Academic Year Workshop 4'},
    {from: '2-day, Workshops 1+2: Units 3 and 4', to: 'Academic Year Workshop 1 + 2'},
    {from: '2-day, Workshops 3+4: Units 5 and 6', to: 'Academic Year Workshop 3 + 4'},
    {from: 'Virtual Workshop 1', to: 'Academic Year Workshop 1'},
    {from: 'Virtual Workshop 3', to: 'Academic Year Workshop 2'},
    {from: 'Virtual Workshop 5', to: 'Academic Year Workshop 3'},
    {from: 'Virtual Workshop 7', to: 'Academic Year Workshop 4'},
  ].freeze

  CSP_COURSE = 'CS Principles'.freeze
  CSP_SUBJECTS = [
    {from: 'Workshop 1: Unit 3', to: 'Academic Year Workshop 1'},
    {from: 'Workshop 2: Unit 4 and Explore Task', to: 'Academic Year Workshop 2'},
    {from: 'Workshop 3: Unit 5 and Create Task', to: 'Academic Year Workshop 3'},
    {from: 'Workshop 4: Unit 5 and Multiple Choice Exam', to: 'Academic Year Workshop 4'},
    {from: '2-day, Workshops 1+2: Units 3-4 and Explore Task', to: 'Academic Year Workshop 1 + 2'},
    {from: '2-day, Workshops 3+4: Unit 5, Create Task, and Multiple Choice Exam', to: 'Academic Year Workshop 3 + 4'},
    {from: 'Virtual Workshop 1', to: 'Academic Year Workshop 1'},
    {from: 'Virtual Workshop 3', to: 'Academic Year Workshop 2'},
    {from: 'Virtual Workshop 5', to: 'Academic Year Workshop 3'},
    {from: 'Virtual Workshop 7', to: 'Academic Year Workshop 4'},
  ].freeze

  def up
    CSD_SUBJECTS.each do |subject_name|
      csd_workshops = Pd::Workshop.where(course: CSD_COURSE, subject: subject_name[:from]).
        scheduled_start_on_or_after(CUTOFF_DATE)

      updates = {
        subject: subject_name[:to],
        suppress_email: true
      }
      updates[:virtual] = true if subject_name[:from].include? 'Virtual'

      csd_workshops.each do |csd_workshop|
        csd_workshop.update updates
      end
    end

    CSP_SUBJECTS.each do |subject_name|
      csp_workshops = Pd::Workshop.where(course: CSP_COURSE, subject: subject_name[:from]).
        scheduled_start_on_or_after(CUTOFF_DATE)

      updates = {
        subject: subject_name[:to],
        suppress_email: true
      }
      updates[:virtual] = true if subject_name[:from].include? 'Virtual'

      csp_workshops.each do |csp_workshop|
        csp_workshop.update updates
      end
    end
  end

  # Note this won't exactly roll back the "up" version of the migration,
  # as we don't know the state of suppress_email and virtual on the workshops
  # where this is being applied. However, we want to suppress email in
  # Academic Year Workshops this school year, so in the case of a problem
  # with subject naming we'll leave the email suppression as-is.
  # It also will rename subjects originally named "Virtual Workshop #"
  # to "Workshop 1: Unit 3", which we think is ok in this situation.
  def down
    CSD_SUBJECTS.each do |subject_name|
      csd_workshops = Pd::Workshop.where(course: CSD_COURSE, subject: subject_name[:to]).
        scheduled_start_on_or_after(CUTOFF_DATE)

      csd_workshops.each do |csd_workshop|
        csd_workshop.update(subject: subject_name[:from])
      end
    end

    CSP_SUBJECTS.each do |subject_name|
      csp_workshops = Pd::Workshop.where(course: CSP_COURSE, subject: subject_name[:to]).
        scheduled_start_on_or_after(CUTOFF_DATE)

      csp_workshops.each do |csp_workshop|
        csp_workshop.update(subject: subject_name[:from])
      end
    end
  end
end

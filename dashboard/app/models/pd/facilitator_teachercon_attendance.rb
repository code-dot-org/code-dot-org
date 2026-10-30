# == Schema Information
#
# Table name: pd_facilitator_teachercon_attendances
#
#  id          :integer          not null, primary key
#  user_id     :integer          not null
#  tc1_arrive  :date
#  tc1_depart  :date
#  fit1_arrive :date
#  fit1_depart :date
#  fit1_course :string(255)
#  tc2_arrive  :date
#  tc2_depart  :date
#  fit2_arrive :date
#  fit2_depart :date
#  fit2_course :string(255)
#  tc3_arrive  :date
#  tc3_depart  :date
#  fit3_arrive :date
#  fit3_depart :date
#  fit3_course :string(255)
#
# Indexes
#
#  index_pd_facilitator_teachercon_attendances_on_user_id  (user_id)
#

class Pd::FacilitatorTeacherconAttendance < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :restricted,
    user_id: :restricted,
    tc1_arrive: :restricted,
    tc1_depart: :restricted,
    fit1_arrive: :restricted,
    fit1_depart: :restricted,
    fit1_course: :restricted,
    tc2_arrive: :restricted,
    tc2_depart: :restricted,
    fit2_arrive: :restricted,
    fit2_depart: :restricted,
    fit2_course: :restricted,
    tc3_arrive: :restricted,
    tc3_depart: :restricted,
    fit3_arrive: :restricted,
    fit3_depart: :restricted,
    fit3_course: :restricted,
  )

  DATE_FORMAT = "%B %e".freeze

  belongs_to :user, optional: true

  def attendance_dates(teachercon)
    dates = {}

    unless self["tc#{teachercon}_arrive"].nil?
      dates['teachercon'] = {
        arrive: self["tc#{teachercon}_arrive"].strftime(DATE_FORMAT),
        depart: self["tc#{teachercon}_depart"].strftime(DATE_FORMAT),
      }
    end

    unless self["fit#{teachercon}_arrive"].nil?
      dates['training'] = {
        arrive: self["fit#{teachercon}_arrive"].strftime(DATE_FORMAT),
        depart: self["fit#{teachercon}_depart"].strftime(DATE_FORMAT),
      }
    end

    return if dates.empty?
    dates
  end

  def course(teachercon)
    self["fit#{teachercon}_course"]
  end
end

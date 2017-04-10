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
#  tc1_program :string(255)
#  tc2_arrive  :date
#  tc2_depart  :date
#  fit2_arrive :date
#  fit2_depart :date
#  tc2_program :string(255)
#  tc3_arrive  :date
#  tc3_depart  :date
#  fit3_arrive :date
#  fit3_depart :date
#  tc3_program :string(255)
#
# Indexes
#
#  index_pd_facilitator_teachercon_attendances_on_user_id  (user_id)
#

class Pd::FacilitatorTeacherconAttendance < ActiveRecord::Base
  belongs_to :user

  DATE_FORMAT = "%B %e".freeze

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

  def program(teachercon)
    self["tc#{teachercon}_program"]
  end
end

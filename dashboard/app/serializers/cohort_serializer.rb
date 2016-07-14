# == Schema Information
#
# Table name: cohorts
#
#  id           :integer          not null, primary key
#  created_at   :datetime
#  updated_at   :datetime
#  name         :string(255)
#  program_type :string(255)
#  cutoff_date  :datetime
#  script_id    :integer
#
# Indexes
#
#  index_cohorts_on_name          (name)
#  index_cohorts_on_program_type  (program_type)
#

class CohortSerializer < ActiveModel::Serializer
  attributes :id, :name, :program_type, :cutoff_date, :districts, :script_id
  has_many :workshops
  has_many :teachers
  has_many :deleted_teachers

  def districts
    if district_contact?
      object.cohorts_districts.where(district_id: scope.district_as_contact.id).
        map{|cd| CohortsDistrictSerializer.new(cd).attributes}
    else
      object.cohorts_districts.
        map{|cd| CohortsDistrictSerializer.new(cd).attributes}
    end
  end

  def teachers
    if district_contact?
      object.teachers.select {|teacher| teacher.district_id == current_user.district_as_contact.id}
    else
      object.teachers
    end
  end

  def deleted_teachers
    if district_contact?
      object.deleted_teachers.select {|teacher| teacher.district_id == current_user.district_as_contact.id}
    else
      object.deleted_teachers
    end
  end

  def cutoff_date
    object.cutoff_date.try(:strftime, '%Y-%m-%d')
  end

  private

  def district_contact?
    scope && !scope.admin? && scope.district_contact?
  end

end

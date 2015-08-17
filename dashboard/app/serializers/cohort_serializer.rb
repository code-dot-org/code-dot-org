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

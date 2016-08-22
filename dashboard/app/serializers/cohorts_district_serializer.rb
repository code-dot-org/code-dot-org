# == Schema Information
#
# Table name: cohorts_districts
#
#  id           :integer          not null, primary key
#  cohort_id    :integer          not null
#  district_id  :integer          not null
#  max_teachers :integer
#
# Indexes
#
#  index_cohorts_districts_on_cohort_id_and_district_id  (cohort_id,district_id)
#  index_cohorts_districts_on_district_id_and_cohort_id  (district_id,cohort_id)
#

class CohortsDistrictSerializer < ActiveModel::Serializer
  attributes :id, :name, :location, :max_teachers

  def id
    object.district.id
  end

  def name
    object.district.name
  end

  def location
    object.district.location
  end
end

class BackfillSchoolYearInApSchoolCodes < ActiveRecord::Migration[5.0]
  def change
    Census::ApSchoolCode.where(school_year: nil).update_all(school_year: 2016)
  end
end

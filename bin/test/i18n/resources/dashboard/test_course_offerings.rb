require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/course_offerings'

class I18n::Resources::Dashboard::CourseOfferingsTest < Minitest::Test
  def test_sync_in
    CourseOffering.transaction do
      CourseOffering.delete_all

      FactoryBot.create(:course_offering, key: 'course-offering-key-2', display_name: 'course-offering-name-2')
      FactoryBot.create(:course_offering, key: 'course-offering-key-1', display_name: 'course-offering-name-1')

      File.expects(:write).with(
        CDO.dir('i18n/locales/source/dashboard/course_offerings.json'),
        %Q[{\n  "course-offering-key-2": "course-offering-name-2",\n  "course-offering-key-1": "course-offering-name-1"\n}]
      ).once

      I18n::Resources::Dashboard::CourseOfferings.sync_in
    ensure
      raise ActiveRecord::Rollback
    end
  end
end

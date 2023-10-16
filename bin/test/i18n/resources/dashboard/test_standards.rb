require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/dashboard/standards'

class I18n::Resources::Dashboard::StandardsTest < Minitest::Test
  def test_sync_in
    ActiveRecord::Base.transaction do
      Framework.delete_all
      StandardCategory.delete_all
      Standard.delete_all

      framework1 = FactoryBot.create(:framework, shortcode: 'framework-1', name: 'Framework 1')
      framework2 = FactoryBot.create(:framework, shortcode: 'framework-2', name: 'Framework 2')
      FactoryBot.create(:standard_category, framework: framework1, shortcode: 'standard-category-1', description: 'Standard Category 1')
      FactoryBot.create(:standard, framework: framework2, shortcode: 'standard-2', description: 'Standard 2')

      FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/standards')).once
      File.expects(:write).with(
        CDO.dir('i18n/locales/source/standards/framework-1.json'),
        %Q[{\n  "name": "Framework 1",\n  "categories": {\n    "standard-category-1": {\n      "description": "Standard Category 1"\n    }\n  },\n  "standards": {\n  }\n}]
      ).once
      File.expects(:write).with(
        CDO.dir('i18n/locales/source/standards/framework-2.json'),
        %Q[{\n  "name": "Framework 2",\n  "categories": {\n  },\n  "standards": {\n    "standard-2": {\n      "description": "Standard 2"\n    }\n  }\n}]
      ).once

      I18n::Resources::Dashboard::Standards.sync_in
    ensure
      raise ActiveRecord::Rollback
    end
  end
end

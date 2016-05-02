require_relative '../../db/migrate/20160502142010_migrate_net_promoter_score2015_data.rb'
require 'active_record'
require 'test_helper'

class MigrateNetPromoterScore2015DataTest < ActiveSupport::TestCase
  setup do
    @new_version = '20160502142010'
    @previous_version = '20160502025309'

    ActiveRecord::Migrator.migrate @previous_version
  end

  teardown do
    ActiveRecord::Migrator.migrate 'db/migrate'
  end

  test 'creates SurveyResult records for users with values or comments' do
    COMMENT = 'some survey comment'
    VALUE = 10
    user = create :user
    user.survey2015_value = VALUE
    user.survey2015_comment = COMMENT
    user.save!

    MigrateNetPromoterScore2015Data.up

    survey_result = SurveyResult.where(user_id: user.id).first
    assert survey_result
    assert_equal 'NetPromoterScore2015', survey_result.kind
    assert_equal COMMENT, survey_result.nps_comment
    assert_equal VALUE, survey_result.nps_value
    assert_equal '2015-09-15 00:00:00 UTC', survey_result.created_at
    assert_equal '2015-09-15 00:00:00 UTC', survey_result.updated_at
  end

  test 'does not create SurveyResult records for users without values or comments' do
    user = create :user

    MigrateNetPromoterScore2015Data.up

    assert SurveyResult.where(user_id: user.id).empty?
  end

  test 'does delete appropriate records on rollback' do
    ActiveRecord::Migrator.migrate @new_version

    user = create :user
    SurveyResult.create(
      user_id: user.id, kind: 'NetPromoterScore2015', nps_value: 10)
    SurveyResult.create(
      user_id: user.id, kind: 'Diversity2016', survey2016_ethnicity_other: 1)

    MigrateNetPromoterScore2015Data.down

    assert SurveyResult.where(kind: 'NetPromoterScore2015').empty?
    survey_result = SurveyResult.where(kind: 'Diversity2016').first
    assert survey_result
    assert_equal 1, survey_result.survey2016_ethnicity_other
  end
end

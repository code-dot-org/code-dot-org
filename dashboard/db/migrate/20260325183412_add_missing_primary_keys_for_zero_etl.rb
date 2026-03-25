class AddMissingPrimaryKeysForZeroEtl < ActiveRecord::Migration[7.0]
  def up
    # Add composite primary keys to join tables.
    composite_key_tables = {
      census_submissions_school_infos: [:census_submission_id, :school_info_id],
      code_review_group_members: [:code_review_group_id, :follower_id],
      course_offerings_pd_workshops: [:course_offering_id, :pd_workshop_id],
      lessons_programming_expressions: [:lesson_id, :programming_expression_id],
      lessons_resources: [:lesson_id, :resource_id],
      lessons_vocabularies: [:lesson_id, :vocabulary_id],
      levels_script_levels: [:level_id, :script_level_id],
      levels_skills: [:level_id, :skill_id],
      lti_deployments_user_identities: [:lti_deployment_id, :lti_user_identity_id],
      pd_application_tags_applications: [:pd_application_id, :pd_application_tag_id],
      pd_regional_partner_cohorts_users: [:pd_regional_partner_cohort_id, :user_id],
      pd_workshops_facilitators: [:pd_workshop_id, :user_id],
      regional_partners_school_districts: [:regional_partner_id, :school_district_id],
      scripts_resources: [:script_id, :resource_id],
      stages_standards: [:stage_id, :standard_id],
      unit_groups_resources: [:unit_group_id, :resource_id]
    }

    composite_key_tables.each do |table, columns|
      execute "ALTER TABLE #{table} ADD PRIMARY KEY (#{columns.join(', ')});"
    end

    # Tables requiring single-column primary keys.
    execute "ALTER TABLE schools ADD PRIMARY KEY (id);"
  end

  def down
    # Drop composite primary keys.
    composite_tables = %i[
      census_submissions_school_infos code_review_group_members course_offerings_pd_workshops
      lessons_programming_expressions lessons_resources lessons_vocabularies
      levels_script_levels levels_skills lti_deployments_user_identities
      pd_application_tags_applications pd_regional_partner_cohorts_users
      pd_workshops_facilitators regional_partners_school_districts
      scripts_resources stages_standards unit_groups_resources
    ]

    composite_tables.each do |table|
      execute "ALTER TABLE #{table} DROP PRIMARY KEY;"
    end

    # Drop single-column primary keys.
    execute "ALTER TABLE schools DROP PRIMARY KEY;"
  end
end

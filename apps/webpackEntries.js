var ALL_APPS = [
  'ailab',
  'applab',
  'bounce',
  'calc',
  'craft',
  'dance',
  'eval',
  'fish',
  'flappy',
  'javalab',
  'gamelab',
  'jigsaw',
  'lab2',
  'maze',
  'netsim',
  'poetry',
  'spritelab',
  'studio',
  'turtle',
  'weblab',
];

var codeStudioEntries = {
  'certificates/batch': './src/sites/studio/pages/certificates/batch.js',
  'certificates/show': './src/sites/studio/pages/certificates/show.js',
  'code-studio': './src/sites/studio/pages/code-studio.js',
  'congrats/index': './src/sites/studio/pages/congrats/index.js',
  'courses/index': './src/sites/studio/pages/courses/index.js',
  'courses/show': './src/sites/studio/pages/courses/show.js',
  'courses/vocab': './src/sites/studio/pages/courses/vocab.js',
  'courses/resources': './src/sites/studio/pages/courses/resources.js',
  'courses/code': './src/sites/studio/pages/courses/code.js',
  'courses/standards': './src/sites/studio/pages/courses/standards.js',
  'curriculum_catalog/index':
    './src/sites/studio/pages/curriculum_catalog/index.js',
  'data_docs/index': './src/sites/studio/pages/data_docs/index.js',
  'data_docs/show': './src/sites/studio/pages/data_docs/show.js',
  'incubator/index': './src/sites/studio/pages/incubator/index.js',
  'lessons/show': './src/sites/studio/pages/lessons/show.js',
  'lessons/student_lesson_plan':
    './src/sites/studio/pages/lessons/student_lesson_plan.js',
  'musiclab/index': './src/sites/studio/pages/musiclab/index.js',
  'musiclab/menu': './src/sites/studio/pages/musiclab/menu.js',
  'policy_compliance/child_account_consent':
    './src/sites/studio/pages/policy_compliance/child_account_consent.js',
  'print_certificates/batch':
    './src/sites/studio/pages/print_certificates/batch.js',
  'programming_classes/show':
    './src/sites/studio/pages/programming_classes/show.js',
  'programming_environments/index':
    './src/sites/studio/pages/programming_environments/index.js',
  'programming_environments/show':
    './src/sites/studio/pages/programming_environments/show.js',
  'programming_expressions/show':
    './src/sites/studio/pages/programming_expressions/show.js',
  'sessions/lockout': './src/sites/studio/pages/sessions/lockout.js',
  'devise/sessions/new': './src/sites/studio/pages/devise/sessions/new.js',
  'devise/registrations/_sign_up':
    './src/sites/studio/pages/devise/registrations/_sign_up.js',
  'devise/shared/_oauth_links':
    './src/sites/studio/pages/devise/shared/_oauth_links.js',
  'devise/registrations/_finish_sign_up':
    './src/sites/studio/pages/devise/registrations/_finish_sign_up.js',
  'devise/registrations/edit':
    './src/sites/studio/pages/devise/registrations/edit.js',
  essential: './src/sites/studio/pages/essential.js',
  'home/_homepage': './src/sites/studio/pages/home/_homepage.js',
  'layouts/_parent_email_banner':
    './src/sites/studio/pages/layouts/_parent_email_banner.js',
  'layouts/_race_interstitial':
    './src/sites/studio/pages/layouts/_race_interstitial.js',
  'layouts/_section_creation_celebration_dialog':
    './src/sites/studio/pages/layouts/_section_creation_celebration_dialog.js',
  'layouts/_school_info_confirmation_dialog':
    './src/sites/studio/pages/layouts/_school_info_confirmation_dialog.js',
  'layouts/_school_info_interstitial':
    './src/sites/studio/pages/layouts/_school_info_interstitial.js',
  'layouts/_small_footer':
    './src/sites/studio/pages/layouts/_small_footer.js',
  'layouts/_terms_interstitial':
    './src/sites/studio/pages/layouts/_terms_interstitial.js',
  'layouts/_initial_section_creation_interstitial':
    './src/sites/studio/pages/layouts/_initial_section_creation_interstitial.js',
  'levels/_bubble_choice':
    './src/sites/studio/pages/levels/_bubble_choice.js',
  'levels/_content': './src/sites/studio/pages/levels/_content.js',
  'levels/_contract_match':
    './src/sites/studio/pages/levels/_contract_match.js',
  'levels/_curriculum_reference':
    './src/sites/studio/pages/levels/_curriculum_reference.js',
  'levels/_dialog': './src/sites/studio/pages/levels/_dialog.js',
  'levels/_evaluation_multi':
    './src/sites/studio/pages/levels/_evaluation_multi.js',
  'levels/_external': './src/sites/studio/pages/levels/_external.js',
  'levels/_external_link':
    './src/sites/studio/pages/levels/_external_link.js',
  'levels/_free_response':
    './src/sites/studio/pages/levels/_free_response.js',
  'levels/_level_group': './src/sites/studio/pages/levels/_level_group.js',
  'levels/_match': './src/sites/studio/pages/levels/_match.js',
  'levels/_multi': './src/sites/studio/pages/levels/_multi.js',
  'levels/_pixelation': './src/sites/studio/pages/levels/_pixelation.js',
  'levels/_single_multi': './src/sites/studio/pages/levels/_single_multi.js',
  'levels/_standalone_video':
    './src/sites/studio/pages/levels/_standalone_video.js',
  'levels/_summary': './src/sites/studio/pages/levels/_summary.js',
  'levels/_teacher_markdown':
    './src/sites/studio/pages/levels/_teacher_markdown.js',
  'levels/_teacher_panel':
    './src/sites/studio/pages/levels/_teacher_panel.js',
  'levels/_text_match': './src/sites/studio/pages/levels/_text_match.js',
  'levels/_widget': './src/sites/studio/pages/levels/_widget.js',
  'levels/show': './src/sites/studio/pages/levels/show.js',
  'maker/home': './src/sites/studio/pages/maker/home.js',
  'maker/setup': './src/sites/studio/pages/maker/setup.js',
  'projects/featured': './src/sites/studio/pages/projects/featured.js',
  'projects/index': './src/sites/studio/pages/projects/index.js',
  'report_abuse/report_abuse_form':
    './src/sites/studio/pages/report_abuse/report_abuse_form.js',
  'reference_guides/show':
    './src/sites/studio/pages/reference_guides/show.js',
  'scripts/show': './src/sites/studio/pages/scripts/show.js',
  'scripts/vocab': './src/sites/studio/pages/scripts/vocab.js',
  'scripts/resources': './src/sites/studio/pages/scripts/resources.js',
  'scripts/code': './src/sites/studio/pages/scripts/code.js',
  'scripts/standards': './src/sites/studio/pages/scripts/standards.js',
  'scripts/lesson_extras':
    './src/sites/studio/pages/scripts/lesson_extras.js',
  'sections/show': './src/sites/studio/pages/sections/show.js',
  'shared/_school_info': './src/sites/studio/pages/shared/_school_info.js',
  'teacher_dashboard/show':
    './src/sites/studio/pages/teacher_dashboard/show.js',
  'teacher_dashboard/parent_letter':
    './src/sites/studio/pages/teacher_dashboard/parent_letter.js',
  'teacher_feedbacks/index':
    './src/sites/studio/pages/teacher_feedbacks/index.js',
  'vocabularies/edit': './src/sites/studio/pages/vocabularies/edit.js',
  'weblab_host/network_check':
    './src/sites/studio/pages/weblab_host/network_check.js',
};

var internalEntries = {
  'blocks/edit': './src/sites/studio/pages/blocks/edit.js',
  'blocks/index': './src/sites/studio/pages/blocks/index.js',
  'course_offerings/edit':
    './src/sites/studio/pages/course_offerings/edit.js',
  'courses/edit': './src/sites/studio/pages/courses/edit.js',
  'courses/new': './src/sites/studio/pages/courses/new.js',
  'data_docs/new': './src/sites/studio/pages/data_docs/new.js',
  'data_docs/edit': './src/sites/studio/pages/data_docs/edit.js',
  'data_docs/edit_all': './src/sites/studio/pages/data_docs/edit_all.js',
  'datasets/show': './src/sites/studio/pages/datasets/show.js',
  'datasets/index': './src/sites/studio/pages/datasets/index.js',
  'datasets/edit_manifest':
    './src/sites/studio/pages/datasets/edit_manifest.js',
  'lessons/edit': './src/sites/studio/pages/lessons/edit.js',
  levelbuilder: './src/sites/studio/pages/levelbuilder.js',
  'levels/editors/_applab':
    './src/sites/studio/pages/levels/editors/_applab.js',
  'levels/editors/_craft':
    './src/sites/studio/pages/levels/editors/_craft.js',
  'levels/editors/_dsl': './src/sites/studio/pages/levels/editors/_dsl.js',
  'levels/editors/fields/_animation':
    './src/sites/studio/pages/levels/editors/fields/_animation.js',
  'levels/editors/fields/_bubble_choice_sublevel':
    './src/sites/studio/pages/levels/editors/fields/_bubble_choice_sublevel.js',
  'levels/editors/fields/_blockly':
    './src/sites/studio/pages/levels/editors/fields/_blockly.js',
  'levels/editors/fields/_callouts':
    './src/sites/studio/pages/levels/editors/fields/_callouts.js',
  'levels/editors/fields/_droplet':
    './src/sites/studio/pages/levels/editors/fields/_droplet.js',
  'levels/editors/fields/_grid':
    './src/sites/studio/pages/levels/editors/fields/_grid.js',
  'levels/editors/fields/_poetry_fields':
    './src/sites/studio/pages/levels/editors/fields/_poetry_fields.js',
  'levels/editors/fields/_preload_assets':
    './src/sites/studio/pages/levels/editors/fields/_preload_assets.js',
  'levels/editors/fields/_special_level_types':
    './src/sites/studio/pages/levels/editors/fields/_special_level_types.js',
  'levels/editors/fields/_validation_code':
    './src/sites/studio/pages/levels/editors/fields/_validation_code.js',
  'levels/editors/fields/_validations':
    './src/sites/studio/pages/levels/editors/fields/_validations.js',
  'levels/editors/fields/_video':
    './src/sites/studio/pages/levels/editors/fields/_video.js',
  'levels/editors/_gamelab':
    './src/sites/studio/pages/levels/editors/_gamelab.js',
  'levels/editors/_pixelation':
    './src/sites/studio/pages/levels/editors/_pixelation.js',
  'levels/editors/_studio':
    './src/sites/studio/pages/levels/editors/_studio.js',
  'libraries/edit': './src/sites/studio/pages/libraries/edit.js',
  'programming_classes/new':
    './src/sites/studio/pages/programming_classes/new.js',
  'programming_classes/edit':
    './src/sites/studio/pages/programming_classes/edit.js',
  'programming_environments/new':
    './src/sites/studio/pages/programming_environments/new.js',
  'programming_environments/edit':
    './src/sites/studio/pages/programming_environments/edit.js',
  'programming_expressions/new':
    './src/sites/studio/pages/programming_expressions/new.js',
  'programming_expressions/edit':
    './src/sites/studio/pages/programming_expressions/edit.js',
  'programming_methods/edit':
    './src/sites/studio/pages/programming_methods/edit.js',
  'reference_guides/new': './src/sites/studio/pages/reference_guides/new.js',
  'reference_guides/edit':
    './src/sites/studio/pages/reference_guides/edit.js',
  'reference_guides/edit_all':
    './src/sites/studio/pages/reference_guides/edit_all.js',
  'programming_expressions/index':
    './src/sites/studio/pages/programming_expressions/index.js',
  'rubrics/new': './src/sites/studio/pages/rubrics/new.js',
  'rubrics/edit': './src/sites/studio/pages/rubrics/edit.js',
  'sections/new': './src/sites/studio/pages/sections/new.js',
  'sections/edit': './src/sites/studio/pages/sections/edit.js',
  'scripts/edit': './src/sites/studio/pages/scripts/edit.js',
  'scripts/new': './src/sites/studio/pages/scripts/new.js',
  'shared/_check_admin': './src/sites/studio/pages/shared/_check_admin.js',
  'shared_blockly_functions/edit':
    './src/sites/studio/pages/shared_blockly_functions/edit.js',
  'sprite_management/sprite_upload':
    './src/sites/studio/pages/sprite_management/sprite_upload.js',
  'sprite_management/sprite_management_directory':
    './src/sites/studio/pages/sprite_management/sprite_management_directory.js',
  'sprite_management/default_sprites_editor':
    './src/sites/studio/pages/sprite_management/default_sprites_editor.js',
  'sprite_management/release_default_sprites_to_production':
    './src/sites/studio/pages/sprite_management/release_default_sprites_to_production.js',
  'sprite_management/select_start_animations':
    './src/sites/studio/pages/sprite_management/select_start_animations.js',
};

var pegasusEntries = {
  // code.org
  'code.org/public/dance': './src/sites/code.org/pages/public/dance.js',
  'code.org/public/student/middle-high':
    './src/sites/code.org/pages/public/student/middle-high.js',
  'code.org/public/teacher-dashboard/index':
    './src/sites/code.org/pages/public/teacher-dashboard/index.js',
  'code.org/public/yourschool':
    './src/sites/code.org/pages/public/yourschool.js',
  'code.org/public/yourschool/thankyou':
    './src/sites/code.org/pages/public/yourschool/thankyou.js',
  'code.org/public/administrators':
    './src/sites/code.org/pages/public/administrators.js',
  'code.org/views/regional_partner_search':
    './src/sites/code.org/pages/views/regional_partner_search.js',
  'code.org/views/share_privacy':
    './src/sites/code.org/pages/views/share_privacy.js',
  'code.org/views/theme_common_head_after':
    './src/sites/code.org/pages/views/theme_common_head_after.js',
  'code.org/views/theme_google_analytics':
    './src/sites/code.org/pages/views/theme_google_analytics.js',
  'code.org/views/workshop_search':
    './src/sites/code.org/pages/views/workshop_search.js',
  'code.org/views/amazon_future_engineer':
    './src/sites/code.org/pages/views/amazon_future_engineer.js',
  'code.org/views/amazon_future_engineer_eligibility':
    './src/sites/code.org/pages/views/amazon_future_engineer_eligibility.js',
  'code.org/views/job_board': './src/sites/code.org/pages/views/job_board.js',
  'code.org/views/analytics_event_log_helper':
    './src/sites/code.org/pages/views/analytics_event_log_helper.js',

  // hourofcode.com
  'hourofcode.com/public/index':
    './src/sites/hourofcode.com/pages/public/index.js',
  'hourofcode.com/views/theme_common_head_after':
    './src/sites/hourofcode.com/pages/views/theme_common_head_after.js',
  'hourofcode.com/views/hoc_events_map':
    './src/sites/hourofcode.com/pages/views/hoc_events_map.js',
  'hourofcode.com/views/theme_google_analytics':
    './src/sites/hourofcode.com/pages/views/theme_google_analytics.js',

  // shared between code.org and hourofcode.com
  tutorialExplorer: './src/tutorialExplorer/tutorialExplorer.js',
};

var professionalDevelopmentEntries = {
  'code.org/public/learn/local':
    './src/sites/code.org/pages/public/learn/local.js',

  'pd/_jotform_loader': './src/sites/studio/pages/pd/_jotform_loader.js',
  'pd/_jotform_embed': './src/sites/studio/pages/pd/_jotform_embed.js',

  'pd/workshop_dashboard/index':
    './src/sites/studio/pages/pd/workshop_dashboard/index.js',
  'pd/pre_workshop_survey/new':
    './src/sites/studio/pages/pd/pre_workshop_survey/new.js',
  'pd/teachercon_survey/new':
    './src/sites/studio/pages/pd/teachercon_survey/new.js',
  'pd/application_dashboard/index':
    './src/sites/studio/pages/pd/application_dashboard/index.js',
  'pd/application/teacher_application/new':
    './src/sites/studio/pages/pd/application/teacher_application/new.js',
  'pd/application/principal_approval_application/new':
    './src/sites/studio/pages/pd/application/principal_approval_application/new.js',
  'pd/workshop_daily_survey/new_general_foorm':
    './src/sites/studio/pages/pd/workshop_daily_survey/new_general_foorm.js',
  'pd/workshop_enrollment/new':
    './src/sites/studio/pages/pd/workshop_enrollment/new.js',
  'pd/workshop_enrollment/cancel':
    './src/sites/studio/pages/pd/workshop_enrollment/cancel.js',

  'pd/professional_learning_landing/index':
    './src/sites/studio/pages/pd/professional_learning_landing/index.js',
  'pd/regional_partner_mini_contact/new':
    './src/sites/studio/pages/pd/regional_partner_mini_contact/new.js',

  'pd/international_opt_in/new':
    './src/sites/studio/pages/pd/international_opt_in/new.js',

  'peer_reviews/dashboard':
    './src/sites/studio/pages/peer_reviews/dashboard.js',
  'peer_reviews/show': './src/sites/studio/pages/peer_reviews/show.js',

  'foorm/preview/index': './src/sites/studio/pages/foorm/preview/index.js',
  'foorm/preview/name': './src/sites/studio/pages/foorm/preview/name.js',
  'foorm/forms/editor': './src/sites/studio/pages/foorm/forms/editor.js',
  'foorm/libraries/editor':
    './src/sites/studio/pages/foorm/libraries/editor.js',
  'foorm/simple_survey_forms/show':
    './src/sites/studio/pages/foorm/simple_survey_forms/show.js',
};


// Entries which are shared between dashboard and pegasus, which are included
// by haml partials in the shared/haml/ directory.
const sharedEntries = {
  cookieBanner: './src/cookieBanner/cookieBanner.js',
};

var otherEntries = {
  // The blockly dependency is huge, so we currently control when it is
  // loaded explicitly via script tags rather than via normal imports.
  blockly: './src/sites/studio/pages/blockly.js',
  googleblockly: './src/sites/studio/pages/googleblockly.js',

  // embedBlocks.js is just React, the babel-polyfill, and a few other dependencies
  // in a bundle to minimize the amount of stuff we need when loading blocks
  // in an iframe.
  embedBlocks: './src/sites/studio/pages/embedBlocks.js',

  publicKeyCryptography: './src/publicKeyCryptography/main.js',

  brambleHost: './src/weblab/brambleHost.js',

  'applab-api': './src/applab/api-entry.js',
  'gamelab-api': './src/p5lab/gamelab/api-entry.js',

  regionalPartnerMiniContact:
    './src/regionalPartnerMiniContact/regionalPartnerMiniContact',
};

function assertAppsAreValid(appsToBuild) {
  for (const app of appsToBuild) {
    if (!ALL_APPS.includes(app)) {
      throw new Error(`Invalid app name: ${app}`);
    }
  }
}

function getAppsEntries(appsToBuild=ALL_APPS) {
  assertAppsAreValid(appsToBuild);

  return Object.fromEntries(
    appsToBuild.map(
      app => [app, './src/sites/studio/pages/levels-' + app + '-main.js']
    )
  );
}

module.exports = {
  ALL_APPS,
  assertAppsAreValid,
  getAppsEntries,
  codeStudioEntries,
  internalEntries,
  pegasusEntries,
  professionalDevelopmentEntries,
  sharedEntries,
  otherEntries,
};
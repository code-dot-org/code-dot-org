// Entrypoints for old-style "lab1" labs
//
// New labs should instead use Lab2, see: lab2EntryPoints.ts

const ALL_APPS = [
  'ailab',
  'applab',
  'bounce',
  'craft',
  'dance',
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

// prettier-ignore
const CODE_STUDIO_ENTRIES = {
  'certificates/batch': './src/sites/studio/pages/certificates/batch.js',
  'certificates/show': './src/sites/studio/pages/certificates/show.js',
  'code-studio': './src/sites/studio/pages/code-studio.js',
  'congrats/index': './src/sites/studio/pages/congrats/index.js',
  'courses/show': './src/sites/studio/pages/courses/show.js',
  'courses/vocab': './src/sites/studio/pages/courses/vocab.js',
  'courses/resources': './src/sites/studio/pages/courses/resources.js',
  'courses/code': './src/sites/studio/pages/courses/code.js',
  'courses/standards': './src/sites/studio/pages/courses/standards.js',
  'curriculum_catalog/index': './src/sites/studio/pages/curriculum_catalog/index.js',
  'data_docs/index': './src/sites/studio/pages/data_docs/index.js',
  'data_docs/show': './src/sites/studio/pages/data_docs/show.js',
  'incubator/index': './src/sites/studio/pages/incubator/index.js',
  'lessons/show': './src/sites/studio/pages/lessons/show.js',
  'lessons/student_lesson_plan': './src/sites/studio/pages/lessons/student_lesson_plan.js',
  'musiclab/menu': './src/sites/studio/pages/musiclab/menu.js',
  'musiclab/gallery': './src/sites/studio/pages/musiclab/gallery.js',
  'musiclab/embed': './src/sites/studio/pages/musiclab/embed.js',
  'policy_compliance/parental_permission/_banner': './src/sites/studio/pages/policy_compliance/parental_permission/_banner.js',
  'policy_compliance/parental_permission/_modal': './src/sites/studio/pages/policy_compliance/parental_permission/_modal.js',
  'policy_compliance/child_account_consent': './src/sites/studio/pages/policy_compliance/child_account_consent.js',
  'print_certificates/batch': './src/sites/studio/pages/print_certificates/batch.js',
  'print_certificates/show': './src/sites/studio/pages/print_certificates/show.js',
  'programming_classes/show': './src/sites/studio/pages/programming_classes/show.js',
  'programming_environments/index': './src/sites/studio/pages/programming_environments/index.js',
  'programming_environments/show': './src/sites/studio/pages/programming_environments/show.js',
  'programming_expressions/show': './src/sites/studio/pages/programming_expressions/show.js',
  'sessions/lockout': './src/sites/studio/pages/sessions/lockout.js',
  'devise/sessions/new': './src/sites/studio/pages/devise/sessions/new.js',
  'devise/registrations/_sign_up': './src/sites/studio/pages/devise/registrations/_sign_up.js',
  'devise/registrations/new_sign_up': './src/sites/studio/pages/devise/registrations/new_sign_up.js',
  'devise/registrations/finish_student_account': './src/sites/studio/pages/devise/registrations/finish_student_account.js',
  'devise/registrations/finish_teacher_account': './src/sites/studio/pages/devise/registrations/finish_teacher_account.js',
  'devise/shared/_oauth_links': './src/sites/studio/pages/devise/shared/_oauth_links.js',
  'devise/registrations/_finish_sign_up': './src/sites/studio/pages/devise/registrations/_finish_sign_up.js',
  'devise/registrations/edit': './src/sites/studio/pages/devise/registrations/edit.js',
  'devise/registrations/account_type': './src/sites/studio/pages/devise/registrations/account_type.js',
  'essential': './src/sites/studio/pages/essential.js',
  'home/_homepage': './src/sites/studio/pages/home/_homepage.js',
  'layouts/_parent_email_banner': './src/sites/studio/pages/layouts/_parent_email_banner.js',
  'layouts/_race_interstitial': './src/sites/studio/pages/layouts/_race_interstitial.js',
  'layouts/_section_creation_celebration_dialog': './src/sites/studio/pages/layouts/_section_creation_celebration_dialog.js',
  'layouts/_school_info_confirmation_dialog': './src/sites/studio/pages/layouts/_school_info_confirmation_dialog.js',
  'layouts/_school_info_interstitial': './src/sites/studio/pages/layouts/_school_info_interstitial.js',
  'layouts/_small_footer': './src/sites/studio/pages/layouts/_small_footer.js',
  'layouts/_terms_interstitial': './src/sites/studio/pages/layouts/_terms_interstitial.js',
  'layouts/_student_information_interstitial': './src/sites/studio/pages/layouts/_student_information_interstitial.js',
  'layouts/_initial_section_creation_interstitial': './src/sites/studio/pages/layouts/_initial_section_creation_interstitial.js',
  'levels/_bubble_choice': './src/sites/studio/pages/levels/_bubble_choice.js',
  'levels/_content': './src/sites/studio/pages/levels/_content.js',
  'levels/_contract_match': './src/sites/studio/pages/levels/_contract_match.js',
  'levels/_curriculum_reference': './src/sites/studio/pages/levels/_curriculum_reference.js',
  'levels/_dialog': './src/sites/studio/pages/levels/_dialog.js',
  'levels/_evaluation_multi': './src/sites/studio/pages/levels/_evaluation_multi.js',
  'levels/_external': './src/sites/studio/pages/levels/_external.js',
  'levels/_external_link': './src/sites/studio/pages/levels/_external_link.js',
  'levels/_free_response': './src/sites/studio/pages/levels/_free_response.js',
  'levels/_level_group': './src/sites/studio/pages/levels/_level_group.js',
  'levels/_match': './src/sites/studio/pages/levels/_match.js',
  'levels/_multi': './src/sites/studio/pages/levels/_multi.js',
  'levels/_pixelation': './src/sites/studio/pages/levels/_pixelation.js',
  'levels/_single_multi': './src/sites/studio/pages/levels/_single_multi.js',
  'levels/_standalone_video': './src/sites/studio/pages/levels/_standalone_video.js',
  'levels/_summary': './src/sites/studio/pages/levels/_summary.js',
  'levels/_teacher_markdown': './src/sites/studio/pages/levels/_teacher_markdown.js',
  'levels/_teacher_panel': './src/sites/studio/pages/levels/_teacher_panel.js',
  'levels/_text_match': './src/sites/studio/pages/levels/_text_match.js',
  'levels/_widget': './src/sites/studio/pages/levels/_widget.js',
  'levels/show': './src/sites/studio/pages/levels/show.js',
  'lti/v1/iframe': './src/sites/studio/pages/lti/v1/iframe.js',
  'lti/v1/account_linking/landing': './src/sites/studio/pages/lti/v1/account_linking/landing.js',
  'lti/v1/dynamic_registration': './src/sites/studio/pages/lti/v1/dynamic_registration.js',
  'lti/v1/sync_course': './src/sites/studio/pages/lti/v1/sync_course.js',
  'lti/v1/upgrade_account': './src/sites/studio/pages/lti/v1/upgrade_account.js',
  'maker/home': './src/sites/studio/pages/maker/home.js',
  'maker/setup': './src/sites/studio/pages/maker/setup.js',
  'projects/featured': './src/sites/studio/pages/projects/featured.js',
  'projects/index': './src/sites/studio/pages/projects/index.js',
  'report_abuse/report_abuse_form': './src/sites/studio/pages/report_abuse/report_abuse_form.js',
  'reference_guides/show': './src/sites/studio/pages/reference_guides/show.js',
  'scripts/show': './src/sites/studio/pages/scripts/show.js',
  'scripts/vocab': './src/sites/studio/pages/scripts/vocab.js',
  'scripts/resources': './src/sites/studio/pages/scripts/resources.js',
  'scripts/code': './src/sites/studio/pages/scripts/code.js',
  'scripts/standards': './src/sites/studio/pages/scripts/standards.js',
  'scripts/lesson_extras': './src/sites/studio/pages/scripts/lesson_extras.js',
  'sections/show': './src/sites/studio/pages/sections/show.js',
  'shared/_school_info': './src/sites/studio/pages/shared/_school_info.js',
  'teacher_dashboard/show': './src/sites/studio/pages/teacher_dashboard/show.js',
  'teacher_dashboard/parent_letter': './src/sites/studio/pages/teacher_dashboard/parent_letter.js',
  'teacher_feedbacks/index': './src/sites/studio/pages/teacher_feedbacks/index.js',
  'weblab_host/network_check': './src/sites/studio/pages/weblab_host/network_check.js',
};

// prettier-ignore
const INTERNAL_ENTRIES = {
  'ai_tutor/tester': './src/sites/studio/pages/ai_tutor/tester.js',
  'blocks/index': './src/sites/studio/pages/blocks/index.js',
  'datasets/show': './src/sites/studio/pages/datasets/show.js',
  'datasets/index': './src/sites/studio/pages/datasets/index.js',
  'datasets/edit_manifest': './src/sites/studio/pages/datasets/edit_manifest.js',
  'levelbuilder': './src/sites/studio/pages/levelbuilder.js',
  'levels/editors/_applab': './src/sites/studio/pages/levels/editors/_applab.js',
  'levels/editors/_craft': './src/sites/studio/pages/levels/editors/_craft.js',
  'levels/editors/_dsl': './src/sites/studio/pages/levels/editors/_dsl.js',
  'levels/editors/fields/_aichat_settings': './src/sites/studio/pages/levels/editors/fields/_aichat_settings.js',
  'levels/editors/fields/_animation': './src/sites/studio/pages/levels/editors/fields/_animation.js',
  'levels/editors/fields/_bubble_choice_sublevel': './src/sites/studio/pages/levels/editors/fields/_bubble_choice_sublevel.js',
  'levels/editors/fields/_blockly': './src/sites/studio/pages/levels/editors/fields/_blockly.js',
  'levels/editors/fields/_callouts': './src/sites/studio/pages/levels/editors/fields/_callouts.js',
  'levels/editors/fields/_droplet': './src/sites/studio/pages/levels/editors/fields/_droplet.js',
  'levels/editors/fields/_grid': './src/sites/studio/pages/levels/editors/fields/_grid.js',
  'levels/editors/fields/_panels': './src/sites/studio/pages/levels/editors/fields/_panels.js',
  'levels/editors/fields/_poetry_fields': './src/sites/studio/pages/levels/editors/fields/_poetry_fields.js',
  'levels/editors/fields/_predict_settings': './src/sites/studio/pages/levels/editors/fields/_predict_settings.js',
  'levels/editors/fields/_preload_assets': './src/sites/studio/pages/levels/editors/fields/_preload_assets.js',
  'levels/editors/fields/_special_level_types': './src/sites/studio/pages/levels/editors/fields/_special_level_types.js',
  'levels/editors/fields/_validation_code': './src/sites/studio/pages/levels/editors/fields/_validation_code.js',
  'levels/editors/fields/_validations': './src/sites/studio/pages/levels/editors/fields/_validations.js',
  'levels/editors/fields/_video': './src/sites/studio/pages/levels/editors/fields/_video.js',
  'levels/editors/_gamelab': './src/sites/studio/pages/levels/editors/_gamelab.js',
  'levels/editors/_navigation_sidebar': './src/sites/studio/pages/levels/editors/_navigation_sidebar.js',
  'levels/editors/_pixelation': './src/sites/studio/pages/levels/editors/_pixelation.js',
  'levels/editors/_studio': './src/sites/studio/pages/levels/editors/_studio.js',
  'libraries/edit': './src/sites/studio/pages/libraries/edit.js',
  'programming_expressions/index': './src/sites/studio/pages/programming_expressions/index.js',
  'sections/new': './src/sites/studio/pages/sections/new.js',
  'sections/edit': './src/sites/studio/pages/sections/edit.js',
  'shared/_check_admin': './src/sites/studio/pages/shared/_check_admin.js',
  'shared_blockly_functions/edit': './src/sites/studio/pages/shared_blockly_functions/edit.js',
  'sprite_management/sprite_upload': './src/sites/studio/pages/sprite_management/sprite_upload.js',
  'sprite_management/sprite_management_directory': './src/sites/studio/pages/sprite_management/sprite_management_directory.js',
  'sprite_management/default_sprites_editor': './src/sites/studio/pages/sprite_management/default_sprites_editor.js',
  'sprite_management/release_default_sprites_to_production': './src/sites/studio/pages/sprite_management/release_default_sprites_to_production.js',
  'sprite_management/select_start_animations': './src/sites/studio/pages/sprite_management/select_start_animations.js',
};

// prettier-ignore
const PROFESSIONAL_DEVELOPMENT_ENTRIES = {
};

// Entries which are included
// by haml partials in the shared/haml/ directory.
const SHARED_ENTRIES = {
  cookieBanner: './src/cookieBanner/cookieBanner.js',
  userHeaderEventLogger: './src/userHeaderEventLogger/userHeaderEventLogger.js',
};

// prettier-ignore
const OTHER_ENTRIES = {
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

  regionalPartnerMiniContact: './src/regionalPartnerMiniContact/regionalPartnerMiniContact',
};

/**
 * Generate webpack entry points for all our apps, or just a subset
 *
 * @param {String[]} appsToBuild - which apps to build, a list of Strings, subset or all of ALL_APPS
 * @returns {Object} - webpack config entry points map ({ appName: [entryPath] ]})
 */
function appsEntriesFor(appsToBuild = ALL_APPS) {
  const assertAppsAreValid = appsToBuild => {
    for (const app of appsToBuild) {
      if (!ALL_APPS.includes(app)) {
        throw new Error(`Invalid app name: ${app}`);
      }
    }
  };

  assertAppsAreValid(appsToBuild);

  return Object.fromEntries(
    appsToBuild.map(app => [
      app,
      './src/sites/studio/pages/levels-' + app + '-main.js',
    ])
  );
}

module.exports = {
  ALL_APPS,
  appsEntriesFor,
  CODE_STUDIO_ENTRIES,
  INTERNAL_ENTRIES,
  PROFESSIONAL_DEVELOPMENT_ENTRIES,
  SHARED_ENTRIES,
  OTHER_ENTRIES,
};

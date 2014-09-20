<?php

/**
 * @file
 *
 * Menu callbacks and functions for configuring and editing webforms.
 */

/**
 * Main configuration form for editing a webform node.
 */
function webform_configure_form($form, &$form_state, $node) {
  $form['#attached']['library'][] = array('webform', 'admin');

  $form['#node'] = $node;

  $form['#submit'] = array(
    'webform_configure_form_submit',
    'webform_configure_form_submit_save',
  );

  $form['nid'] = array(
    '#type' => 'value',
    '#value' => $node->nid,
  );

  /* Start Edit Form */
  $form['submission'] = array(
    '#type' => 'fieldset',
    '#title' => t('Submission settings'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#weight' => -4,
  );

  $form['submission']['confirmation'] = array(
    '#type' => 'text_format',
    '#title' => t('Confirmation message'),
    '#description' => t('Message to be shown upon successful submission. If the redirection location is set to <em>Confirmation page</em> it will be shown on its own page, otherwise this displays as a message.'),
    '#default_value' => $node->webform['confirmation'],
    '#cols' => 40,
    '#rows' => 10,
    '#format' => $node->webform['confirmation_format'],
    '#parents' => array('confirmation'),
  );

  // Redirection settings.
  if (strpos($node->webform['redirect_url'], '<') === 0) {
    $redirect = trim($node->webform['redirect_url'], '<>');
    // Redirection is set to front page.
    if ($redirect == 'front') {
      $redirect = 'url';
      $redirect_url = $node->webform['redirect_url'];
    }
    else {
      $redirect_url = '';
    }
  }
  else {
    $redirect = 'url';
    $redirect_url = $node->webform['redirect_url'];
  }
  $form['submission']['redirection'] = array(
    '#type' => 'item',
    '#title' => t('Redirection location'),
    '#theme' => 'webform_advanced_redirection_form',
    '#description' => t('Choose where to redirect the user upon successful submission.') . ' ' . t('The <em>Custom URL</em> option supports Webform token replacements.') . theme('webform_token_help', array('groups' => array('basic', 'node', 'special', 'submission'))),
  );
  $form['submission']['redirection']['redirect']= array(
    '#type' => 'radios',
    '#default_value' => $redirect,
    '#options' => array(
      'confirmation' => t('Confirmation page'),
      'url' => t('Custom URL'),
      'none' => t('No redirect (reload current page)'),
    ),
  );
  $form['submission']['redirection']['redirect_url'] = array(
    '#type' => 'textfield',
    '#title' => t('Redirect URL'),
    '#description' => t('URL to redirect the user to upon successful submission.'),
    '#default_value' => $redirect_url,
    '#maxlength' => 255,
  );

  // Submission limit settings for all submissions.
  $form['submission']['total_submit_limit'] = array(
    '#type' => 'item',
    '#title' => t('Total submissions limit'),
    '#theme' => 'webform_advanced_total_submit_limit_form',
    '#description' => t('Limit the total number of allowed submissions.'),
  );
  $form['submission']['total_submit_limit']['enforce_total_limit'] = array(
    '#type' => 'radios',
    '#options' => array('no' => t('Unlimited'), 'yes' => 'Limit to !count total submission(s) !timespan'),
    '#default_value' => $node->webform['total_submit_limit'] == -1 ? 'no' : 'yes',
    '#parents' => array('enforce_total_limit'),
  );
  $form['submission']['total_submit_limit']['total_submit_limit'] = array(
    '#type' => 'textfield',
    '#maxlength' => 8,
    '#size' => 8,
    '#default_value' => $node->webform['total_submit_limit'] != -1 ? $node->webform['total_submit_limit'] : '',
    '#parents' => array('total_submit_limit'),
  );
  $form['submission']['total_submit_limit']['total_submit_interval'] = array(
    '#type' => 'select',
    '#options' => array(
      '-1' => t('ever'),
      '3600' => t('every hour'),
      '86400' => t('every day'),
      '604800' => t('every week'),
    ),
    '#default_value' => $node->webform['total_submit_interval'],
    '#parents' => array('total_submit_interval'),
  );

  // Submission limit per user settings.
  $form['submission']['submit_limit'] = array(
    '#type' => 'item',
    '#title' => t('Per user submission limit'),
    '#theme' => 'webform_advanced_submit_limit_form',
    '#description' => t('Limit the number of submissions <em>per user</em>. A user is identified by their user login if logged-in, or by their IP Address and Cookie if anonymous. Use of cookies may be modified in the global <a href="!url">Webform settings</a>.', array('!url' => url('admin/config/content/webform'))),
  );
  $form['submission']['submit_limit']['enforce_limit'] = array(
    '#type' => 'radios',
    '#options' => array('no' => t('Unlimited'), 'yes' => 'Limit each user to !count submission(s) !timespan'),
    '#default_value' => $node->webform['submit_limit'] == -1 ? 'no' : 'yes',
    '#parents' => array('enforce_limit'),
  );
  $form['submission']['submit_limit']['submit_limit'] = array(
    '#type' => 'textfield',
    '#maxlength' => 2,
    '#size' => 2,
    '#default_value' => $node->webform['submit_limit'] != -1 ? $node->webform['submit_limit'] : '',
    '#parents' => array('submit_limit'),
  );
  $form['submission']['submit_limit']['submit_interval'] = array(
    '#type' => 'select',
    '#options' => array(
      '-1' => t('ever'),
      '3600' => t('every hour'),
      '86400' => t('every day'),
      '604800' => t('every week'),
    ),
    '#default_value' => $node->webform['submit_interval'],
    '#parents' => array('submit_interval'),
  );

  $form['submission']['status'] = array(
    '#type' => 'radios',
    '#title' => t('Status of this form'),
    '#default_value' => $node->webform['status'] == 0 ? 0 : 1,
    '#description' => t('Closing a form prevents any further submissions by any users.'),
    '#parents' => array('status'),
    '#options' => array(1 => t('Open'), 0 => t('Closed')),
  );
  /* End Edit Form */

  /* Start per-role submission control */
  $form['role_control'] = array(
    '#type' => 'fieldset',
    '#title' => t('Submission access'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#weight' => -3,
    '#description' => t('These permissions affect which roles can submit this webform. It does not prevent access to the webform page. If needing to prevent access to the webform page entirely, use a content access module such as <a href="http://drupal.org/project/taxonomy_access">Taxonomy Access</a> or <a href="http://drupal.org/project/node_privacy_byrole">Node Privacy by Role</a>.'),
    '#access' => variable_get('webform_submission_access_control', 1),
  );
  $user_roles = user_roles();
  foreach ($user_roles as $rid => $rname) {
    if ($rid == DRUPAL_ANONYMOUS_RID || $rid == DRUPAL_AUTHENTICATED_RID) {
      continue;
    }
    $user_roles[$rid] = webform_tt("user:rid:$rid:name", $rname);
  }
  $form['role_control']['roles'] = array(
    '#default_value' => $node->webform['roles'],
    '#options' => $user_roles,
    '#type' => 'checkboxes',
    '#title' => t('Roles that can submit this webform'),
    '#description' => t('The %authenticated role applies to any user signed into the site, regardless of other assigned roles.', array('%authenticated' => $user_roles[2])),
  );
  /* End per-role submission control */

  /* Start advanced settings form */
  $form['advanced'] = array(
    '#type' => 'fieldset',
    '#title' => t('Advanced settings'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#weight' => -1,
  );
  $form['advanced']['block'] = array(
    '#type' => 'checkbox',
    '#title' => t('Available as block'),
    '#default_value' => $node->webform['block'],
    '#description' => t('If enabled this webform will be available as a block.'),
    '#access' => user_access('administer blocks') || user_access('administer site configuration') || user_access('use panels dashboard'),
  );
  $form['advanced']['teaser'] = array(
    '#type' => 'checkbox',
    '#title' => t('Show complete form in teaser'),
    '#default_value' => $node->webform['teaser'],
    '#description' => t('Display the entire form in the teaser display of this node.'),
  );
  $form['advanced']['allow_draft'] = array(
    '#type' => 'checkbox',
    '#title' => t('Show "Save draft" button'),
    '#default_value' => $node->webform['allow_draft'],
    '#description' => t('Allow your users to save and finish the form later. This option is available only for authenticated users.'),
  );
  $form['advanced']['auto_save'] = array(
    '#type' => 'checkbox',
    '#title' => t('Automatically save as draft between pages'),
    '#default_value' => $node->webform['auto_save'],
    '#description' => t('Automatically save partial submissions when users click the "Next" or "Previous" buttons in a multipage form.'),
  );
  $form['advanced']['submit_notice'] = array(
    '#type' => 'checkbox',
    '#title' => t('Show the notification about previous submissions.'),
    '#default_value' => $node->webform['submit_notice'],
    '#description' => t('Show the previous submissions notification that appears when users have previously submitted this form.'),
  );
  $form['advanced']['submit_text'] = array(
    '#type' => 'textfield',
    '#title' => t('Submit button text'),
    '#default_value' => $node->webform['submit_text'],
    '#description' => t('By default the submit button on this form will have the label <em>Submit</em>. Enter a new title here to override the default.'),
  );
  /* End Advanced Settings Form */

  $form['actions'] = array(
    '#type' => 'actions',
    '#weight' => 300,
  );

  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );

  return $form;
}

/**
 * Validate handler for webform_configure_form().
 */
function webform_configure_form_validate($form, &$form_state) {
  // Ensure the entered e-mail addresses are valid.
  if (!empty($form_state['values']['email'])) {
    $emails = explode(',', $form_state['values']['email']);
    foreach ($emails as $email) {
      if (!valid_email_address(trim($email))) {
        form_error($form['submission']['redirect_url'], t('The entered email address %address is not a valid address.', array('%address' => $email)));
        break;
      }
    }
  }

  // Ensure the entered redirect URL is valid.
  if ($form_state['values']['redirect'] == 'url') {
    $redirect_url = trim($form_state['values']['redirect_url']);
    if (empty($redirect_url)) {
      form_error($form['submission']['redirection']['redirect_url'], t('A valid URL is required for custom redirection.'));
    }
    elseif (strpos($redirect_url, 'http') === 0 && !valid_url($redirect_url, TRUE)) {
      form_error($form['submission']['redirection']['redirect_url'], t('The entered URL is not a valid address.'));
    }
    else {
      form_set_value($form['submission']['redirection']['redirect_url'], $redirect_url, $form_state);
    }
  }
  elseif ($form_state['values']['redirect'] == 'confirmation') {
    form_set_value($form['submission']['redirection']['redirect_url'], '<confirmation>', $form_state);
  }
  else {
    form_set_value($form['submission']['redirection']['redirect_url'], '<none>', $form_state);
  }
}

/**
 * Submit handler for webform_configure_form().
 */
function webform_configure_form_submit($form, &$form_state) {
  // Edit the node by reference just to shorten it up.
  $node = &$form['#node'];

  // Save the confirmation.
  $node->webform['confirmation'] = $form_state['values']['confirmation']['value'];
  $node->webform['confirmation_format'] = $form_state['values']['confirmation']['format'];

  // Save the redirect URL
  $node->webform['redirect_url'] = $form_state['values']['redirect_url'];

  // Overall form status.
  $node->webform['status'] = $form_state['values']['status'];

  // Save roles.
  $node->webform['roles'] = array_keys(array_filter($form_state['values']['roles']));

  // Set the block option.
  $node->webform['block'] = $form_state['values']['block'];

  // Set the Show complete form in teaser setting.
  $node->webform['teaser'] = $form_state['values']['teaser'];

  // Set the draft option.
  $node->webform['allow_draft'] = $form_state['values']['allow_draft'];

  // Set the auto-save draft option.
  $node->webform['auto_save'] = $form_state['values']['auto_save'];

  // Set the submit limit to -1 if set to unlimited.
  if ($form_state['values']['enforce_limit'] == 'no') {
    $node->webform['submit_limit'] = -1;
    $node->webform['submit_interval'] = -1;
  }
  else {
    $node->webform['submit_limit'] = $form_state['values']['submit_limit'];
    $node->webform['submit_interval'] = $form_state['values']['submit_interval'];
  }

  // Set the total submit limit to -1 if set to unlimited.
  if ($form_state['values']['enforce_total_limit'] == 'no') {
    $node->webform['total_submit_limit'] = -1;
    $node->webform['total_submit_interval'] = -1;
  }
  else {
    $node->webform['total_submit_limit'] = $form_state['values']['total_submit_limit'];
    $node->webform['total_submit_interval'] = $form_state['values']['total_submit_interval'];
  }

  // Set submit notice.
  $node->webform['submit_notice'] = $form_state['values']['submit_notice'];

  // Set submit button text.
  $node->webform['submit_text'] = $form_state['values']['submit_text'];
}

/**
 * Submit handler for webform_configure_form() that saves the node.
 *
 * This is separate from webform_configure_form_submit() to allow other modules
 * to add properties if needed into the $form['#node'] object before save.
 */
function webform_configure_form_submit_save($form, &$form_state) {
  node_save($form['#node']);
  drupal_set_message(t('The form settings have been updated.'));
}

/**
 * Theme the redirection setting on the webform node form.
 */
function theme_webform_advanced_redirection_form($variables) {
  $form = $variables['form'];
  // Add special class for setting the active radio button.
  $form['redirect_url']['#attributes']['class'] = array('webform-set-active');

  // Remove title and description for Redirect URL field.
  $form['redirect_url']['#title'] = NULL;
  $form['redirect_url']['#description'] = NULL;

  $form['redirect']['confirmation']['#theme_wrappers'] = array('webform_inline_radio');
  $form['redirect']['url']['#theme_wrappers'] = array('webform_inline_radio');
  $form['redirect']['none']['#theme_wrappers'] = array('webform_inline_radio');
  $form['redirect']['url']['#inline_element'] = $form['redirect']['url']['#title'] . ': ' . drupal_render($form['redirect_url']);
  $form['redirect']['url']['#title'] = NULL;

  return drupal_render_children($form);
}

/**
 * Theme the submit limit fieldset on the webform node form.
 */
function theme_webform_advanced_submit_limit_form($variables) {
  $form = $variables['form'];
  $form['submit_limit']['#attributes']['class'] = array('webform-set-active');
  $form['submit_interval']['#attributes']['class'] = array('webform-set-active');
  // Remove div wrappers around limit options.
  $form['submit_limit']['#theme_wrappers'] = array();
  $form['submit_interval']['#theme_wrappers'] = array();
  $replacements = array(
    '!count' => drupal_render($form['submit_limit']),
    '!timespan' => drupal_render($form['submit_interval']),
  );

  $form['enforce_limit']['no']['#theme_wrappers'] = array('webform_inline_radio');
  $form['enforce_limit']['yes']['#title'] = NULL;
  $form['enforce_limit']['yes']['#inline_element'] = t('Limit each user to !count submission(s) !timespan', $replacements);
  $form['enforce_limit']['yes']['#theme_wrappers'] = array('webform_inline_radio');

  return drupal_render_children($form);
}

/**
 * Theme the total submit limit fieldset on the webform node form.
 */
function theme_webform_advanced_total_submit_limit_form($variables) {
  $form = $variables['form'];
  $form['total_submit_limit']['#attributes']['class'] = array('webform-set-active');
  $form['total_submit_interval']['#attributes']['class'] = array('webform-set-active');
  // Remove div wrappers around limit options.
  $form['total_submit_limit']['#theme_wrappers'] = array();
  $form['total_submit_interval']['#theme_wrappers'] = array();
  $replacements = array(
    '!count' => drupal_render($form['total_submit_limit']),
    '!timespan' => drupal_render($form['total_submit_interval']),
  );

  $form['enforce_total_limit']['no']['#theme_wrappers'] = array('webform_inline_radio');
  $form['enforce_total_limit']['yes']['#title'] = NULL;
  $form['enforce_total_limit']['yes']['#inline_element'] = t('Limit to !count total submission(s) !timespan', $replacements);
  $form['enforce_total_limit']['yes']['#theme_wrappers'] = array('webform_inline_radio');

  return drupal_render_children($form);
}

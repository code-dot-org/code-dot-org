<?php

/**
 * @file
 * Administration pages provided by Webform module.
 */

/**
 * Menu callback for admin/config/content/webform.
 */
function webform_admin_settings() {
  module_load_include('inc', 'webform', 'includes/webform.export');

  $node_types = node_type_get_names();
  $form['node_types'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Webform-enabled content types'),
    '#description' => t('Webform allows you to enable the webform components for any content type.  Choose the types on which you would like to associate webform components.'),
    '#options' => $node_types,
    '#default_value' => webform_variable_get('webform_node_types'),
  );

  $form['components'] = array(
    '#type' => 'fieldset',
    '#title' => t('Available components'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#description' => t('These are the available field types for your installation of Webform. You may disable any of these components by unchecking its corresponding box. Only checked components will be available in existing or new webforms.'),
  );

  // Add each component to the form:
  $form['components'] = array('#tree' => TRUE);
  $component_types = webform_components(TRUE);
  foreach ($component_types as $key => $component) {
    $form['components'][$key] = array(
      '#title' => $component['label'],
      '#description' => $component['description'],
      '#type' => 'checkbox',
      '#return_value' => 1,
      '#default_value' => $component['enabled'],
    );
  }

  $form['email'] = array(
    '#type' => 'fieldset',
    '#title' => t('Default e-mail values'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );

  $form['email']['webform_default_from_address']  = array(
    '#type' => 'textfield',
    '#title' => t('From address'),
    '#default_value' => variable_get('webform_default_from_address', variable_get('site_mail', ini_get('sendmail_from'))),
    '#description' => t('The default sender address for emailed webform results; often the e-mail address of the maintainer of your forms.'),
  );

  $form['email']['webform_default_from_name']  = array(
    '#type' => 'textfield',
    '#title' => t('From name'),
    '#default_value' => variable_get('webform_default_from_name', variable_get('site_name', '')),
    '#description' => t('The default sender name which is used along with the default from address.'),
  );

  $form['email']['webform_default_subject']  = array(
    '#type' => 'textfield',
    '#title' => t('Default subject'),
    '#default_value' => variable_get('webform_default_subject', t('Form submission from: %title')),
    '#description' => t('The default subject line of any e-mailed results.'),
  );

  $form['email']['webform_default_format']  = array(
    '#type' => 'radios',
    '#title' => t('Format'),
    '#options' => array(
      0 => t('Plain text'),
      1 => t('HTML'),
    ),
    '#default_value' => variable_get('webform_default_format', 0),
    '#description' => t('The default format for new e-mail settings. Webform e-mail options take precedence over the settings for system-wide e-mails configured in MIME mail.'),
    '#access' => webform_email_html_capable(),
  );

  $form['email']['webform_format_override']  = array(
    '#type' => 'radios',
    '#title' => t('Format override'),
    '#options' => array(
      0 => t('Per-webform configuration of e-mail format'),
      1 => t('Send all e-mails in the default format'),
    ),
    '#default_value' => variable_get('webform_format_override', 0),
    '#description' => t('Force all webform e-mails to be sent in the default format.'),
    '#access' => webform_email_html_capable(),
  );

  $form['advanced'] = array(
    '#type' => 'fieldset',
    '#title' => t('Advanced options'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );

  $form['advanced']['webform_use_cookies']  = array(
    '#type' => 'checkbox',
    '#checked_value' => 1,
    '#title' => t('Allow cookies for tracking submissions'),
    '#default_value' => variable_get('webform_use_cookies', 0),
    '#description' => t('<a href="http://www.wikipedia.org/wiki/HTTP_cookie">Cookies</a> can be used to help prevent the same user from repeatedly submitting a webform. This feature is not needed for limiting submissions per user, though it can increase accuracy in some situations. Besides cookies, Webform also uses IP addresses and site usernames to prevent repeated submissions.'),
  );

  $form['advanced']['webform_search_index']  = array(
    '#type' => 'checkbox',
    '#checked_value' => 1,
    '#title' => t('Include webform forms in search index'),
    '#default_value' => variable_get('webform_search_index', 1),
    '#description' => t('When selected, all Webform nodes will have their form components indexed by the search engine.'),
    '#access' => module_exists('search'),
  );

  $form['advanced']['webform_email_address_format'] = array(
    '#type' => 'radios',
    '#title' => t('E-mail address format'),
    '#options' => array(
      'long' => t('Long format: "Example Name" &lt;name@example.com&gt;'),
      'short' => t('Short format: name@example.com'),
    ),
    '#default_value' => variable_get('webform_email_address_format', 'long'),
    '#description' => t('Most servers support the "long" format which will allow for more friendly From addresses in e-mails sent. However many Windows-based servers are unable to send in the long format. Change this option if experiencing problems sending e-mails with Webform.'),
  );

  $form['advanced']['webform_export_format'] = array(
    '#type' => 'radios',
    '#title' => t('Default export format'),
    '#options' => webform_export_list(),
    '#default_value' => variable_get('webform_export_format', 'delimited'),
  );

  $form['advanced']['webform_csv_delimiter']  = array(
    '#type' => 'select',
    '#title' => t('Default export delimiter'),
    '#description' => t('This is the delimiter used in the CSV/TSV file when downloading Webform results. Using tabs in the export is the most reliable method for preserving non-latin characters. You may want to change this to another character depending on the program with which you anticipate importing results.'),
    '#default_value' => variable_get('webform_csv_delimiter', '\t'),
    '#options' => array(
      ','  => t('Comma (,)'),
      '\t' => t('Tab (\t)'),
      ';'  => t('Semicolon (;)'),
      ':'  => t('Colon (:)'),
      '|'  => t('Pipe (|)'),
      '.'  => t('Period (.)'),
      ' '  => t('Space ( )'),
    ),
  );

  $form['advanced']['webform_submission_access_control']  = array(
    '#type' => 'radios',
    '#title' => t('Submission access control'),
    '#options' => array(
      '1' => t('Select the user roles that may submit each individual webform'),
      '0' => t('Disable Webform submission access control'),
    ),
    '#default_value' => variable_get('webform_submission_access_control', 1),
    '#description' => t('By default, the configuration form for each webform allows the administrator to choose which roles may submit the form. You may want to allow users to always submit the form if you are using a separate node access module to control access to webform nodes themselves.'),
  );

  $form = system_settings_form($form);
  $form['#theme'] = 'webform_admin_settings';
  array_unshift($form['#submit'], 'webform_admin_settings_submit');

  return $form;
}

/**
 * Submit handler for the webform_admin_settings() form.
 */
function webform_admin_settings_submit($form, &$form_state) {
  $disabled_components = array();
  foreach ($form_state['values']['components'] as $name => $enabled) {
    if (!$enabled) {
      $disabled_components[] = $name;
    }
  }
  // Update $form_state and let system_settings_form_submit() handle saving.
  $form_state['values']['webform_disabled_components'] = $disabled_components;
  unset($form_state['values']['components']);

  // Change the name of the node type variable and clean it up.
  $form_state['values']['webform_node_types'] = array_keys(array_filter($form_state['values']['node_types']));
  unset($form_state['values']['node_types']);
}

/**
 * Theme the output of the webform_admin_settings() form.
 */
function theme_webform_admin_settings($variables) {
  $form = $variables['form'];

  // Format the components into a table.
  foreach (element_children($form['components']) as $key) {
    $row = array();
    $row[] = $form['components'][$key]['#title'];
    $row[] = $form['components'][$key]['#description'];
    $form['components'][$key]['#title'] = NULL;
    $form['components'][$key]['#description'] = NULL;
    $row[] = array('data' => drupal_render($form['components'][$key]), 'align' => 'center');
    $rows[] = $row;
  }
  $header = array(t('Name'), t('Description'), array('data' => t('Enabled'), 'class' => array('checkbox')));

  // Create the table inside the form.
  $form['components']['table'] = array(
    '#theme' => 'table',
    '#header' => $header,
    '#rows' => $rows,
  );

  return drupal_render_children($form);
}

/**
 * Menu callback for admin/content/webform. Displays all webforms on the site.
 */
function webform_admin_content() {
  $webform_types = webform_variable_get('webform_node_types');

  $nodes = array();
  if ($webform_types) {
    $nodes = db_select('node', 'n')
      ->fields('n')
      ->condition('n.type', $webform_types, 'IN')
      ->execute()
      ->fetchAllAssoc('nid');
  }

  return theme('webform_admin_content', array('nodes' => $nodes));
}

/**
 * Create a comma-separate list of content types that are webform enabled.
 */
function webform_admin_type_list() {
  $webform_types = webform_variable_get('webform_node_types');
  $webform_type_list = '';
  $webform_type_count = count($webform_types);
  foreach ($webform_types as $n => $type) {
    $webform_type_list .= l(node_type_get_name($type), 'node/add/' . $type);
    if ($n + 1 < $webform_type_count) {
      $webform_type_list .= $webform_type_count == 2 ? ' ' : ', ';
    }
    if ($n + 2 == $webform_type_count) {
      $webform_type_list .= t('or') . ' ';
    }
  }

  return $webform_type_list;
}

/**
 * Generate a list of all webforms avaliable on this site.
 */
function theme_webform_admin_content($variables) {
  $nodes = $variables['nodes'];
  $header = array(
    t('Title'),
    array('data' => t('View'), 'colspan' => '4'),
    array('data' => t('Operations'), 'colspan' => '2')
  );

  $rows = array();
  foreach ($nodes as $node) {
    $rows[] = array(
      l($node->title, 'node/' . $node->nid),
      l(t('Submissions'), 'node/' . $node->nid . '/webform-results'),
      l(t('Analysis'), 'node/' . $node->nid . '/webform-results/analysis'),
      l(t('Table'), 'node/' . $node->nid . '/webform-results/table'),
      l(t('Download'), 'node/' . $node->nid . '/webform-results/download'),
      node_access('update', $node) ? l(t('Edit'), 'node/' . $node->nid . '/edit') : '',
      user_access('delete all webform submissions') ? l(t('Clear'), 'node/' . $node->nid . '/webform-results/clear') : '',
    );
  }

  if (empty($rows)) {
    $webform_types = webform_variable_get('webform_node_types');
    if (empty($webform_types)) {
      $message = t('Webform is currently not enabled on any content types.') . ' ' . t('Visit the <a href="!url">Webform settings</a> page and enable Webform on at least one content type.', array('!url' => url('admin/config/content/webform')));
    }
    else {
      $webform_type_list = webform_admin_type_list();
      $message = t('There are currently no webforms on your site. Create a !types piece of content.', array('!types' => $webform_type_list));
    }

    $rows[] = array(
      array('data' => $message, 'colspan' => 7),
    );
  }

  return theme('table', array('header' => $header, 'rows' => $rows));
}

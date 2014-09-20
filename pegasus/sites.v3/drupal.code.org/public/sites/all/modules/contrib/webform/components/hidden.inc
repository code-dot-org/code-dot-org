<?php

/**
 * @file
 * Webform module hidden component.
 */

/**
 * Implements _webform_defaults_component().
 */
function _webform_defaults_hidden() {
  return array(
    'name' => '',
    'form_key' => NULL,
    'pid' => 0,
    'weight' => 0,
    'value' => '',
    'extra' => array(
      'private' => FALSE,
      'hidden_type' => 'value',
    ),
  );
}

/**
 * Implements _webform_theme_component().
 */
function _webform_theme_hidden() {
  return array(
    'webform_display_hidden' => array(
      'render element' => 'element',
      'file' => 'components/hidden.inc',
    ),
  );
}

/**
 * Implements _webform_edit_component().
 */
function _webform_edit_hidden($component) {
  $form = array();
  $form['value'] = array(
    '#type' => 'textarea',
    '#title' => t('Default value'),
    '#default_value' => $component['value'],
    '#description' => t('The default value of the field.') . theme('webform_token_help'),
    '#cols' => 60,
    '#rows' => 5,
    '#weight' => 0,
  );

  $form['display']['hidden_type'] = array(
    '#type' => 'radios',
    '#options' => array(
      'value' => t('Secure value (allows use of all tokens)'),
      'hidden' => t('Hidden element (less secure, changeable via JavaScript)'),
    ),
    '#title' => t('Hidden type'),
    '#description' => t('Both types of hidden fields are not shown to end-users. Using a <em>Secure value</em> allows the use of <em>all tokens</em>, even for anonymous users.'),
    '#default_value' => $component['extra']['hidden_type'],
    '#parents' => array('extra', 'hidden_type'),
  );

  return $form;
}

/**
 * Implements _webform_render_component().
 */
function _webform_render_hidden($component, $value = NULL, $filter = TRUE) {
  $node = isset($component['nid']) ? node_load($component['nid']) : NULL;

  // Set filtering options for "value" types, which are not displayed to the
  // end user so they do not need to be sanitized.
  $strict = $component['extra']['hidden_type'] != 'value';
  $allow_anonymous = $component['extra']['hidden_type'] == 'value';
  $default_value = $filter ? _webform_filter_values($component['value'], $node, NULL, NULL, $strict, $allow_anonymous) : $component['value'];
  if (isset($value[0])) {
    $default_value = $value[0];
  }

  $element = array(
    '#title' => $filter ? _webform_filter_xss($component['name']) : $component['name'],
    '#weight' => $component['weight'],
    '#translatable' => array('title'),
  );

  if ($component['extra']['hidden_type'] == 'value') {
    $element['#type'] = 'value';
    $element['#value'] = $default_value;
  }
  else {
    $element['#type'] = 'hidden';
    $element['#default_value'] = $default_value;
  }

  return $element;
}

/**
 * Implements _webform_display_component().
 */
function _webform_display_hidden($component, $value, $format = 'html') {
  $element = array(
    '#title' => $component['name'],
    '#markup' => isset($value[0]) ? $value[0] : NULL,
    '#weight' => $component['weight'],
    '#format' => $format,
    '#theme' => 'webform_display_hidden',
    '#theme_wrappers' => $format == 'text' ? array('webform_element_text') : array('webform_element'),
    '#translatable' => array('title'),
  );

  return $element;
}

function theme_webform_display_hidden($variables) {
  $element = $variables['element'];

  return $element['#format'] == 'html' ? check_plain($element['#markup']) : $element['#markup'];
}

/**
 * Implements _webform_analysis_component().
 */
function _webform_analysis_hidden($component, $sids = array()) {
  $query = db_select('webform_submitted_data', 'wsd', array('fetch' => PDO::FETCH_ASSOC))
    ->fields('wsd', array('no', 'data'))
    ->condition('nid', $component['nid'])
    ->condition('cid', $component['cid']);

  if (count($sids)) {
    $query->condition('sid', $sids, 'IN');
  }

  $nonblanks = 0;
  $submissions = 0;
  $wordcount = 0;

  $result = $query->execute();
  foreach ($result as $data) {
    if (strlen(trim($data['data'])) > 0) {
      $nonblanks++;
      $wordcount += str_word_count(trim($data['data']));
    }
    $submissions++;
  }

  $rows[0] = array( t('Empty'), ($submissions - $nonblanks));
  $rows[1] = array( t('Non-empty'), $nonblanks);
  $rows[2] = array( t('Average submission length in words (ex blanks)'),
                    ($nonblanks !=0 ? number_format($wordcount/$nonblanks, 2) : '0'));
  return $rows;
}

/**
 * Implements _webform_csv_data_component().
 */
function _webform_table_hidden($component, $value) {
  return check_plain(empty($value[0]) ? '' : $value[0]);
}

/**
 * Implements _webform_csv_data_component().
 */
function _webform_csv_headers_hidden($component, $export_options) {
  $header = array();
  $header[0] = '';
  $header[1] = '';
  $header[2] = $component['name'];
  return $header;
}

/**
 * Implements _webform_csv_data_component().
 */
function _webform_csv_data_hidden($component, $export_options, $value) {
  return isset($value[0]) ? $value[0] : '';
}

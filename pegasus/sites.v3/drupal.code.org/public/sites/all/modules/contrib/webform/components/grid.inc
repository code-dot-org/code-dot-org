<?php

/**
 * @file
 * Webform module grid component.
 */

// Grid depends on functions provided by select.
webform_component_include('select');

/**
 * Implements _webform_defaults_component().
 */
function _webform_defaults_grid() {
  return array(
    'name' => '',
    'form_key' => NULL,
    'mandatory' => 0,
    'pid' => 0,
    'weight' => 0,
    'extra' => array(
      'options' => '',
      'questions' => '',
      'optrand' => 0,
      'qrand' => 0,
      'title_display' => 0,
      'custom_option_keys' => 0,
      'custom_question_keys' => 0,
      'description' => '',
      'private' => FALSE,
    ),
  );
}


/**
 * Implements _webform_theme_component().
 */
function _webform_theme_grid() {
  return array(
    'webform_grid' => array(
      'render element' => 'element',
      'file' => 'components/grid.inc',
    ),
    'webform_display_grid' => array(
      'render element' => 'element',
      'file' => 'components/grid.inc',
    ),
  );
}

/**
 * Implements _webform_edit_component().
 */
function _webform_edit_grid($component) {
  $form = array();

  if (module_exists('options_element')) {
    $form['options'] = array(
      '#type' => 'fieldset',
      '#title' => t('Options'),
      '#collapsible' => TRUE,
      '#description' => t('Options to select across the top. Usually these are ratings such as "poor" through "excellent" or "strongly disagree" through "strongly agree".'),
      '#attributes' => array('class' => array('webform-options-element')),
      '#element_validate' => array('_webform_edit_validate_options'),
    );
    $form['options']['options'] = array(
      '#type' => 'options',
      '#options' => _webform_select_options_from_text($component['extra']['options'], TRUE),
      '#optgroups' => FALSE,
      '#default_value' => FALSE,
      '#optgroups' => FALSE,
      '#key_type' => 'mixed',
      '#key_type_toggle' => t('Customize option keys (Advanced)'),
      '#key_type_toggled' => $component['extra']['custom_option_keys'],
    );

    $form['questions'] = array(
      '#type' => 'fieldset',
      '#title' => t('Questions'),
      '#collapsible' => TRUE,
      '#description' => t('Questions list down the side of the grid.'),
      '#attributes' => array('class' => array('webform-options-element')),
      '#element_validate' => array('_webform_edit_validate_options'),
    );
    $form['questions']['options'] = array(
      '#type' => 'options',
      '#options' => _webform_select_options_from_text($component['extra']['questions'], TRUE),
      '#optgroups' => FALSE,
      '#default_value' => FALSE,
      '#optgroups' => FALSE,
      '#key_type' => 'mixed',
      '#key_type_toggle' => t('Customize question keys (Advanced)'),
      '#key_type_toggled' => $component['extra']['custom_question_keys'],
    );
  }
  else {
    $form['extra']['options'] = array(
      '#type' => 'textarea',
      '#title' => t('Options'),
      '#default_value' => $component['extra']['options'],
      '#description' => t('Options to select across the top. One option per line. <strong>Key-value pairs MUST be specified as "safe_key|Some readable option"</strong>. Use of only alphanumeric characters and underscores is recommended in keys.') . theme('webform_token_help'),
      '#cols' => 60,
      '#rows' => 5,
      '#weight' => -3,
      '#required' => TRUE,
      '#wysiwyg' => FALSE,
      '#element_validate' => array('_webform_edit_validate_select'),
    );
    $form['extra']['questions'] = array(
      '#type' => 'textarea',
      '#title' => t('Questions'),
      '#default_value' => $component['extra']['questions'],
      '#description' => t('Questions list down the side of the grid. One question per line. <strong>Key-value pairs MUST be specified as "safe_key|Some readable option"</strong>. Use of only alphanumeric characters and underscores is recommended in keys.') . theme('webform_token_help'),
      '#cols' => 60,
      '#rows' => 5,
      '#weight' => -2,
      '#required' => TRUE,
      '#wysiwyg' => FALSE,
      '#element_validate' => array('_webform_edit_validate_select'),
    );
  }

  $form['display']['optrand'] = array(
    '#type' => 'checkbox',
    '#title' => t('Randomize Options'),
    '#default_value' => $component['extra']['optrand'],
    '#description' => t('Randomizes the order of options on the top when they are displayed in the form.'),
    '#parents' => array('extra', 'optrand')
  );
  $form['display']['qrand'] = array(
    '#type' => 'checkbox',
    '#title' => t('Randomize Questions'),
    '#default_value' => $component['extra']['qrand'],
    '#description' => t('Randomize the order of the questions on the side when they are displayed in the form.'),
    '#parents' => array('extra', 'qrand')
  );
  return $form;
}

/**
 * Implements _webform_render_component().
 */
function _webform_render_grid($component, $value = NULL, $filter = TRUE) {
  $node = isset($component['nid']) ? node_load($component['nid']) : NULL;

  $element = array(
    '#type' => 'webform_grid',
    '#title' => $filter ? _webform_filter_xss($component['name']) : $component['name'],
    '#title_display' => $component['extra']['title_display'] ? $component['extra']['title_display'] : 'before',
    '#required' => $component['mandatory'],
    '#weight' => $component['weight'],
    '#description' => $filter ? _webform_filter_descriptions($component['extra']['description'], $node) : $component['extra']['description'],
    '#grid_questions' => _webform_select_options_from_text($component['extra']['questions'], TRUE),
    '#grid_options' => _webform_select_options_from_text($component['extra']['options'], TRUE),
    '#optrand' => $component['extra']['optrand'],
    '#qrand' => $component['extra']['qrand'],
    '#theme' => 'webform_grid',
    '#theme_wrappers' => array('webform_element'),
    '#process' => array('webform_expand_grid'),
    '#translatable' => array('title', 'description', 'grid_options', 'grid_questions'),
  );

  if ($value) {
    $element['#default_value'] = $value;
  }

  return $element;
}

/**
 * A Form API #process function for Webform grid fields.
 */
function webform_expand_grid($element) {
  $options = $element['#grid_options'];
  $questions = $element['#grid_questions'];

  if (!empty($element['#optrand'])) {
    _webform_shuffle_options($options);
  }

  if (!empty($element['#qrand'])) {
    _webform_shuffle_options($questions);
  }

  foreach ($questions as $key => $question) {
    if ($question != '') {
      $element[$key] = array(
        '#title' => $question,
        '#required' => $element['#required'],
        '#options' => $options,
        '#type' => 'radios',
        '#process' => array('form_process_radios', 'webform_expand_select_ids'),

        // Webform handles validation manually.
        '#validated' => TRUE,
        '#webform_validated' => FALSE,
        '#translatable' => array('title'),
      );
    }
  }

  $value = isset($element['#default_value']) ? $element['#default_value'] : array();
  foreach (element_children($element) as $key) {
    if (isset($value[$key])) {
      $element[$key]['#default_value'] = ($value[$key] !== '') ? $value[$key] : NULL;
    }
    else {
      $element[$key]['#default_value'] = NULL;
    }
  }

  return $element;
}

/**
 * Implements _webform_display_component().
 */
function _webform_display_grid($component, $value, $format = 'html') {
  $questions = _webform_select_options_from_text($component['extra']['questions'], TRUE);
  $options = _webform_select_options_from_text($component['extra']['options'], TRUE);

  $element = array(
    '#title' => $component['name'],
    '#weight' => $component['weight'],
    '#format' => $format,
    '#grid_questions' => $questions,
    '#grid_options' => $options,
    '#theme' => 'webform_display_grid',
    '#theme_wrappers' => $format == 'html' ? array('webform_element') : array('webform_element_text'),
    '#sorted' => TRUE,
    '#translatable' => array('#title', '#grid_questions', '#grid_options'),
  );

  foreach ($questions as $key => $question) {
    if ($question !== '') {
      $element[$key] = array(
        '#title' => $question,
        '#value' => isset($value[$key]) ? $value[$key] : NULL,
        '#translatable' => array('#title', '#value'),
      );
    }
  }

  return $element;
}

/**
 * Format the text output for this component.
 */
function theme_webform_display_grid($variables) {
  $element = $variables['element'];

  $component = $element['#webform_component'];
  $format = $element['#format'];

  if ($format == 'html') {
    $rows = array();
    $header = array(array('data' => '', 'class' => array('webform-grid-question')));
    foreach ($element['#grid_options'] as $option) {
      $header[] = array('data' => _webform_filter_xss($option), 'class' => array('checkbox', 'webform-grid-option'));
    }
    foreach ($element['#grid_questions'] as $question_key => $question) {
      $row = array();
      $row[] = array('data' => _webform_filter_xss($question), 'class' => array('webform-grid-question'));
      foreach ($element['#grid_options'] as $option_value => $option_label) {
        if (strcmp($element[$question_key]['#value'], $option_value) == 0) {
          $row[] = array('data' => '<strong>X</strong>', 'class' => array('checkbox', 'webform-grid-option'));
        }
        else {
          $row[] = array('data' => '&nbsp;', 'class' => array('checkbox', 'webform-grid-option'));
        }
      }
      $rows[] = $row;
    }

    $option_count = count($header) - 1;
    $output = theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('class' => array('webform-grid', 'webform-grid-' . $option_count))));
  }
  else {
    $items = array();
    foreach (element_children($element) as $key) {
      $items[] = ' - ' . $element[$key]['#title'] . ': ' . (isset($element['#grid_options'][$element[$key]['#value']]) ? $element['#grid_options'][$element[$key]['#value']] : '');
    }
    $output = implode("\n", $items);
  }

  return $output;
}

/**
 * Implements _webform_analysis_component().
 */
function _webform_analysis_grid($component, $sids = array()) {
  // Generate the list of options and questions.
  $options = _webform_select_options_from_text($component['extra']['options'], TRUE);
  $questions = _webform_select_options_from_text($component['extra']['questions'], TRUE);

  // Generate a lookup table of results.
  $query = db_select('webform_submitted_data', 'wsd')
    ->fields('wsd', array('no', 'data'))
    ->condition('nid', $component['nid'])
    ->condition('cid', $component['cid'])
    ->condition('data', '', '<>')
    ->groupBy('no')
    ->groupBy('data');
  $query->addExpression('COUNT(sid)', 'datacount');

  if (count($sids)) {
    $query->condition('sid', $sids, 'IN');
  }

  $result = $query->execute();
  $counts = array();
  foreach ($result as $data) {
    $counts[$data->no][$data->data] = $data->datacount;
  }

  // Create an entire table to be put into the returned row.
  $rows = array();
  $header = array('');

  // Add options as a header row.
  foreach ($options as $option) {
    $header[] = _webform_filter_xss($option);
  }

  // Add questions as each row.
  foreach ($questions as $qkey => $question) {
    $row = array(_webform_filter_xss($question));
    foreach ($options as $okey => $option) {
      $row[] = !empty($counts[$qkey][$okey]) ? $counts[$qkey][$okey] : 0;
    }
    $rows[] = $row;
  }
  $output = theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('class' => array('webform-grid'))));


  return array(array(array('data' => $output, 'colspan' => 2)));
}

/**
 * Implements _webform_table_component().
 */
function _webform_table_grid($component, $value) {
  $questions = _webform_select_options_from_text($component['extra']['questions'], TRUE);
  $options = _webform_select_options_from_text($component['extra']['options'], TRUE);

  $output = '';
  // Set the value as a single string.
  foreach ($questions as $key => $label) {
    if (isset($value[$key]) && isset($options[$value[$key]])) {
      $output .= _webform_filter_xss($label) . ': ' . _webform_filter_xss($options[$value[$key]]) . '<br />';
    }
  }

  return $output;
}

/**
 * Implements _webform_csv_headers_component().
 */
function _webform_csv_headers_grid($component, $export_options) {
  $header = array();
  $header[0] = array('');
  $header[1] = array($component['name']);
  $items = _webform_select_options_from_text($component['extra']['questions'], TRUE);
  $count = 0;
  foreach ($items as $key => $item) {
    // Empty column per sub-field in main header.
    if ($count != 0) {
      $header[0][] = '';
      $header[1][] = '';
    }
    // The value for this option.
    $header[2][] = $item;
    $count++;
  }

  return $header;
}

/**
 * Implements _webform_csv_data_component().
 */
function _webform_csv_data_grid($component, $export_options, $value) {
  $questions = _webform_select_options_from_text($component['extra']['questions'], TRUE);
  $options = _webform_select_options_from_text($component['extra']['options'], TRUE);
  $return = array();
  foreach ($questions as $key => $question) {
    if (isset($value[$key]) && isset($options[$value[$key]])) {
      $return[] = $export_options['select_keys'] ? $value[$key] : $options[$value[$key]];
    }
    else {
      $return[] = '';
    }
  }
  return $return;
}

function theme_webform_grid($variables) {
  $element = $variables['element'];

  $rows = array();
  $header = array(array('data' => '', 'class' => array('webform-grid-question')));
  // Set the header for the table.
  foreach ($element['#grid_options'] as $option) {
    $header[] = array('data' => _webform_filter_xss($option), 'class' => array('checkbox', 'webform-grid-option'));
  }

  foreach (element_children($element) as $key) {
    $question_element = $element[$key];

    // Create a row with the question title.
    $row = array(array('data' => _webform_filter_xss($question_element['#title']), 'class' => array('webform-grid-question')));

    // Render each radio button in the row.
    $radios = form_process_radios($question_element);
    foreach (element_children($radios) as $key) {
      $radios[$key]['#title_display'] = 'invisible';
      $row[] = array('data' => drupal_render($radios[$key]), 'class' => array('checkbox', 'webform-grid-option'));
    }
    $rows[] = $row;
  }

  $option_count = count($header) - 1;
  return theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('class' => array('webform-grid', 'webform-grid-' . $option_count))));
}

<?php

/**
 * @file
 * Webform module date component.
 */

/**
 * Implements _webform_defaults_component().
 */
function _webform_defaults_date() {
  return array(
    'name' => '',
    'form_key' => NULL,
    'pid' => 0,
    'weight' => 0,
    'value' => '',
    'mandatory' => 0,
    'extra' => array(
      'timezone' => 'user',
      'start_date' => '-2 years',
      'end_date' => '+2 years',
      'year_textfield' => 0,
      'datepicker' => 1,
      'title_display' => 0,
      'description' => '',
      'private' => FALSE,
    ),
  );
}

/**
 * Implements _webform_theme_component().
 */
function _webform_theme_date() {
  return array(
    'webform_date' => array(
      'render element' => 'element',
      'file' => 'components/date.inc',
    ),
    'webform_display_date' => array(
      'render element' => 'element',
      'file' => 'components/date.inc',
    ),
    'webform_calendar' => array(
      'variables' => array('component' => NULL, 'calendar_classes' => NULL),
      'template' => 'templates/webform-calendar',
    ),
  );
}

/**
 * Implements _webform_edit_component().
 */
function _webform_edit_date($component) {
  $form = array();
  $form['value'] = array(
    '#type' => 'textfield',
    '#title' => t('Default value'),
    '#default_value' => $component['value'],
    '#description' => t('The default value of the field.') . '<br />' . t('Accepts any date in any <a href="http://www.gnu.org/software/tar/manual/html_chapter/Date-input-formats.html">GNU Date Input Format</a>. Strings such as today, +2 months, and Dec 9 2004 are all valid.'),
    '#size' => 60,
    '#maxlength' => 127,
    '#weight' => 0,
  );
  $form['extra']['timezone'] = array(
    '#type' => 'radios',
    '#title' => t('Default value timezone'),
    '#default_value' => empty($component['extra']['timezone']) ? 'user' : $component['extra']['timezone'],
    '#description' => t('If using relative dates for a default value (e.g. "today") base the current day on this timezone.'),
    '#options' => array('user' => t('User timezone'), 'site' => t('Website timezone')),
    '#weight' => 2,
    '#access' => variable_get('configurable_timezones', 1),
  );

  $form['display']['datepicker'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable popup calendar'),
    '#default_value' => $component['extra']['datepicker'],
    '#description' => t('Enable a JavaScript date picker next to the date field.'),
    '#weight' => 2,
    '#parents' => array('extra', 'datepicker'),
  );

  $form['display']['year_textfield'] = array(
    '#type' => 'checkbox',
    '#title' => t('Use a textfield for year'),
    '#default_value' => $component['extra']['year_textfield'],
    '#description' => t('If checked, the generated date field will use a textfield for the year. Otherwise it will use a select list.'),
    '#weight' => 5,
    '#parents' => array('extra', 'year_textfield'),
  );

  $form['validation']['start_date'] = array(
    '#type' => 'textfield',
    '#title' => t('Start date'),
    '#default_value' => $component['extra']['start_date'],
    '#description' => t('The earliest date that may be entered into the field.') . ' ' . t('Accepts any date in any <a href="http://www.gnu.org/software/tar/manual/html_chapter/Date-input-formats.html">GNU Date Input Format</a>.'),
    '#size' => 30,
    '#weight' => 3,
    '#parents' => array('extra', 'start_date'),
  );
  $form['validation']['end_date'] = array(
    '#type' => 'textfield',
    '#title' => t('End date'),
    '#default_value' => $component['extra']['end_date'],
    '#description' => t('The latest date that may be entered into the field.') . ' ' . t('Accepts any date in any <a href="http://www.gnu.org/software/tar/manual/html_chapter/Date-input-formats.html">GNU Date Input Format</a>.'),
    '#size' => 30,
    '#weight' => 4,
    '#parents' => array('extra', 'end_date'),
  );

  return $form;
}

/**
 * Implements _webform_render_component().
 */
function _webform_render_date($component, $value = NULL, $filter = TRUE) {
  $node = isset($component['nid']) ? node_load($component['nid']) : NULL;

  $element = array(
    '#type' => 'date',
    '#title' => $filter ? _webform_filter_xss($component['name']) : $component['name'],
    '#title_display' => $component['extra']['title_display'] ? $component['extra']['title_display'] : 'before',
    '#weight' => $component['weight'],
    '#description' => $filter ? _webform_filter_descriptions($component['extra']['description'], $node) : $component['extra']['description'],
    '#required' => $component['mandatory'],
    '#start_date' => trim($component['extra']['start_date']),
    '#end_date' => trim($component['extra']['end_date']),
    '#year_textfield' => $component['extra']['year_textfield'],
    '#default_value' => $filter ? _webform_filter_values($component['value'], $node, NULL, NULL, FALSE) : $component['value'],
    '#timezone' => $component['extra']['timezone'],
    '#process' => array('webform_expand_date'),
    '#theme' => 'webform_date',
    '#theme_wrappers' => array('webform_element'),
    '#element_validate' => array('webform_validate_date'),
    '#translatable' => array('title', 'description'),
  );

  if ($component['extra']['datepicker']) {
    $element['#datepicker'] = TRUE;
    $element['#attached'] = array(
      'library' => array(
        array('system', 'ui.datepicker'),
      ),
    );
  }

  // Set the value from Webform.
  if (isset($value[0]) && $value[0] !== '') {
    $value = webform_date_array($value[0], 'date');
    $element['#default_value'] = $value;
  }

  return $element;
}

/**
 * Form API #process function for Webform date fields.
 */
function webform_expand_date($element) {
  // Accept a string or array value for #default_value.
  if (!empty($element['#default_value']) && is_string($element['#default_value'])) {
    $timezone = $element['#timezone'] != 'user' ? NULL : 'user';
    $timestring = webform_strtodate('c', $element['#default_value'], $timezone);
    $element['#default_value'] = webform_date_array($timestring, 'date');
  }

  // Set defaults according to existing #default_value (set by Form API)
  if (isset($element['#default_value']['month']) || isset($element['#default_value']['day']) || isset($element['#default_value']['year'])) {
    $default_values = array(
      'month' => $element['#default_value']['month'],
      'day' => $element['#default_value']['day'],
      'year' => $element['#default_value']['year'],
    );
  }
  else {
    $default_values = array(
      'day' => NULL,
      'month' => NULL,
      'year' => NULL,
    );
  }

  // Let Drupal do it's normal expansion.
  $element = form_process_date($element);

  // Set default values.
  foreach ($default_values as $type => $value) {
    switch ($type) {
      case 'month':
        $none = t('Month');
        break;
      case 'day':
        $none = t('Day');
        break;
      case 'year':
        $none = t('Year');
        break;
    }
    unset($element[$type]['#value']);
    $element[$type]['#default_value'] = isset($default_values[$type]) ? $default_values[$type] : NULL;
    $element[$type]['#options'] = array('' => $none) + $element[$type]['#options'];
  }

  // Convert relative dates to absolute ones.
  foreach (array('start_date', 'end_date') as $start_end) {
    $timezone = $element['#timezone'] != 'user' ? NULL : 'user';
    $date = webform_strtodate('Y-m-d', $element['#' . $start_end], $timezone);
    $element['#' . $start_end] = $date ? $date : '';
  }

  // Tweak the year field.
  if ($element['#year_textfield']) {
    $element['year']['#type'] = 'textfield';
    $element['year']['#size'] = 5;
    $element['year']['#maxlength'] = 4;
    unset($element['year']['#options']);
  }
  elseif ($element['#start_date'] || $element['#end_date']) {
    $start_year = $element['#start_date'] ? webform_strtodate('Y', $element['#start_date']) : webform_strtodate('Y', '-2 years');
    $end_year = $element['#end_date'] ? webform_strtodate('Y', $element['#end_date']) : webform_strtodate('Y', '+2 years');
    $element['year']['#options'] = array('' => t('Year')) + drupal_map_assoc(range($start_year, $end_year));
  }

  return $element;
}

/**
 * Theme a webform date element.
 */
function theme_webform_date($variables) {
  $element = $variables['element'];

  $element['year']['#attributes']['class'] = array('year');
  $element['month']['#attributes']['class'] = array('month');
  $element['day']['#attributes']['class'] = array('day');

  // Add error classes to all items within the element.
  if (form_get_error($element)) {
    $element['year']['#attributes']['class'][] = 'error';
    $element['month']['#attributes']['class'][] = 'error';
    $element['day']['#attributes']['class'][] = 'error';
  }

  $class = array('webform-container-inline');

  // Add the JavaScript calendar if available (provided by Date module package).
  if (!empty($element['#datepicker'])) {
    $class[] = 'webform-datepicker';
    $calendar_class = array('webform-calendar');
    if ($element['#start_date']) {
      $calendar_class[] = 'webform-calendar-start-' . $element['#start_date'];
    }
    if ($element['#end_date']) {
      $calendar_class[] = 'webform-calendar-end-' . $element['#end_date'];
    }
    $calendar_class[] ='webform-calendar-day-' . variable_get('date_first_day', 0);

    $calendar = theme('webform_calendar', array('component' => $element['#webform_component'], 'calendar_classes' => $calendar_class));
  }

  $output = '';
  $output .= '<div class="' . implode(' ', $class) . '">';
  $output .= drupal_render_children($element);
  $output .= isset($calendar) ? $calendar : '';
  $output .= '</div>';

  return $output;
}

/**
 * Element validation for Webform date fields.
 */
function webform_validate_date($element, $form_state) {
  // Check if the user filled the required fields.
  foreach (array('day', 'month', 'year') as $field_type) {
    if (!is_numeric($element[$field_type]['#value']) && $element['#required']) {
      form_error($element, t('!name field is required.', array('!name' => $element['#title'])));
      return;
    }
  }

  if ($element['month']['#value'] !== '' || $element['day']['#value'] !== '' || $element['year']['#value'] !== '') {
    // Check for a valid date.
    if (!checkdate((int) $element['month']['#value'], (int) $element['day']['#value'], (int) $element['year']['#value'])) {
      form_error($element, t('Entered !name is not a valid date.', array('!name' => $element['#title'])));
      return;
    }

    // Create a timestamp of the entered value for comparison.
    $timestamp = strtotime($element['year']['#value'] . '-' . $element['month']['#value'] . '-' . $element['day']['#value']);
    $format = webform_date_format('short');

    // Flip start and end if needed.
    $date1 = strtotime($element['#start_date']);
    $date2 = strtotime($element['#end_date']);
    if ($date1 !== FALSE && $date2 !== FALSE) {
      $start_date = $date1 < $date2 ? $date1 : $date2;
      $end_date = $date1 > $date2 ? $date1 : $date2;
    }
    else {
      $start_date = $date1;
      $end_date = $date2;
    }

    // Check that the date is after the start date.
    if ($start_date !== FALSE) {
      if ($timestamp < $start_date) {
        form_error($element, t('The entered date must be @start_date or later.', array('@start_date' => date($format, $start_date))));
      }
    }

    // Check that the date is before the end date.
    if ($end_date !== FALSE) {
      if ($timestamp > $end_date) {
        form_error($element, t('The entered date must be @end_date or earlier.', array('@end_date' => date($format, $end_date))));
      }
    }
  }
}

/**
 * Implements _webform_submit_component().
 */
function _webform_submit_date($component, $value) {
  // Convert the date to an ISO 8601 format.
  return ($value['year'] && $value['month'] && $value['day']) ? webform_date_string($value, 'date') : '';
}

/**
 * Implements _webform_display_component().
 */
function _webform_display_date($component, $value, $format = 'html') {
  $value = webform_date_array(isset($value[0]) ? $value[0] : '', 'date');

  return array(
    '#title' => $component['name'],
    '#weight' => $component['weight'],
    '#theme' => 'webform_display_date',
    '#theme_wrappers' => $format == 'html' ? array('webform_element') : array('webform_element_text'),
    '#format' => $format,
    '#value' => $value,
    '#translatable' => array('title'),
  );
}

/**
 * Format the text output for this component.
 */
function theme_webform_display_date($variables) {
  $element = $variables['element'];
  $output = ' ';
  if ($element['#value']['year'] && $element['#value']['month'] && $element['#value']['day']) {
    $timestamp = webform_strtotime($element['#value']['month'] . '/' . $element['#value']['day'] . '/' . $element['#value']['year']);
    $format = webform_date_format('medium');
    $output = format_date($timestamp, 'custom', $format, 'UTC');
  }

  return $output;
}

/**
 * Implements _webform_analysis_component().
 */
function _webform_analysis_date($component, $sids = array()) {
  $query = db_select('webform_submitted_data', 'wsd', array('fetch' => PDO::FETCH_ASSOC))
    ->fields('wsd', array('no', 'data'))
    ->condition('nid', $component['nid'])
    ->condition('cid', $component['cid'])
    ->orderBy('sid');

  if (count($sids)) {
    $query->condition('sid', $sids, 'IN');
  }

  $result = $query->execute();

  $dates = array();
  $submissions = 0;
  foreach ($result as $row) {
    $submissions++;
    if ($row['data']) {
      $dates[] = webform_date_array($row['data']);
    }
  }

  // Display stats.
  $nonblanks = count($dates);
  $rows[0] = array(t('Left Blank'), ($submissions - $nonblanks));
  $rows[1] = array(t('User entered value'), $nonblanks);
  return $rows;
}

/**
 * Implements _webform_table_component().
 */
function _webform_table_date($component, $value) {
  if ($value[0]) {
    $timestamp = webform_strtotime($value[0]);
    $format = webform_date_format('short');
    return format_date($timestamp, 'custom', $format, 'UTC');
  }
  else {
    return '';
  }
}

/**
 * Implements _webform_csv_headers_component().
 */
function _webform_csv_headers_date($component, $export_options) {
  $header = array();
  $header[0] = '';
  $header[1] = '';
  $header[2] = $component['name'];
  return $header;
}

/**
 * Implements _webform_csv_data_component().
 */
function _webform_csv_data_date($component, $export_options, $value) {
  if ($value[0]) {
    $timestamp = webform_strtotime($value[0]);
    $format = webform_date_format('short');
    return format_date($timestamp, 'custom', $format, 'UTC');
  }
  else {
    return '';
  }
}

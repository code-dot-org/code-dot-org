<?php

/**
 * @file
 * Webform module number component.
 */

/**
 * Implements _webform_defaults_component().
 */
function _webform_defaults_number() {
  return array(
    'name' => '',
    'form_key' => NULL,
    'pid' => 0,
    'weight' => 0,
    'value' => '',
    'mandatory' => 0,
    'extra' => array(
      'type' => 'textfield',
      'field_prefix' => '',
      'field_suffix' => '',
      'unique' => 0,
      'title_display' => 0,
      'description' => '',
      'attributes' => array(),
      'private' => FALSE,
      'min' => '',
      'max' => '',
      'step' => '',
      'decimals' => '',
      'point' => '.',
      'separator' => ',',
      'integer' => 0,
      'excludezero' => 0,
    ),
  );
}

/**
 * Implements _webform_theme_component().
 */
function _webform_theme_number() {
  return array(
    'webform_number' => array(
      'render element' => 'element',
      'file' => 'components/number.inc',
    ),
    'webform_display_number' => array(
      'render element' => 'element',
      'file' => 'components/number.inc',
    ),
  );
}

/**
 * Implements _webform_edit_component().
 */
function _webform_edit_number($component) {
  $form = array();
  $form['value'] = array(
    '#type' => 'textfield',
    '#title' => t('Default value'),
    '#default_value' => $component['value'],
    '#description' => t('The default value of the field.') . theme('webform_token_help'),
    '#size' => 60,
    '#maxlength' => 1024,
    '#weight' => 0,
  );
  $form['display']['type'] = array(
    '#type' => 'radios',
    '#title' => t('Element type'),
    '#options' => array(
      'textfield' => t('Text field'),
      'select' => t('Select list'),
    ),
    '#default_value' => $component['extra']['type'],
    '#description' => t('A minimum and maximum value are required if displaying as a select.'),
    '#weight' => -1,
    '#parents' => array('extra', 'type'),
  );
  $form['display']['field_prefix'] = array(
    '#type' => 'textfield',
    '#title' => t('Prefix text placed to the left of the field'),
    '#default_value' => $component['extra']['field_prefix'],
    '#description' => t('Examples: $, #, -.'),
    '#size' => 20,
    '#maxlength' => 127,
    '#weight' => 1.1,
    '#parents' => array('extra', 'field_prefix'),
  );
  $form['display']['field_suffix'] = array(
    '#type' => 'textfield',
    '#title' => t('Postfix text placed to the right of the field'),
    '#default_value' => $component['extra']['field_suffix'],
    '#description' => t('Examples: lb, kg, %.'),
    '#size' => 20,
    '#maxlength' => 127,
    '#weight' => 1.2,
    '#parents' => array('extra', 'field_suffix'),
  );
  $form['display']['decimals'] = array(
    '#type' => 'select',
    '#title' => t('Decimal places'),
    '#options' => array('' => t('Automatic')) + drupal_map_assoc(range(0, 10)),
    '#description' => t('Automatic will display up to @count decimals places if needed. A value of "2" is common to format currency amounts.', array('@count' => '4')),
    '#default_value' => $component['extra']['decimals'],
    '#weight' => 2,
    '#parents' => array('extra', 'decimals'),
    '#element_validate' => array('_webform_edit_number_validate'),
  );
  $form['display']['separator'] = array(
    '#type' => 'select',
    '#title' => t('Thousands separator'),
    '#options' => array(
      ',' => t('Comma (,)'),
      '.' => t('Period (.)'),
      ' ' => t('Space ( )'),
      '' => t('None'),
    ),
    '#default_value' => $component['extra']['separator'],
    '#weight' => 3,
    '#parents' => array('extra', 'separator'),
    '#element_validate' => array('_webform_edit_number_validate'),
  );
  $form['display']['point'] = array(
    '#type' => 'select',
    '#title' => t('Decimal point'),
    '#options' => array(
      ',' => t('Comma (,)'),
      '.' => t('Period (.)'),
    ),
    '#default_value' => $component['extra']['point'],
    '#weight' => 4,
    '#parents' => array('extra', 'point'),
    '#element_validate' => array('_webform_edit_number_validate'),
  );
  $form['validation']['unique'] = array(
    '#type' => 'checkbox',
    '#title' => t('Unique'),
    '#return_value' => 1,
    '#description' => t('Check that all entered values for this field are unique. The same value is not allowed to be used twice.'),
    '#weight' => 1,
    '#default_value' => $component['extra']['unique'],
    '#parents' => array('extra', 'unique'),
  );
  $form['validation']['integer'] = array(
    '#type' => 'checkbox',
    '#title' => t('Integer'),
    '#return_value' => 1,
    '#description' => t('Permit only integer values as input. e.g. 12.34 would be invalid.'),
    '#weight' => 1.5,
    '#default_value' => $component['extra']['integer'],
    '#parents' => array('extra', 'integer'),
  );
  $form['validation']['min'] = array(
    '#type' => 'textfield',
    '#title' => t('Minimum'),
    '#default_value' => $component['extra']['min'],
    '#description' => t('Minimum numeric value. e.g. 0 would ensure positive numbers.'),
    '#size' => 5,
    '#maxlength' => 10,
    '#weight' => 2,
    '#parents' => array('extra', 'min'),
    '#element_validate' => array('_webform_edit_number_validate'),
  );
  $form['validation']['max'] = array(
    '#type' => 'textfield',
    '#title' => t('Maximum'),
    '#default_value' => $component['extra']['max'],
    '#description' => t('Maximum numeric value. This may also determine the display width of your field.'),
    '#size' => 5,
    '#maxlength' => 10,
    '#weight' => 2,
    '#parents' => array('extra', 'max'),
    '#element_validate' => array('_webform_edit_number_validate'),
  );
  $form['validation']['step'] = array(
    '#type' => 'textfield',
    '#title' => t('Step'),
    '#default_value' => $component['extra']['step'],
    '#description' => t('Limit options to a specific increment. e.g. a step of "5" would allow values 5, 10, 15, etc.'),
    '#size' => 5,
    '#maxlength' => 10,
    '#weight' => 3,
    '#parents' => array('extra', 'step'),
    '#element_validate' => array('_webform_edit_number_validate'),
  );
  // Analysis settings.
  $form['analysis'] = array(
    '#type' => 'fieldset',
    '#title' => t('Analysis'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#weight' => 10,
  );
  $form['analysis']['excludezero'] = array(
    '#type' => 'checkbox',
    '#title' => t('Exclude zero'),
    '#return_value' => 1,
    '#description' => t('Exclude entries of zero (or blank) when counting submissions to calculate average and standard deviation.'),
    '#weight' => 1.5,
    '#default_value' => $component['extra']['excludezero'],
    '#parents' => array('extra', 'excludezero'),
  );
  return $form;
}

/**
 * Theme function to render a number component.
 */
function theme_webform_number($variables) {
  $element = $variables['element'];

  // This IF statement is mostly in place to allow our tests to set type="text"
  // because SimpleTest does not support type="number".
  if (!isset($element['#attributes']['type'])) {
    $element['#attributes']['type'] = 'number';
  }

  // Step property *must* be a full number with 0 prefix if a decimal.
  if (!is_int($element['#step'] * 1)) {
    $decimals = strlen($element['#step']) - strrpos($element['#step'], '.') - 1;
    $element['#step'] = sprintf('%1.' . $decimals . 'F', $element['#step']);
  }

  // Convert properties to attributes on the element if set.
  foreach (array('id', 'name', 'value', 'size', 'min', 'max', 'step') as $property) {
    if (isset($element['#' . $property]) && $element['#' . $property] !== '') {
      $element['#attributes'][$property] = $element['#' . $property];
    }
  }
  _form_set_class($element, array('form-text', 'form-number'));

  return '<input' . drupal_attributes($element['#attributes']) . ' />';
}

/**
 * Implements _webform_render_component().
 */
function _webform_render_number($component, $value = NULL, $filter = TRUE) {
  $node = isset($component['nid']) ? node_load($component['nid']) : NULL;

  $element = array(
    '#title' => $filter ? _webform_filter_xss($component['name']) : $component['name'],
    '#title_display' => $component['extra']['title_display'] ? $component['extra']['title_display'] : 'before',
    '#default_value' => $filter ? _webform_filter_values($component['value'], $node, NULL, NULL, FALSE) : $component['value'],
    '#required' => $component['mandatory'],
    '#weight' => $component['weight'],
    '#field_prefix' => empty($component['extra']['field_prefix']) ? NULL : ($filter ? _webform_filter_xss($component['extra']['field_prefix']) : $component['extra']['field_prefix']),
    '#field_suffix' => empty($component['extra']['field_suffix']) ? NULL : ($filter ? _webform_filter_xss($component['extra']['field_suffix']) : $component['extra']['field_suffix']),
    '#description' => $filter ? _webform_filter_descriptions($component['extra']['description'], $node) : $component['extra']['description'],
    '#attributes' => $component['extra']['attributes'],
    '#element_validate' => array('_webform_validate_number'),
    '#theme_wrappers' => array('webform_element'),
    '#min' => $component['extra']['min'],
    '#max' => $component['extra']['max'],
    '#step' => abs($component['extra']['step']),
    '#integer' => $component['extra']['integer'],
    '#translatable' => array('title', 'description'),
  );

  // Flip the min and max properties to make min less than max if needed.
  if ($element['#min'] !== '' && $element['#max'] !== '' && $element['#min'] > $element['#max']) {
    $max = $element['#min'];
    $element['#min'] = $element['#max'];
    $element['#max'] = $max;
  }

  // Ensure #step starts with a zero if a decimal.
  if (!is_int($element['#step'] * 1)) {
    $decimals = strlen($element['#step']) - strrpos($element['#step'], '.') - 1;
    $element['#step'] = sprintf('%1.' . $decimals . 'F', $element['#step']);
  }

  if ($component['extra']['type'] == 'textfield') {
    // Render as textfield.
    $element['#type'] = 'webform_number';

    // Set the size property based on #max, to ensure consistent behavior for
    // browsers that do not support type = number.
    if ($element['#max']) {
      $element['#size'] =  strlen($element['#max']) + 1;
    }
  }
  else {
    // Render as select.
    $element['#type'] = 'select';

    // Create user-specified options list as an array.
    $element['#options'] = _webform_number_select_options($component);

    // Add default options if using a select list with no default. This trigger's
    // Drupal 7's adding of the option for us. See form_process_select().
    if ($component['extra']['type'] == 'select' && $element['#default_value'] === '') {
      $element['#empty_value'] = '';
    }
  }

  // Set user-entered values.
  if (isset($value[0])) {
    $element['#default_value'] = $value[0];
  }

  // Enforce uniqueness.
  if ($component['extra']['unique']) {
    $element['#element_validate'][] = 'webform_validate_unique';
  }

  return $element;
}

/**
 * Implements _webform_display_component().
 */
function _webform_display_number($component, $value, $format = 'html') {
  $empty = !isset($value[0]) || $value[0] === '';
  return array(
    '#title' => $component['name'],
    '#weight' => $component['weight'],
    '#theme' => 'webform_display_number',
    '#theme_wrappers' => $format == 'html' ? array('webform_element') : array('webform_element_text'),
    '#field_prefix' => $empty ? '' : $component['extra']['field_prefix'],
    '#field_suffix' => $empty ? '' : $component['extra']['field_suffix'],
    '#format' => $format,
    '#value' => $empty ? '' : _webform_number_format($component, $value[0]),
    '#translatable' => array('title'),
  );
}

/**
 * Format the output of data for this component.
 */
function theme_webform_display_number($variables) {
  $element = $variables['element'];
  $prefix = $element['#format'] == 'html' ? filter_xss($element['#field_prefix']) : $element['#field_prefix'];
  $suffix = $element['#format'] == 'html' ? filter_xss($element['#field_suffix']) : $element['#field_suffix'];
  $value = $element['#format'] == 'html' ? check_plain($element['#value']) : $element['#value'];
  return $value !== '' ? ($prefix . $value . $suffix) : ' ';
}

/**
 * Implements _webform_analysis_component().
 */
function _webform_analysis_number($component, $sids = array(), $single = FALSE) {
  $advanced_stats = $single;

  $query = db_select('webform_submitted_data', 'wsd', array('fetch' => PDO::FETCH_ASSOC))
    ->fields('wsd', array('data'))
    ->condition('nid', $component['nid'])
    ->condition('cid', $component['cid']);

  if (count($sids)) {
    $query->condition('sid', $sids, 'IN');
  }

  $population = array();
  $submissions = 0;
  $nonzero = 0;
  $not_empty = 0;
  $sum = 0;

  $result = $query->execute();
  foreach ($result as $data) {
    $value = trim($data['data']);
    if ($value == '') {
      $number = 0.0;
    }
    else {
      $number = $value * 1.0;
    }

    if ($value !== '') {
      $not_empty++;
    }

    if ($number > 0) {
      $nonzero++;
      $sum += $number;
    }
    $population[] = $number;
    $submissions++;
  }
  sort($population, SORT_NUMERIC);

  // Average and population count.
  if ($component['extra']['excludezero']) {
    $average = $nonzero ? ($sum / $nonzero) : 0;
    $average_title = t('Average !mu excluding zeros/blanks', array('!mu' => $advanced_stats ? '(&mu;)' : ''));
    // Sample (sub-set of total population).
    $population_count = $nonzero - 1;
    $sigma = 'sd';
    $description = t('sample');
  }
  else {
    $average = $submissions ? ($sum / $submissions) : 0;
    $average_title = t('Average !mu including zeros/blanks', array('!mu' => $advanced_stats ? '(&mu;)' : ''));
    // Population.
    $population_count = $submissions;
    $sigma = '&sigma;';
    $description = t('population');
  }

  // Formatting.
  $average = _webform_number_format($component, $average);
  $sum = _webform_number_format($component, $sum);

  $rows[0] = array(t('Zero/blank'), ($submissions - $nonzero));
  $rows[1] = array(t('User entered value'), $not_empty);
  $rows[2] = array(t('Sum') . ($advanced_stats ? ' (&Sigma;)' : ''), $sum);
  $rows[3] = array($average_title, $average);

  if (!$advanced_stats && $sum != 0) {
    $rows[4] = array('', l(t('More stats »'), 'node/' . $component['nid'] . '/webform-results/analysis/' . $component['cid']));
  }

  // Normal distribution information.
  if ($advanced_stats && $population_count && $sum != 0) {
    // Standard deviation.
    $stddev = 0;
    foreach($population as $value) {
      // Obtain the total of squared variances.
      $stddev += pow(($value - $average), 2);
    }
    if ($population_count > 0) {
      $stddev = sqrt($stddev / $population_count);
    }
    else {
      $stddev = sqrt($stddev);
    }

    // Build normal distribution table rows.
    $count = array();
    $percent = array();
    $limit = array();
    $index = 0;

    $count[] = 0;
    $limit[] = $average - ($stddev * 4);
    foreach ($population as $value) {
      while ($value >= $limit[$index]) {
        $percent[] = number_format($count[$index] / $population_count * 100, 2, '.', '');
        $limit[] = $limit[$index] + $stddev;
        $index += 1;
        if ($limit[$index] == $average) {
          $limit[$index] = $limit[$index] + $stddev;
        }
        $count[$index] = 0;
      }
      $count[$index] += 1;
    }
    $percent[] = number_format($count[$index] / $population_count * 100, 2, '.', '');

    // Format normal distribution table output.
    $stddev = _webform_number_format($component, $stddev);
    $low = _webform_number_format($component, $population[0]);
    $high = _webform_number_format($component, end($population));
    foreach($limit as $key => $value) {
      $limit[$key] = _webform_number_format($component, $value);
    }

    // Column headings (override potential theme uppercase, e.g. Seven in D7).
    $header = array(
      t('Normal Distribution'),
      array('data' => '-4' . $sigma, 'style' => 'text-transform: lowercase;',),
      array('data' => '-3' . $sigma, 'style' => 'text-transform: lowercase;',),
      array('data' => '-2' . $sigma, 'style' => 'text-transform: lowercase;',),
      array('data' => '-1' . $sigma, 'style' => 'text-transform: lowercase;',),
      array('data' => '+1' . $sigma, 'style' => 'text-transform: lowercase;',),
      array('data' => '+2' . $sigma, 'style' => 'text-transform: lowercase;',),
      array('data' => '+3' . $sigma, 'style' => 'text-transform: lowercase;',),
      array('data' => '+4' . $sigma, 'style' => 'text-transform: lowercase;',),
    );

    // Insert row labels.
    array_unshift($limit, t('Boundary'));
    array_unshift($count, t('Count'));
    array_unshift($percent, t('% of !description', array('!description' => $description)));

    $output = theme('table', array('header' => $header, 'rows' => array($limit, $count, $percent)));

    $rows[4] = array(t('Range'), t('!low to !high', array('!low' => $low, '!high' => $high)));
    $rows[5] = array(t('Standard deviation (!sigma)', array('!sigma' => $sigma)), $stddev);
    $rows[6] = array(array('data' => $output, 'colspan' => 2));
  }

  return $rows;
}

/**
 * Implements _webform_table_component().
 */
function _webform_table_number($component, $value) {
  return isset($value[0]) ? _webform_number_format($component, $value[0]) : '';
}

/**
 * Implements _webform_csv_headers_component().
 */
function _webform_csv_headers_number($component, $export_options) {
  $header = array();
  $header[0] = '';
  $header[1] = '';
  $header[2] = $component['name'];
  return $header;
}

/**
 * Implements _webform_csv_data_component().
 */
function _webform_csv_data_number($component, $export_options, $value) {
  if (isset($value[0]) && $component['extra']['decimals'] !== '') {
    $value[0] = number_format($value[0], $component['extra']['decimals'], '.', '');
  }
  return isset($value[0]) ? $value[0] : '';
}

/**
 * A Drupal Form API Validation function. Validates the entered values from
 * number components on the client-side form.
 *
 * @param $element
 *   The form element. May either be a select or a webform_number element.
 * @param $form_state
 *   The full form state for the webform.
 * @return
 *   None. Calls a form_set_error if the number is not valid.
 */
function _webform_validate_number($element, &$form_state) {
  $value = trim($element['#value']);
  form_set_value($element, $value, $form_state);

  if ($value != '') {
    // Numeric test.
    if (is_numeric($value)) {
      // Range test.
      if ($element['#min'] != '' && $element['#max'] != '') {
        // Flip minimum and maximum if needed.
        if ($element['#max'] > $element['#min']) {
          $min = $element['#min'];
          $max = $element['#max'];
        }
        else {
          $min = $element['#max'];
          $max = $element['#min'];
        }
        if ($value > $max || $value < $min) {
          form_error($element, t('%name field value of @value should be in the range @min to @max.', array('%name' => $element['#title'], '@value' => $value, '@min' => $min, '@max' => $max)));
        }
      }
      elseif ($element['#max'] != '' && $value > $element['#max']) {
        form_error($element, t('%name field value must be less than @max.', array('%name' => $element['#title'], '@max' => $element['#max'])));
      }
      elseif ($element['#min'] != '' && $value < $element['#min']) {
        form_error($element, t('%name field value must be greater than @min.', array('%name' => $element['#title'], '@min' => $element['#min'])));
      }

      // Integer test.
      if ($element['#integer'] && !is_int($value * 1)) {
        form_error($element, t('%name field value of @value must be an integer.', array('%name' => $element['#title'], '@value' => $value)));
      }

      // Step test.
      $starting_number = $element['#min'] ? $element['#min'] : 0;
      if ($element['#step'] != 0 && fmod($element['#value'] - $starting_number, $element['#step']) != 0) {
        $samples = array(
          $starting_number,
          $starting_number + ($element['#step'] * 1),
          $starting_number + ($element['#step'] * 2),
          $starting_number + ($element['#step'] * 3),
        );
        if ($starting_number) {
          form_error($element, t('%name field value must be @start plus a multiple of @step. i.e. @samples, etc.', array('%name' => $element['#title'], '@start' => $element['#min'], '@step' => $element['#step'], '@samples' => implode(', ', $samples))));
        }
        else {
          form_error($element, t('%name field value must be a multiple of @step. i.e. @samples, etc.', array('%name' => $element['#title'], '@step' => $element['#step'], '@samples' => implode(', ', $samples))));
        }
      }
    }
    else {
      form_error($element, t('%name field value of @value must be numeric.', array('%name' => $element['#title'], '@value' => $value)));
    }
  }

}

/**
 * Validation of number edit form items.
 */
function _webform_edit_number_validate($element, &$form_state) {
  // Shorten field names.
  $values = $form_state['values']['extra'];

  switch ($element['#name']) {
    case 'extra[min]':
      if ($values['min'] == '') {
        if ($values['type'] == 'select') {
          form_error($element, t('Minimum is required when using a select list element.'));
        }
      }
      else {
        if (!is_numeric($values['min'])) {
          form_error($element, t('Minimum must be numeric.'));
        }
        if ($values['integer'] && !is_int($values['min'] * 1)) {
          form_error($element, t('Minimum must have an integer value.'));
        }
      }
      break;
    case 'extra[max]':
      if ($values['max'] == '') {
        if ($values['type'] == 'select') {
          form_error($element, t('Maximum is required when using a select list element.'));
        }
      }
      else {
        if (!is_numeric($values['max'])) {
          form_error($element, t('Maximum must be numeric.'));
        }
        if ($values['integer'] && !is_int($values['max'] * 1)) {
          form_error($element, t('Maximum must have an integer value.'));
        }
      }
      break;
    case 'extra[step]':
      if ($values['step'] != '') {
        if (!is_numeric($values['step'])) {
          form_error($element, t('Step must be numeric.'));
        }
        else {
          if ($values['integer'] && !is_int($values['step'] * 1)) {
            form_error($element, t('Step must have an integer value.'));
          }
        }
      }
      break;
  }
  return TRUE;
}

/**
 * Generate select list options.
 */
function _webform_number_select_options($component) {
  $options = array();
  $step = abs($component['extra']['step']);

  // Step is optional and defaults to 1.
  $step = empty($step) ? 1 : $step;

  // Generate list in correct direction.
  $min = $component['extra']['min'];
  $max = $component['extra']['max'];
  $flipped = FALSE;
  if ($max < $min) {
    $min = $component['extra']['max'];
    $max = $component['extra']['min'];
    $flipped = TRUE;
  }

  for ($f = $min; $f <= $max; $f += $step) {
    $options[$f . ''] = $f . '';
  }

  // TODO: HTML5 browsers apparently do not include the max value if it does
  // not line up with step. Restore this if needed in the future.
  // Add end limit if it's been skipped due to step.
  //if (end($options) != $max) {
  //  $options[$f] = $max;
  //}

  if ($flipped) {
    $options = array_reverse($options, TRUE);
  }

  // Apply requisite number formatting.
  foreach ($options as $key => $value) {
    $options[$key] = _webform_number_format($component, $value);
  }

  return $options;
}

/**
 * Apply number format.
 */
function _webform_number_format($component, $value) {
  // If no decimal places are specified, do a best guess length of decimals.
  $decimals = $component['extra']['decimals'];
  if ($decimals === '') {
    // If it's an integer, no decimals needed.
    if (is_int(($value . '') * 1)) {
      $decimals = 0;
    }
    else {
      $decimals = strlen($value) - strrpos($value, '.') - 1;
    }
    if ($decimals > 4) {
      $decimals = 4;
    }
  }

  return number_format($value, $decimals, $component['extra']['point'], $component['extra']['separator']);
}

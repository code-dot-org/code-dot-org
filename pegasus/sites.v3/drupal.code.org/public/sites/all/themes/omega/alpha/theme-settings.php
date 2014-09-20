 <?php

require_once dirname(__FILE__) . '/includes/alpha.inc';
require_once dirname(__FILE__) . '/includes/base.inc';
require_once dirname(__FILE__) . '/includes/theme-settings-general.inc';
require_once dirname(__FILE__) . '/includes/theme-settings-structure.inc';
  
/**
 * Implements hook_form_system_theme_settings_alter()
 */
function alpha_form_system_theme_settings_alter(&$form, &$form_state) {
  drupal_add_css(drupal_get_path('theme', 'alpha') . '/css/alpha-theme-settings.css', array('group' => CSS_THEME, 'weight' => 100));
  
  $theme = alpha_get_theme();
  $form_state['theme'] = $theme->theme;
  $form_state['regions'] = $theme->regions;
  $form_state['zones'] = $theme->zones;
  
  $form['alpha_settings'] = array(
    '#type' => 'vertical_tabs',
    '#weight' => -10,
    '#prefix' => t('<h3>Layout configuration</h3>'),
  );
  
  alpha_theme_settings_general($form, $form_state);
  alpha_theme_settings_structure($form, $form_state);
  
  $form['#validate'][] = 'alpha_theme_settings_form_validate';
  $form['#submit'][] = 'alpha_theme_settings_form_submit';
}

/**
 * Form element validation handler for replacing the value "_none" with NULL. 
 */
function alpha_theme_settings_validate_not_empty(&$element, &$form_state) {
  if ($element['#value'] == '_none') {
    form_set_value($element, NULL, $form_state);
  }  
}

/**
 * Form element validation handler for validating the primary region setting for zones.
 */
function alpha_theme_settings_validate_primary(&$element, &$form_state) {
  if ($element['#value'] != '_none') {
    $values = $form_state['values'];
    
    if ($values['alpha_region_' . $element['#value'] . '_zone'] != $element['#zone']) {
      form_set_value($element, NULL, $form_state);
    }
    else {
      $sum = 0;
      
      foreach ($form_state['regions'] as $region => $item) {
        if ($values['alpha_region_' . $region . '_zone'] == $element['#zone']) {
          $sum += $values['alpha_region_' . $region . '_columns'];
          $sum += $values['alpha_region_' . $region . '_prefix'];
          $sum += $values['alpha_region_' . $region . '_suffix'];
        }
      }
      
      if ($sum > $values['alpha_zone_' . $element['#zone'] . '_columns']) {
        form_error($element, t('You have specified the %region region as the primary region for the %zone zone but the summed region width is greater than the number of available columns for that zone.', array('%region' => $form_state['regions'][$element['#value']]['name'], '%zone' => $form_state['zones'][$element['#zone']]['name'])));
      }
    }
  }
}

/**
 * Form element validation handler for validating the region order manipulation setting for zones.
 */
function alpha_theme_settings_validate_order(&$element, &$form_state) {
  if ($element['#value']) {
    $values = $form_state['values'];
    $sum = 0;

    foreach ($form_state['regions'] as $region => $item) {
      if ($values['alpha_region_' . $region . '_zone'] == $element['#zone']) {
        $sum += $values['alpha_region_' . $region . '_columns'];
        $sum += $values['alpha_region_' . $region . '_prefix'];
        $sum += $values['alpha_region_' . $region . '_suffix'];
      }
    }

    if ($sum > $values['alpha_zone_' . $element['#zone'] . '_columns']) {
      form_error($element, t('You have chosen to manipulate the region positioning of the %zone zone but the summed region width is greater than the number of available columns for that zone.', array('%zone' => $form_state['zones'][$element['#zone']]['name'])));
    }
  }
}

/**
 * Removes the vertical tab active tab from the values. It really doesn't
 * belong there!
 */
function alpha_theme_settings_form_validate($form, &$form_state) {
  unset($form_state['values']['alpha_settings__active_tab']);
}

/**
 * Clears the cache for the theme settings upon form submission.
 */
function alpha_theme_settings_form_submit($form, &$form_state) {
  alpha_cache_clear($form_state['theme'], (isset($form_state['delta']) ? $form_state['delta'] : NULL));
}

/**
 * A helper function to return a proper options array for a form.
 * 
 * @param $start
 *   The number to start with.
 * 
 * @param $end
 *   The number to end with.
 *   
 * @param $step
 *   The size of a step.
 *   
 * @return 
 *   An array of scale options.
 */
function alpha_scale_options($start, $end, $step) {
  $options = array();  
  foreach (range($start, $end, $step) as $number) {
    // Format the value to display with one decimal.
    $options[(string) $number] = number_format($number, 1);
  }
  
  return $options;
}

/**
 * A helper function to return a proper options array for a form.
 *   
 * @return 
 *   An array of optional or responsive stylesheet options.
 */
function alpha_css_options($css) {
  $output = array();
  foreach ($css as $key => $info) {
    $output[$key] = '<strong>' . check_plain($info['name']) . '</strong> (' . (isset($info['options']['media']) ? $info['options']['media'] : 'all') . ') - ' . $info['file'] . '<div class="description">' . $info['description'] . '</div>';
  }
  
  return $output;
}

/**
 * A helper function to return a proper options array for a form.
 * 
 * @param $theme
 *   The key (machin-readable name) of a theme.
 * 
 * @see
 *   hook_css_alter().
 *   
 * @return 
 *   An array of stylesheets that can be disabled / excluded with
 *   hook_css_alter().
 */
function alpha_exclude_options($theme) {
  $output = array(); 
  foreach (alpha_retrieve_excludes($theme) as $key => $info) {
    if ($info['type'] == 'exclude') {
      $output[$key] = '<strong>' . basename($key) . '</strong> - ' . t('Defined by') . ' ' . $info['name'] . '<div class="description">' . $info['description'] . '</div>';
    }
    else {
      $output[$key] = '<strong>' . basename($key) . '</strong> (' . $info['media'] . ') - ' . t('Belongs to') . ' ' . $info['name'] . '<div class="description">' . $info['description'] . '</div>';
    }
  }
  
  return $output;
}

/**
 * A helper function to return a proper options array for a form.
 *   
 * @return 
 *   An array of available grids.
 */
function alpha_grid_options($grids) {
  $output = array();
  foreach ($grids as $key => $info) {
    $output[$key] = check_plain($info['name']);
  }
    
  return $output;
}

/**
 * A helper function to return a proper options array for a form.
 * 
 * @param $grid
 *   The name of a grid.
 *   
 * @return 
 *   An array of available layouts.
 */
function alpha_grid_layouts_options($grid) {
  $output = array();
  if (!empty($grid['layouts'])) {
    foreach ($grid['layouts'] as $key => $info) {
      $output[$key] = check_plain($info['name']);
    }
  }
    
  return $output;
}

/**
 * A helper function to return a proper options array for a form.
 *   
 * @return 
 *   An array of available libraries.
 */
function alpha_library_options($libraries) {      
  $output = array();
  foreach ($libraries as $key => $info) {
    $output[$key] = check_plain($info['name']) . '<div class="description">' . $info['description'] . '</div>';
  }
  
  return $output;
}

/**
 * A helper function to return a proper options array for a form.
 * 
 * @param $grid
 *   The grid that you want to fetch the available containers for.
 *   
 * @return 
 *   An array of available containers.
 */
function alpha_container_options($grid) {
  $output = array();
  if (!empty($grid['columns'])) {
    foreach ($grid['columns'] as $count => $title) {
      $output[$count] = t('@count Columns', array('@count' => $count));
    }
  }
  
  return $output;
}

/**
 * A helper function to return a proper options array for a form.
 * 
 * @param $max
 *   The maximum number of columns that you want to cover.
 *   
 * @return 
 *   An array of available columns counts.
 */
function alpha_column_options($max = NULL) {
  $output = array();  
  if (isset($max)) {
    foreach (range(0, $max) as $width) {
      $output[$width] = t('@width Columns', array('@width' => $width));
    }
  }
  
  return $output;
}

/**
 * A helper function to return a proper options array for a form.
 * 
 * @return 
 *   An array of available zones.
 */
function alpha_zone_options($zones) {
  $output = array();
  foreach ($zones as $key => $info) {
    $output[$key] = check_plain($info['name']);
  }
  
  return $output;
}

/**
 * A helper function to return a proper options array for a form.
 * 
 * @return 
 *   An array of available regions.
 */
function alpha_region_options($regions) {
  $output = array();
  foreach ($regions as $region => $item) {
    $output[$region] = $item['name'];
  }
  
  return $output;
}

/**
 * A helper function to return a proper options array for a form.
 *
 * @return
 *   An array of available regions for a zone.
 */
function alpha_zone_regions($zone, $regions) {
  $matches = array();
  foreach ($regions as $region => $info) {
    if ($zone == $info['zone']) {
      $matches[$region] = $info;
    }
  }
  
  return alpha_region_options($matches);
}

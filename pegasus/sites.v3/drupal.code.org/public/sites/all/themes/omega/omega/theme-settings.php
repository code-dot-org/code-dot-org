<?php

/**
 * Implements hook_form_system_theme_settings_alter()
 */
function omega_form_system_theme_settings_alter(&$form, &$form_state) {
  $theme = alpha_get_theme();
  
  foreach($theme->regions as $region => $item) {
    $zone = $item['enabled'] ? $item['zone'] : '__unassigned__';
    $section = $item['enabled'] && $theme->zones[$item['zone']]['enabled'] ? $theme->zones[$item['zone']]['section'] : '__unassigned__';
    
    $form['alpha_settings']['structure'][$section][$zone]['regions'][$region]['alpha_region_' . $region . '_equal_height_element'] = array(
      '#type' => 'value',
      '#default_value' => $item['equal_height_element'],
      '#element_validate' => array('omega_theme_settings_validate_equal_height'),
      '#zone' => $zone != '__unassigned__' ? $zone : NULL,
    );
    
    $form['alpha_settings']['structure'][$section][$zone]['regions'][$region]['alpha_region_' . $region . '_equal_height_container'] = array(
      '#type' => 'checkbox',
      '#title' => t('Force equal height for all child elements'),
      '#description' => t('Force equal height for all blocks in this region.'),
      '#default_value' => $item['equal_height_container'],
      '#weight' => -10,
      '#states' => array(
        'visible' => array(
          ':input[name="alpha_libraries[omega_equalheights]"]' => array('checked' => TRUE),
        ),
      ),
    );
  }
   
  foreach ($theme->zones as $zone => $item) {
    $section = $item['enabled'] ? $item['section'] : '__unassigned__';
    
    $form['alpha_settings']['structure'][$section][$zone]['zone']['alpha_zone_' . $zone . '_equal_height_container'] = array(
      '#type' => 'checkbox',
      '#title' => t('Force equal height for all child elements.'),
      '#description' => t('Force equal height for all regions in this zone.'),
      '#default_value' => $item['equal_height_container'],
      '#weight' => -10,
      '#states' => array(
        'visible' => array(
          ':input[name="alpha_libraries[omega_equalheights]"]' => array('checked' => TRUE),
        ),
      ),
    );
  }
}

/**
 * @todo
 */
function omega_theme_settings_validate_equal_height($element, &$form_state) {
  $value = isset($element['#zone']) ? $form_state['values']['alpha_zone_' . $element['#zone'] . '_equal_height_container'] : FALSE;
  
  form_set_value($element, $value, $form_state);  
}

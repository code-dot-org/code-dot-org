<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_16_twocol_8_8_bricks_panels_layouts() {
  $items['omega_16_twocol_8_8_bricks'] = array(
    'title' => t('Two Column 8-8 bricks'),
    'category' => t('Omega: 16 Column Grid'),
    'icon' => 'omega_16_twocol_8_8_bricks.png',
    'theme' => 'omega_16_twocol_8_8_bricks',
    'admin css' => '../omega_panels_admin_16.css',
    'regions' => array(
      'top' => t('Top'),
      'left_above' => t('Left above'),
      'right_above' => t('Right above'),
      'middle' => t('Middle'),
      'left_below' => t('Left below'),
      'right_below' => t('Right below'),
      'bottom' => t('Bottom'),
    ),
  );

  return $items;
}

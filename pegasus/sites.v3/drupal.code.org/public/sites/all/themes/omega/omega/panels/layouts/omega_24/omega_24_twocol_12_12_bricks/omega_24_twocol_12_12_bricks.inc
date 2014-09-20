<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_24_twocol_12_12_bricks_panels_layouts() {
  $items['omega_24_twocol_12_12_bricks'] = array(
    'title' => t('Two Column 12-12 bricks'),
    'category' => t('Omega: 24 Column Grid'),
    'icon' => 'omega_24_twocol_12_12_bricks.png',
    'theme' => 'omega_24_twocol_12_12_bricks',
    'admin css' => '../omega_panels_admin_24.css',
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

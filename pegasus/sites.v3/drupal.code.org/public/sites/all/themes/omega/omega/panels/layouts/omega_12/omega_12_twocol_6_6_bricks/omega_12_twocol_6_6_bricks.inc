<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_12_twocol_6_6_bricks_panels_layouts() {
  $items['omega_12_twocol_6_6_bricks'] = array(
    'title' => t('Two Column 6-6 bricks'),
    'category' => t('Omega: 12 Column Grid'),
    'icon' => 'omega_12_twocol_6_6_bricks.png',
    'theme' => 'omega_12_twocol_6_6_bricks',
    'admin css' => '../omega_panels_admin_12.css',
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

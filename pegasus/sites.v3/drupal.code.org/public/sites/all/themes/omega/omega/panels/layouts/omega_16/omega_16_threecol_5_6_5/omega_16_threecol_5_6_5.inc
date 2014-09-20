<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_16_threecol_5_6_5_panels_layouts() {
  $items['omega_16_threecol_5_6_5'] = array(
    'title' => t('Three column 5-6-5'),
    'category' => t('Omega: 16 Column Grid'),
    'icon' => 'omega_16_threecol_5_6_5.png',
    'theme' => 'omega_16_threecol_5_6_5',
    'admin css' => '../omega_panels_admin_16.css',
    'regions' => array(
      'left' => t('Left side'),
      'middle' => t('Middle column'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

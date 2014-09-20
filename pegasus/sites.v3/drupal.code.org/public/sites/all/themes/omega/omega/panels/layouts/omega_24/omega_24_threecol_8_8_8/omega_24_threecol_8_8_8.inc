<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_24_threecol_8_8_8_panels_layouts() {
  $items['omega_24_threecol_8_8_8'] = array(
    'title' => t('Three column 8-8-8'),
    'category' => t('Omega: 24 Column Grid'),
    'icon' => 'omega_24_threecol_8_8_8.png',
    'theme' => 'omega_24_threecol_8_8_8',
    'admin css' => '../omega_panels_admin_24.css',
    'regions' => array(
      'left' => t('Left side'),
      'middle' => t('Middle column'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

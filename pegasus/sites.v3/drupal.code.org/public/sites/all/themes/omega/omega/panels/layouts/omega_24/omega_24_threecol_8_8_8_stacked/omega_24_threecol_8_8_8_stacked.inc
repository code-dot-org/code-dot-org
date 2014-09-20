<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_24_threecol_8_8_8_stacked_panels_layouts() {
  $items['omega_24_threecol_8_8_8_stacked'] = array(
    'title' => t('Three column 8-8-8 stacked'),
    'category' => t('Omega: 24 Column Grid'),
    'icon' => 'omega_24_threecol_8_8_8_stacked.png',
    'theme' => 'omega_24_threecol_8_8_8_stacked',
    'admin css' => '../omega_panels_admin_24.css',
    'regions' => array(
      'top' => t('Top'),
      'left' => t('Left side'),
      'middle' => t('Middle column'),
      'right' => t('Right side'),
      'bottom' => t('Bottom'),
    ),
  );

  return $items;
}

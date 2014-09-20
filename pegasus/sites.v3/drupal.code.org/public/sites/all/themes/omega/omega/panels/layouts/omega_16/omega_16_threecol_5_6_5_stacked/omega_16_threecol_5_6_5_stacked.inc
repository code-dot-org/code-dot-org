<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_16_threecol_5_6_5_stacked_panels_layouts() {
  $items['omega_16_threecol_5_6_5_stacked'] = array(
    'title' => t('Three column 5-6-5 stacked'),
    'category' => t('Omega: 16 Column Grid'),
    'icon' => 'omega_16_threecol_5_6_5_stacked.png',
    'theme' => 'omega_16_threecol_5_6_5_stacked',
    'admin css' => '../omega_panels_admin_16.css',
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

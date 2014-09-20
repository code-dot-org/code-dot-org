<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_12_threecol_4_4_4_stacked_panels_layouts() {
  $items['omega_12_threecol_4_4_4_stacked'] = array(
    'title' => t('Three column 4-4-4 stacked'),
    'category' => t('Omega: 12 Column Grid'),
    'icon' => 'omega_12_threecol_4_4_4_stacked.png',
    'theme' => 'omega_12_threecol_4_4_4_stacked',
    'admin css' => '../omega_panels_admin_12.css',
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

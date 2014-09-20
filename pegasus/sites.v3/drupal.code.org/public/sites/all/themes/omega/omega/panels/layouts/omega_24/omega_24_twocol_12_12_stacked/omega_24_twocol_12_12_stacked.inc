<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_24_twocol_12_12_stacked_panels_layouts() {
  $items['omega_24_twocol_12_12_stacked'] = array(
    'title' => t('Two Column 12-12 stacked'),
    'category' => t('Omega: 24 Column Grid'),
    'icon' => 'omega_24_twocol_12_12_stacked.png',
    'theme' => 'omega_24_twocol_12_12_stacked',
    'admin css' => '../omega_panels_admin_24.css',
    'regions' => array(
      'top' => t('Top'),
      'left' => t('Left'),
      'right' => t('Right'),
      'bottom' => t('Bottom'),
    ),
  );

  return $items;
}

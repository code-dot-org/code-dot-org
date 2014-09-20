<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_12_twocol_6_6_stacked_panels_layouts() {
  $items['omega_12_twocol_6_6_stacked'] = array(
    'title' => t('Two Column 6-6 stacked'),
    'category' => t('Omega: 12 Column Grid'),
    'icon' => 'omega_12_twocol_6_6_stacked.png',
    'theme' => 'omega_12_twocol_6_6_stacked',
    'admin css' => '../omega_panels_admin_12.css',
    'regions' => array(
      'top' => t('Top'),
      'left' => t('Left'),
      'right' => t('Right'),
      'bottom' => t('Bottom'),
    ),
  );

  return $items;
}

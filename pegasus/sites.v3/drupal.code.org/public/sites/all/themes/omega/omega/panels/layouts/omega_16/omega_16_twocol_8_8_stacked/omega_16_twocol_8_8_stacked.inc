<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_16_twocol_8_8_stacked_panels_layouts() {
  $items['omega_16_twocol_8_8_stacked'] = array(
    'title' => t('Two Column 8-8 stacked'),
    'category' => t('Omega: 16 Column Grid'),
    'icon' => 'omega_16_twocol_8_8_stacked.png',
    'theme' => 'omega_16_twocol_8_8_stacked',
    'admin css' => '../omega_panels_admin_16.css',
    'regions' => array(
      'top' => t('Top'),
      'left' => t('Left'),
      'right' => t('Right'),
      'bottom' => t('Bottom'),
    ),
  );

  return $items;
}

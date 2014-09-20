<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_16_twocol_12_4_panels_layouts() {
  $items['omega_16_twocol_12_4'] = array(
    'title' => t('Two Column 12-4'),
    'category' => t('Omega: 16 Column Grid'),
    'icon' => 'omega_16_twocol_12_4.png',
    'theme' => 'omega_16_twocol_12_4',
    'admin css' => '../omega_panels_admin_16.css',
    'regions' => array(
      'left' => t('Left side'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

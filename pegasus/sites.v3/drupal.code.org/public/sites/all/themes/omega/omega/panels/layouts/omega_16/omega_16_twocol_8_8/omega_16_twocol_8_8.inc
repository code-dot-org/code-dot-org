<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_16_twocol_8_8_panels_layouts() {
  $items['omega_16_twocol_8_8'] = array(
    'title' => t('Two Column 8-8'),
    'category' => t('Omega: 16 Column Grid'),
    'icon' => 'omega_16_twocol_8_8.png',
    'theme' => 'omega_16_twocol_8_8',
    'admin css' => '../omega_panels_admin_16.css',
    'regions' => array(
      'left' => t('Left side'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

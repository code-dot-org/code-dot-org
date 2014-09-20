<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_24_twocol_18_6_panels_layouts() {
  $items['omega_24_twocol_18_6'] = array(
    'title' => t('Two Column 18-6'),
    'category' => t('Omega: 24 Column Grid'),
    'icon' => 'omega_24_twocol_18_6.png',
    'theme' => 'omega_24_twocol_18_6',
    'admin css' => '../omega_panels_admin_24.css',
    'regions' => array(
      'left' => t('Left side'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

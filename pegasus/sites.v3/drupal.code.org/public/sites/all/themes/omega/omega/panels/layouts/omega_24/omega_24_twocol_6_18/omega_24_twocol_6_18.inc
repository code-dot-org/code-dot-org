<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_24_twocol_6_18_panels_layouts() {
  $items['omega_24_twocol_6_18'] = array(
    'title' => t('Two Column 6-18'),
    'category' => t('Omega: 24 Column Grid'),
    'icon' => 'omega_24_twocol_6_18.png',
    'theme' => 'omega_24_twocol_6_18',
    'admin css' => '../omega_panels_admin_24.css',
    'regions' => array(
      'left' => t('Left side'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

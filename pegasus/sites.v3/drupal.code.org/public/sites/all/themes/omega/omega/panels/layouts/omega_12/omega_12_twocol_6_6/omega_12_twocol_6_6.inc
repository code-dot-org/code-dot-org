<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_12_twocol_6_6_panels_layouts() {
  $items['omega_12_twocol_6_6'] = array(
    'title' => t('Two Column 6-6'),
    'category' => t('Omega: 12 Column Grid'),
    'icon' => 'omega_12_twocol_6_6.png',
    'theme' => 'omega_12_twocol_6_6',
    'admin css' => '../omega_panels_admin_12.css',
    'regions' => array(
      'left' => t('Left side'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

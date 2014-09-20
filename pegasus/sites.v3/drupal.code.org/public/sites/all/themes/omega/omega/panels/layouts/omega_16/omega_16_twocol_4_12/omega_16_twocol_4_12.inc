<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_16_twocol_4_12_panels_layouts() {
  $items['omega_16_twocol_4_12'] = array(
    'title' => t('Two Column 4-12'),
    'category' => t('Omega: 16 Column Grid'),
    'icon' => 'omega_16_twocol_4_12.png',
    'theme' => 'omega_16_twocol_4_12',
    'admin css' => 'omega_16_twocol_4_12.css',
    'regions' => array(
      'left' => t('Left side'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

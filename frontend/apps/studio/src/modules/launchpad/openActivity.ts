import {Capacitor, registerPlugin} from '@capacitor/core';

import type {Activity} from '@/modules/launchpad/activities';

interface CuratedActivitiesPlugin {
  open(
    options: Pick<Activity, 'url' | 'title' | 'allowedPaths'>,
  ): Promise<void>;
}

const curatedActivities =
  registerPlugin<CuratedActivitiesPlugin>('CuratedActivities');

export async function openActivity(activity: Activity): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('The embedded activity view requires an installed app.');
  }
  await curatedActivities.open({
    url: activity.url,
    title: activity.title,
    allowedPaths: activity.allowedPaths,
  });
}

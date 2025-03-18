import {StatsigAutoCapturePlugin} from '@statsig/web-analytics';
import {AutoCaptureEvent} from '@statsig/web-analytics/src/AutoCaptureEvent';

function autoCaptureFilter(event: AutoCaptureEvent): boolean {
  return event?.eventName === 'auto_capture::page_view';
}

export default new StatsigAutoCapturePlugin({
  eventFilterFunc: autoCaptureFilter,
});

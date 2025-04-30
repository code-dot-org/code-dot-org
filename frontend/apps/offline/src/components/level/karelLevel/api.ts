import {API_FUNCTION} from '@/components/level/mazeLevel/api';

/**
 * Collects an item, if it is there, otherwise fail to collect!
 */
export function collect(id: string) {
  API_FUNCTION.bind(this)(() => {
    const col = this.controller.getPegmanX();
    const row = this.controller.getPegmanY();
    if (this.controller.subtype.tryCollect(row, col)) {
      this.executionInfo.queueAction('pickup', id);
    } else {
      this.executionInfo.queueAction('fail_pickup', id);
    }
  });
}

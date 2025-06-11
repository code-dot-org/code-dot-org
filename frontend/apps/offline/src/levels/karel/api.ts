import type {Collector} from '@code-dot-org/maze';

// We reuse the Maze functions and just add new functionality
import {APIGlobals, API_FUNCTION} from '@/levels/maze/api';

/**
 * Collects an item, if it is there, otherwise fail to collect!
 */
export function collect(this: APIGlobals, id: string) {
  API_FUNCTION.bind(this)(() => {
    const col = this.controller.getPegmanX();
    const row = this.controller.getPegmanY();
    if ((this.controller.subtype as Collector).tryCollect(row, col)) {
      this.executionInfo.queueAction('pickup', id);
    } else {
      this.executionInfo.queueAction('fail_pickup', id);
    }
  });
}

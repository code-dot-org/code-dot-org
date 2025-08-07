import {api} from '@code-dot-org/lab-maze';
import type {Cell, Collector} from '@code-dot-org/lab-maze';

// We reuse the Maze functions and just add new functionality

/**
 * Collects an item, if it is there, otherwise fail to collect!
 */
export function collect(this: api.APIGlobals, id: string) {
  api.API_FUNCTION.bind(this)(() => {
    const col = this.controller.getPegmanX() || 0;
    const row = this.controller.getPegmanY() || 0;
    if ((this.controller.subtype as Collector<Cell>).tryCollect(row, col)) {
      this.executionInfo.queueAction('pickup', id);
    } else {
      this.executionInfo.queueAction('fail_pickup', id);
    }
  });
}

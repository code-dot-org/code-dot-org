import type {InterpreterObject} from '@code-dot-org/js-interpreter';

import type {MarshalObject} from './CustomMarshaler';
import CustomMarshaler from './CustomMarshaler';
import CustomMarshalingInterpreter from './CustomMarshalingInterpreter';
import ExecutionInfo from './ExecutionInfo';

export interface MarshalEvent {
  code: string | string[];
  args?: string[];
}

export interface MarshalEvents {
  [key: string]: MarshalEvent;
}

/**
 * Generate code for each of the given events, and evaluate it using the
 * provided APIs as context. Note that this does not currently support custom marshaling.
 *
 * @param scope - Context to be set as globals in the interpreted runtime.
 * @param events - Mapping of hook names to the corresponding handler code.
 * @param [evalCode] - Optional extra code to evaluate.
 * @return Mapping of hook names to the corresponding event handler, and the interpreter that was created to evaluate the code.
 */
export function evalWithEvents(
  scope: {
    executionInfo?: ExecutionInfo;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  },
  events: MarshalEvents,
  evalCode: string = '',
  customMarshalObjectList?: MarshalObject[],
): {
  hooks: {
    name: string;
    func: () => void;
  }[];
  interpreter: CustomMarshalingInterpreter;
} {
  let currentCallback: ((_: InterpreterObject) => void) | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastReturnValue: any | undefined;

  const hooks: {
    name: string;
    func: () => void;
  }[] = [];
  const apis = {
    ...scope,
  };

  Object.keys(events).forEach(event => {
    const {code, args} = events[event];

    (typeof code === 'string' ? [code] : code).forEach((c, index) => {
      const eventId = `${event}-${index}`;
      // Create a hook that triggers an event inside the interpreter.
      hooks.push({
        name: event,
        func: (...args) => {
          const eventArgs = {name: eventId, args};
          currentCallback?.(
            interpreter.marshalNativeToInterpreter(eventArgs, null, 5),
          );
          interpreter.run();
          return lastReturnValue;
        },
      });

      evalCode += `this['${eventId}']=function(${
        args ? args.join() : ''
      }){${c}};`;
    });
  });

  // The event loop pauses the interpreter until the native async function
  // `currentCallback` returns a value. The value contains the name of the event
  // to call, and any arguments.
  const eventLoop =
    ';while(true){var _event=_wait();setReturnValue(this[_event.name].apply(null,_event.args));}';

  const interpreter = new CustomMarshalingInterpreter(
    evalCode + eventLoop,
    new CustomMarshaler({objectList: customMarshalObjectList}),
    (interpreter, scope) => {
      interpreter.marshalNativeToInterpreterObject(apis, 5, scope);
      interpreter.setProperty(
        scope,
        '_wait',
        interpreter.createAsyncFunction(
          (callback: (_: InterpreterObject) => void) => {
            currentCallback = callback;
          },
        ),
      );
      interpreter.setProperty(
        scope,
        'setReturnValue',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        interpreter.createNativeFunction((returnValue: any | undefined) => {
          lastReturnValue = interpreter.marshalInterpreterToNative(returnValue);
        }),
      );
    },
  );
  interpreter.run();

  return {hooks, interpreter};
}

import CustomMarshaler from './CustomMarshaler';
import CustomMarshalingInterpreter from './CustomMarshalingInterpreter';
import ExecutionInfo from './ExecutionInfo';

export function evalWith(
  code: string,
  scope: {
    executionInfo?: ExecutionInfo;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  },
  options?: {
    asyncFunctionList?: string[];
    runMaxSteps?: number;
  },
) {
  const globals = {
    ...scope,
  };

  console.log('CODE', code);
  console.log('GLOBALS', globals);

  const interpreter = new CustomMarshalingInterpreter(
    `(function () { ${code} })()`,
    new CustomMarshaler({}),
    (interpreter, scope) => {
      interpreter.asyncFunctionList = options?.asyncFunctionList || [];
      interpreter.marshalNativeToInterpreterObject(globals, 5, scope);
    },
  );

  if (options?.runMaxSteps) {
    let stepCount = 0;
    while (interpreter.step() && stepCount++ < options.runMaxSteps);
    if (stepCount >= options.runMaxSteps) {
      console.log('evalWith: exceeded step count.');
    }
  } else {
    console.log(interpreter);
    interpreter.run();
  }

  return interpreter;
}

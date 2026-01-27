declare module '@code-dot-org/js-interpreter' {
  export interface MakeNativeOptions {
    dontMarshal?: boolean;
    maxDepth?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nativeFunc: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nativeParentObj: any;
    nativeIsAsync?: boolean;
    nativeCallsBackInterpreter?: boolean;
    run?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface InterpreterObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    isCustomMarshal?: boolean;
    type?: string;
    toBoolean?: () => boolean;
    toNumber?: () => number;
    toString?: () => string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    valueOf?: () => any;
    properties?: InterpreterObject[];
    length?: number;
  }

  export interface InterpreterScope {
    parentScope?: InterpreterScope;
    strict: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface ASTNode {
    type: string;
    end: number;
    operator?: string;
    declarations?: ASTNode[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arguments?: any[];
    init?: ASTNode;
    id?: {
      name: string;
    };
  }

  export interface StateStack {
    node: ASTNode;
    scope?: InterpreterScope;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisExpression?: any;
    done?: boolean;
    done_?: boolean;
    n_?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    func_?: any;
    doneCallee_?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arguments_?: any[];
  }

  export class Interpreter {
    paused_: boolean;
    constructor(
      code: string,
      callback: (thisInterpreter: Interpreter, scope: InterpreterScope) => void,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createObject(value?: any): InterpreterObject;
    functionMap_: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: (...args: any[]) => any;
    };
    stepVariableDeclaration(): void;
    stepVariableDeclarator(): void;
    ast?: ASTNode;
    stateStack: StateStack[];
    getStackDepth(): number;
    step();
    UNDEFINED: InterpreterObject;
    OBJECT: InterpreterObject;
    FUNCTION: InterpreterObject;
    ARRAY: InterpreterObject;
    REFERENCE_ERROR: InterpreterObject;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(left: [any, string] | object, value: any, declarator?: boolean);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValueToScope(left: string | object, value: any, declarator?: boolean);
    getScope(): InterpreterScope;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getProperty(obj: any, name: string): object | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hasProperty(obj: any, name: string): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setProperty(obj: any, name: string, value: any, opt_descriptor?: object);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createPrimitive(value: any): InterpreterObject;
    global: InterpreterScope;
    createScope(
      node: ASTNode,
      parentScope?: InterpreterScope,
    ): InterpreterScope;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throwException(errorClass: any, opt_message?: string): void;
    isa(a: InterpreterObject, b: object): boolean;
    makeNativeMemberFunction(makeNativeOpts: MakeNativeOptions): object;
    createAsyncFunction(wrapper: object): InterpreterObject;
    createNativeFunction(wrapper: object): InterpreterObject;
    run();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static Object: any;
  }

  export default Interpreter;
}

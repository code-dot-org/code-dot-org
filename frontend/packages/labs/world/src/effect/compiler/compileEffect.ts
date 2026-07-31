import {buildParameterUniformNames} from '../glsl/symbols';
import {
  applySwizzle,
  coerce,
  parameterValueType,
  componentsOf,
  formatLiteral,
  swizzleFits,
  swizzleLabel,
  swizzleResultType,
  widen,
} from '../glsl/valueTypes';
import {translate} from '../localization';
import {
  GHOST_PORT,
  OUTPUT_NODE_ID,
  functionIdFromNodeType,
  isGhostNodeId,
  parameterIdFromNodeId,
} from '../model/constants';
import type {
  EffectDocument,
  EffectFunction,
  EffectGraphNode,
  EffectGraphScope,
  EffectLiteral,
  EffectValueType,
} from '../model/types';
import {defaultNodeRegistry} from '../nodes/definitions/index';
import {functionNodeDefinition} from '../nodes/functions';
import {ghostForNodeId} from '../nodes/ghosts';
import type {
  EffectEmitContext,
  EffectNodeDefinition,
  EffectPortDefinition,
} from '../nodes/types';

import {buildFragmentShader, visualizeAsColor} from './template';
import {
  EffectCompileError,
  type CompiledEffect,
  type EffectCompileOptions,
  type EffectUniformDescriptor,
} from './types';

/** What emitting a node produced: an expression and a type per output port. */
interface EmittedNode {
  outputs: Record<string, string>;
  types: Record<string, EffectValueType>;
}

interface WalkSource {
  expression: string;
  type: EffectValueType;
}

/** One scope's demand-driven walk: the main graph, or one function body. */
interface ScopeWalker {
  /** Statements accumulated for this scope's `main()` or function body. */
  body: string[];
  emittedNodeIds: string[];
  emitNode(nodeId: string): EmittedNode;
  /** Follow the wire into a port, emitting whatever is upstream. */
  sourceOf(nodeId: string, portId: string): WalkSource | null;
  /** Concrete types per emitted node, for wire coloring. */
  resolvedTypes(): Record<string, Record<string, EffectValueType>>;
}

/**
 * Compile an effect graph to a GLSL fragment shader.
 *
 * The walk is demand-driven from the output: only nodes that actually reach
 * `gl_FragColor` are emitted, so a learner can leave half-built experiments
 * around the workspace without breaking the effect or paying for them on the
 * GPU.
 *
 * Functions compile the same way, recursively: a `fn:` node's first use
 * compiles that function's body into a GLSL helper (its own walker, its own
 * scope, ghosts resolving to arguments instead of uniforms) and every use
 * becomes a call. Lazy compilation is also what orders the output — a helper
 * a function depends on is compiled, and therefore declared, before it.
 */
export function compileEffect(
  document: EffectDocument,
  options: EffectCompileOptions = {},
): CompiledEffect {
  // Function definitions are derived from the document, like parameter ghosts;
  // extending here means callers never have to remember to.
  const registry = (options.registry ?? defaultNodeRegistry).extend(
    document.functions.map(functionNodeDefinition),
  );

  const uniformNames = buildParameterUniformNames(document.parameters);
  const usedParameterIds = new Set<string>();

  /** Top-level GLSL declarations, in dependency order. Shared by all scopes. */
  const helpers = new Map<string, string>();
  const helperNamesTaken = new Set<string>();
  /** Compiled function helper names by function id. */
  const functionNames = new Map<string, string>();
  /** Functions currently on the compilation stack, for cycle detection. */
  const compilingFunctions = new Set<string>();
  const functionResolvedTypes: CompiledEffect['functionResolvedTypes'] = {};

  function createWalker(
    scope: EffectGraphScope,
    emitGhost: (nodeId: string) => EmittedNode,
  ): ScopeWalker {
    const nodesById = new Map(scope.nodes.map(node => [node.id, node]));
    // Input ports hold at most one wire, so the reverse index is one-to-one.
    const edgesByTarget = new Map(
      scope.edges.map(edge => [
        portKey(edge.target.node, edge.target.port),
        edge,
      ]),
    );
    const emitted = new Map<string, EmittedNode>();
    const emittedNodeIds: string[] = [];
    const visiting = new Set<string>();
    const body: string[] = [];
    // Locals are GLSL-scope-local (main or one helper), so each walker counts
    // its own without risk of cross-scope collision.
    let localCounter = 0;
    const takenNames = new Set<string>();

    /** A unique local name in this scope, as close to `base` as available. */
    function allocateName(base: string): string {
      let name = base;
      let suffix = 2;
      while (takenNames.has(name)) {
        name = `${base}_${suffix}`;
        suffix += 1;
      }
      takenNames.add(name);
      return name;
    }

    function definitionFor(nodeId: string): {
      definition: EffectNodeDefinition;
      node: EffectGraphNode;
    } {
      const node = nodesById.get(nodeId);
      if (!node) {
        throw new EffectCompileError(
          translate('Missing node "{id}".', {id: nodeId}),
          {node: nodeId},
        );
      }
      const definition = registry.get(node.type);
      if (!definition) {
        throw new EffectCompileError(
          translate('"{type}" is not a node this editor knows how to build.', {
            type: node.type,
          }),
          {node: nodeId},
        );
      }
      return {definition, node};
    }

    function sourceOf(nodeId: string, portId: string): WalkSource | null {
      const edge = edgesByTarget.get(portKey(nodeId, portId));
      if (!edge) {
        return null;
      }
      const upstream = emitNode(edge.source.node);
      const expression = upstream.outputs[edge.source.port];
      const type = upstream.types[edge.source.port];
      if (expression === undefined || type === undefined) {
        throw new EffectCompileError(
          translate('"{port}" is not an output of node "{id}".', {
            port: edge.source.port,
            id: edge.source.node,
          }),
          edge.source,
        );
      }

      const {swizzle} = edge.source;
      if (swizzle) {
        // A generic source can narrow after the wire was drawn — the Multiply
        // that resolved vec4 yesterday may resolve vec2 today, leaving a `.w`
        // with nothing behind it.
        //
        // Down to a single number is the forgiving case: there is only one
        // value the selection could mean, and GLSL will not let a component of
        // a scalar be named at all, so carry it through. Anything else is
        // reported at the wire rather than emitted as GLSL the driver rejects.
        if (type === 'float') {
          return {expression, type};
        }
        if (!swizzleFits(type, swizzle)) {
          throw new EffectCompileError(
            translate(
              'This wire takes {picked} from a value that only has {available}.',
              {
                // Spelled against what the source carries *now*, which is what
                // the wire's own badge shows.
                picked: swizzleLabel(type, swizzle),
                available: componentsOf(type),
              },
            ),
            {node: edge.target.node, port: edge.target.port},
          );
        }
        return {
          expression: applySwizzle(expression, swizzle),
          type: swizzleResultType(swizzle),
        };
      }

      return {expression, type};
    }

    /**
     * Resolve every input port of a node: follow each wire, pick the concrete
     * type for generic ports, and coerce each incoming expression to it.
     */
    function resolveInputs(
      definition: EffectNodeDefinition,
      node: EffectGraphNode,
    ): {
      inputs: Record<string, string>;
      types: Record<string, EffectValueType>;
    } {
      const sources = new Map<string, WalkSource>();
      for (const input of definition.inputs) {
        const source = sourceOf(node.id, input.id);
        if (source) {
          sources.set(input.id, source);
        }
      }

      const genericType = resolveGenericType(definition, sources, node.id);

      const inputs: Record<string, string> = {};
      const types: Record<string, EffectValueType> = {};

      for (const input of definition.inputs) {
        const targetType = concreteType(input.type, genericType);
        types[input.id] = targetType;

        // Function-node ports carry the learner's own input names; only stock
        // port labels are ours to translate.
        const displayLabel =
          definition.category === 'function'
            ? input.label
            : translate(input.label);

        const source = sources.get(input.id);
        if (source) {
          const converted = coerce(source.expression, source.type, targetType);
          if (converted === null) {
            throw new EffectCompileError(
              translate(
                'This wire carries a {source} but "{name}" needs a {target}.',
                {source: source.type, name: displayLabel, target: targetType},
              ),
              {node: node.id, port: input.id},
            );
          }
          inputs[input.id] = converted;
          continue;
        }

        inputs[input.id] = literalExpression(
          input,
          targetType,
          node,
          displayLabel,
        );
      }

      for (const output of definition.outputs) {
        types[output.id] = concreteType(output.type, genericType);
      }

      return {inputs, types};
    }

    function emitNode(nodeId: string): EmittedNode {
      const cached = emitted.get(nodeId);
      if (cached) {
        return cached;
      }

      if (visiting.has(nodeId)) {
        throw new EffectCompileError(
          translate(
            'These nodes are wired in a loop, so there is no order to run them in.',
          ),
          {node: nodeId},
        );
      }
      visiting.add(nodeId);

      const result = isGhostNodeId(nodeId)
        ? emitGhost(nodeId)
        : emitWorkspaceNode(nodeId);

      visiting.delete(nodeId);
      emitted.set(nodeId, result);
      emittedNodeIds.push(nodeId);
      return result;
    }

    /**
     * Name a node's computed outputs as locals, one line per result.
     *
     * Without this, every node inlines into its consumer and the whole graph
     * collapses into one unreadable expression on the `gl_FragColor` line.
     * A named local per node keeps the shader readable as the graph it came
     * from — and since consumers now share the name rather than re-evaluating
     * the expression, a node wired to two places also runs once, not twice.
     *
     * Already-simple outputs (an identifier, a swizzle, a number) stay
     * inline: `float split_1_y = split_1.y;` is noise, not clarity.
     */
    function bindOutputs(nodeId: string, result: EmittedNode): EmittedNode {
      const portIds = Object.keys(result.outputs);
      const outputs: Record<string, string> = {};

      for (const [portId, expression] of Object.entries(result.outputs)) {
        const type = result.types[portId];
        // Samplers cannot be locals in GLSL ES 1.00; they only ever flow
        // through as identifiers anyway.
        if (!type || type === 'sampler2D' || isTrivialExpression(expression)) {
          outputs[portId] = expression;
          continue;
        }

        const base =
          glslIdentifier(nodeId) + (portIds.length > 1 ? `_${portId}` : '');
        const name = allocateName(base);
        body.push(`${type} ${name} = ${expression};`);
        outputs[portId] = name;
      }

      return {outputs, types: result.types};
    }

    function emitWorkspaceNode(nodeId: string): EmittedNode {
      const {definition, node} = definitionFor(nodeId);

      // Resolving inputs walks upstream and emits those nodes first, so this
      // has to happen before the mark below: everything it appends belongs to
      // other nodes.
      const {inputs, types} = resolveInputs(definition, node);
      const ownStatementsStart = body.length;

      // Function calls are the compiler's own business: their emission needs
      // the shared helper sink and cycle tracking no definition can carry.
      const functionId = functionIdFromNodeType(node.type);
      const raw =
        functionId !== null
          ? emitFunctionCall(functionId, nodeId, {inputs, types})
          : {
              outputs: definition.emit({
                nodeId,
                inputs,
                types,
                local: hint => {
                  localCounter += 1;
                  return allocateName(`${hint}_${localCounter}`);
                },
                statement: glsl => {
                  body.push(glsl);
                },
                helper: (name, source) => {
                  if (!helpers.has(name)) {
                    helpers.set(name, source);
                    helperNamesTaken.add(name);
                  }
                },
              } satisfies EffectEmitContext),
              types,
            };

      const result = bindOutputs(nodeId, raw);

      // A node's note explains what it is doing *here*, which is exactly what
      // a reader of the generated shader wants to know. Inserted after the
      // fact, at the point this node's own statements began, so it captions
      // them rather than whatever happened to be emitted upstream — and only
      // when there are some statements to caption.
      const note = node.note?.trim();
      if (note && body.length > ownStatementsStart) {
        body.splice(ownStatementsStart, 0, ...commentLines(note));
      }

      return result;
    }

    return {
      body,
      emittedNodeIds,
      emitNode,
      sourceOf,
      resolvedTypes: () => {
        const types: Record<string, Record<string, EffectValueType>> = {};
        for (const [nodeId, emittedNode] of emitted) {
          types[nodeId] = emittedNode.types;
        }
        return types;
      },
    };
  }

  // --- Function bodies -----------------------------------------------------

  function emitFunctionCall(
    functionId: string,
    nodeId: string,
    resolved: {
      inputs: Record<string, string>;
      types: Record<string, EffectValueType>;
    },
  ): EmittedNode {
    const fn = document.functions.find(
      candidate => candidate.id === functionId,
    );
    if (!fn) {
      throw new EffectCompileError(
        translate('This node calls a function that no longer exists.'),
        {node: nodeId},
      );
    }
    if (compilingFunctions.has(functionId)) {
      throw new EffectCompileError(
        translate(
          '"{name}" cannot use itself, even through another function — it would never finish.',
          {name: fn.name},
        ),
        {node: nodeId},
      );
    }

    const helperName = ensureFunctionCompiled(fn);
    const {inputs, types} = resolved;
    const args = fn.parameters.map(input => inputs[input.id]);
    return {
      outputs: {out: `${helperName}(${args.join(', ')})`},
      types,
    };
  }

  function ensureFunctionCompiled(fn: EffectFunction): string {
    const known = functionNames.get(fn.id);
    if (known !== undefined) {
      return known;
    }

    compilingFunctions.add(fn.id);
    try {
      const argNames = buildParameterUniformNames(fn.parameters, 'p_');
      const walker = createWalker(fn, nodeId =>
        emitFunctionGhost(fn, argNames, nodeId),
      );

      const source = walker.sourceOf(OUTPUT_NODE_ID, GHOST_PORT);
      if (!source) {
        throw new EffectCompileError(
          translate('Nothing is connected to the output of "{name}" yet.', {
            name: fn.name,
          }),
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        );
      }
      const returned = coerce(source.expression, source.type, fn.outputType);
      if (returned === null) {
        throw new EffectCompileError(
          translate(
            '"{name}" returns a {target}, but its output is wired to a {source}.',
            {name: fn.name, target: fn.outputType, source: source.type},
          ),
          {node: OUTPUT_NODE_ID, port: GHOST_PORT},
        );
      }

      const base = `fn_${fn.id.replace(/[^A-Za-z0-9_]/g, '_')}`;
      let name = base;
      let suffix = 2;
      while (helperNamesTaken.has(name)) {
        name = `${base}_${suffix}`;
        suffix += 1;
      }
      helperNamesTaken.add(name);

      const parameterList = fn.parameters
        .map(
          input =>
            `${parameterValueType(input.type)} ${argNames.get(input.id)}`,
        )
        .join(', ');
      helpers.set(
        name,
        [
          `${fn.outputType} ${name}(${parameterList})`,
          '{',
          ...walker.body.map(statement => `    ${statement}`),
          `    return ${returned};`,
          '}',
        ].join('\n'),
      );

      functionNames.set(fn.id, name);
      functionResolvedTypes[fn.id] = walker.resolvedTypes();
      return name;
    } catch (error) {
      // Tag the innermost function so the editor can highlight the right
      // workspace; the prefix tells the learner where to look either way.
      if (
        error instanceof EffectCompileError &&
        error.functionId === undefined
      ) {
        error.functionId = fn.id;
        error.message = translate('In "{name}": {message}', {
          name: fn.name,
          message: error.message,
        });
      }
      throw error;
    } finally {
      compilingFunctions.delete(fn.id);
    }
  }

  /** Inside a function, ghosts are its declared inputs — nothing else. */
  function emitFunctionGhost(
    fn: EffectFunction,
    argNames: Map<string, string>,
    nodeId: string,
  ): EmittedNode {
    const parameterId = parameterIdFromNodeId(nodeId);
    if (parameterId !== null) {
      const input = fn.parameters.find(
        candidate => candidate.id === parameterId,
      );
      const argument = argNames.get(parameterId);
      if (!input || argument === undefined) {
        throw new EffectCompileError(
          translate('This function has no input named "{id}".', {
            id: parameterId,
          }),
          {node: nodeId},
        );
      }
      return {
        outputs: {[GHOST_PORT]: argument},
        types: {[GHOST_PORT]: parameterValueType(input.type)},
      };
    }

    const ghost = ghostForNodeId(document, nodeId);
    throw new EffectCompileError(
      translate(
        '"{name}" is not available inside a function — add an input to the function and wire it in from the outside.',
        {name: ghost ? translate(ghost.label) : nodeId},
      ),
      {node: nodeId},
    );
  }

  // --- The main scope ------------------------------------------------------

  /** Main-scope ghosts resolve to uniforms, varyings, and parameters. */
  function emitDocumentGhost(nodeId: string): EmittedNode {
    const ghost = ghostForNodeId(document, nodeId);
    if (!ghost || ghost.role !== 'source') {
      throw new EffectCompileError(
        translate('"{id}" is not something a wire can come from.', {
          id: nodeId,
        }),
        {node: nodeId},
      );
    }

    const parameterId = parameterIdFromNodeId(nodeId);
    if (parameterId !== null) {
      const uniform = uniformNames.get(parameterId);
      if (uniform === undefined) {
        throw new EffectCompileError(
          translate('This effect has no parameter named "{id}".', {
            id: parameterId,
          }),
          {node: nodeId},
        );
      }
      usedParameterIds.add(parameterId);
      return {
        outputs: {[GHOST_PORT]: uniform},
        types: {[GHOST_PORT]: ghost.type},
      };
    }

    return {
      outputs: {[GHOST_PORT]: ghost.glsl as string},
      types: {[GHOST_PORT]: ghost.type},
    };
  }

  const mainWalker = createWalker(document, emitDocumentGhost);

  // --- Drive the walk from whichever port is being rendered. ---

  const target = options.inspect;
  let color: string;

  if (target) {
    const emittedTarget = mainWalker.emitNode(target.node);
    const expression = emittedTarget.outputs[target.port];
    const type = emittedTarget.types[target.port];
    if (expression === undefined || type === undefined) {
      throw new EffectCompileError(
        `"${target.port}" is not an output of node "${target.node}".`,
        target,
      );
    }
    color = visualizeAsColor(expression, type, target);
  } else {
    const source = mainWalker.sourceOf(OUTPUT_NODE_ID, GHOST_PORT);
    if (!source) {
      throw new EffectCompileError(
        translate('Nothing is connected to the Output yet.'),
        {node: OUTPUT_NODE_ID, port: GHOST_PORT},
      );
    }
    // The output is forgiving about type on purpose: a learner who wires a
    // brightness value straight to the Output should see it as gray, not a
    // type error. `visualizeAsColor` is the same rule the eye inspector uses.
    color = visualizeAsColor(source.expression, source.type, {
      node: OUTPUT_NODE_ID,
      port: GHOST_PORT,
    });
    mainWalker.emittedNodeIds.push(OUTPUT_NODE_ID);
  }

  // Uniforms are declared with the GLSL type, not the authoring type: `bool`
  // and `int` knobs are float uniforms carrying 0/1 and whole numbers.
  const parameterUniforms = document.parameters.map(
    parameter =>
      `uniform ${parameterValueType(parameter.type)} ${uniformNames.get(
        parameter.id,
      )};`,
  );

  const fragmentSource = buildFragmentShader({
    precision: options.precision ?? 'highp',
    parameterUniforms,
    helpers: [...helpers.values()],
    body: mainWalker.body,
    color,
  });

  const parameters: EffectUniformDescriptor[] = document.parameters.map(
    parameter => ({
      name: uniformNames.get(parameter.id) as string,
      parameterId: parameter.id,
      label: parameter.name,
      type: parameterValueType(parameter.type),
      kind: parameter.type,
      defaultValue: parameter.defaultValue,
      min: parameter.min,
      max: parameter.max,
      used: usedParameterIds.has(parameter.id),
    }),
  );

  return {
    fragmentSource,
    parameters,
    usesTime: referencesIdentifier(fragmentSource, 'uTime'),
    usesEffectTime: referencesIdentifier(fragmentSource, 'uEffectTime'),
    emittedNodeIds: mainWalker.emittedNodeIds,
    resolvedPortTypes: mainWalker.resolvedTypes(),
    functionResolvedTypes,
  };
}

function portKey(nodeId: string, portId: string): string {
  return `${nodeId} ${portId}`;
}

/**
 * A note as GLSL line comments, one per line of the note.
 *
 * Line comments rather than `/* … *\/` so nothing a learner types can close
 * the comment early and spill into the shader as code.
 */
function commentLines(note: string): string[] {
  return note.split(/\r?\n/).map(line => `// ${line.trim()}`);
}

/** A node id as a GLSL identifier: `multiply-2` → `multiply_2`. */
function glslIdentifier(nodeId: string): string {
  const name = nodeId.replace(/[^A-Za-z0-9]+/g, '_');
  return /^[A-Za-z_]/.test(name) ? name : `n_${name}`;
}

/**
 * An expression already readable at a glance: an identifier with optional
 * member accesses (`uTime`, `split_1.y`) or a plain number. Naming these
 * would add lines without adding clarity.
 */
function isTrivialExpression(expression: string): boolean {
  return (
    /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$/.test(expression) ||
    /^-?(\d+\.?\d*|\.\d+)$/.test(expression)
  );
}

function concreteType(
  declared: EffectPortDefinition['type'],
  genericType: EffectValueType,
): EffectValueType {
  return declared === 'generic' ? genericType : declared;
}

/**
 * The single type shared by a node's generic ports.
 *
 * Only wired inputs vote. Literals broadcast, so letting them vote would mean
 * a scalar default on an unwired port overruling the vec4 actually flowing
 * through the node.
 */
function resolveGenericType(
  definition: EffectNodeDefinition,
  sources: Map<string, WalkSource>,
  nodeId: string,
): EffectValueType {
  let resolved: EffectValueType | null = null;

  for (const input of definition.inputs) {
    if (input.type !== 'generic') {
      continue;
    }
    const source = sources.get(input.id);
    if (!source) {
      continue;
    }
    if (resolved === null) {
      resolved = source.type;
      continue;
    }

    const widened = widen(resolved, source.type);
    if (widened === null) {
      throw new EffectCompileError(
        translate(
          'This node is being given a {first} and a {second} at once, which cannot be combined.',
          {first: resolved, second: source.type},
        ),
        {node: nodeId, port: input.id},
      );
    }
    resolved = widened;
  }

  // Nothing wired in: a graph of pure literals is scalar math.
  return resolved ?? 'float';
}

/** The GLSL literal for an unwired input, from the node override or the default. */
function literalExpression(
  input: EffectPortDefinition,
  targetType: EffectValueType,
  node: EffectGraphNode,
  displayLabel: string,
): string {
  if (targetType === 'sampler2D') {
    throw new EffectCompileError(
      translate('"{name}" needs a texture wired into it.', {
        name: displayLabel,
      }),
      {node: node.id, port: input.id},
    );
  }

  const override: EffectLiteral | undefined = node.params?.[input.id];
  const value = override ?? input.defaultValue;

  if (value === undefined) {
    throw new EffectCompileError(
      translate('"{name}" needs something wired into it.', {
        name: displayLabel,
      }),
      {node: node.id, port: input.id},
    );
  }

  return formatLiteral(value, targetType);
}

/**
 * Whether the shader body uses an identifier.
 *
 * Every uniform is declared whether or not it is read, so a single occurrence
 * is the declaration; a real use means a second one.
 */
function referencesIdentifier(source: string, identifier: string): boolean {
  const matches = source.match(new RegExp(`\\b${identifier}\\b`, 'g'));
  return (matches?.length ?? 0) > 1;
}

// A way to write a stock `.rule` that is not 20KB of escaped JSON.
//
// A `.rule` file IS a Blockly workspace, and the six rules a human authored in
// the editor stay that way — this is not a decompiler and nothing works
// backward. What it is for is the rules we maintain in code: the source is a
// module here, the workspace is generated, and the generated file is committed
// so nothing changes at run time.
//
// The point is not that the source is shorter. It is that the BLOCK TYPES ARE
// DERIVED. A property's blocks are named from its rule and its export
// (`world_get_Camera_GoalProperty`), a designed block's call is named from its
// wording, and a socket is named from its parameter — and every one of those
// was a string I guessed and checked by hand while writing the camera rules.
// Guessing a block type fails loudly; guessing a SOCKET name leaves an empty
// hole and no error at all. Here, one declaration produces both sides.

const PASCAL = id =>
  id
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join('');

/** How `parseRuleMeta` ids a member: non-alphanumerics become underscores. */
const SLUG = text => text.replaceAll(/[^A-Za-z0-9_]/g, '_');

/** How a block type names the rule it belongs to: nothing but alphanumerics. */
const RULE_SLUG = name => name.replace(/[^A-Za-z0-9]/g, '');

/**
 * A socket's contents.
 *
 * A SHADOW is the greyed-in default a block is seeded with — deleting whatever
 * is plugged in reveals it again — where a plain block is something an author
 * put there. The two serialize differently and Blockly treats them differently,
 * so `shadow()` marks one rather than leaving it to guesswork.
 */
const value = block =>
  block && block[SHADOW] ? {shadow: bare(block)} : {block};

/** The marker itself, so it cannot collide with a block's own keys. */
const SHADOW = Symbol('shadow');

/** The block without its marker — a Symbol key is not serialized anyway, but
 *  dropping it keeps what is written and what is held the same shape. */
const bare = block => {
  const rest = {...block};
  delete rest[SHADOW];
  return rest;
};

/** Mark a value as the socket's default rather than something put there. */
export const shadow = block => ({...block, [SHADOW]: true});

/** A block, with `inputs` left off entirely when it has none — as Blockly writes it. */
const withInputs = (block, inputs) =>
  Object.keys(inputs).length ? {...block, inputs} : block;

/** The variable type a parameter of this kind binds to in the workspace. */
const VARIABLE_TYPE = type =>
  type.startsWith('enum:') || type === 'string'
    ? 'String'
    : type === 'actor'
      ? 'Actor'
      : type === 'vector' || type === 'point'
        ? 'Vector'
        : type === 'boolean'
          ? 'Boolean'
          : 'Number';

// ── Expressions ──────────────────────────────────────────────────────────────

export const n = num => ({type: 'math_number', fields: {NUM: num}});

const arith = (op, a, b) => ({
  type: 'math_arithmetic',
  fields: {OP: op},
  inputs: {A: value(a), B: value(b)},
});
export const add = (a, b) => arith('ADD', a, b);
export const minus = (a, b) => arith('MINUS', a, b);
export const times = (a, b) => arith('MULTIPLY', a, b);
export const over = (a, b) => arith('DIVIDE', a, b);
export const power = (a, b) => arith('POWER', a, b);

const compare = (op, a, b) => ({
  type: 'logic_compare',
  fields: {OP: op},
  inputs: {A: value(a), B: value(b)},
});
export const lessThan = (a, b) => compare('LT', a, b);
export const moreThan = (a, b) => compare('GT', a, b);

export const thisCamera = () => ({type: 'world_this_camera'});
export const thisActor = () => ({type: 'world_this_actor'});
export const frameTime = () => ({type: 'world_step_delta'});
/** The world's clock in seconds — what a delay or a cooldown measures against. */
export const time = () => ({type: 'world_time'});
export const mapSize = () => ({type: 'world_map_size'});
export const viewSize = () => ({type: 'world_view_size'});

export const axisOf = (which, vector) => ({
  type: 'world_vector_component',
  fields: {COMPONENT: which},
  inputs: {VEC: value(vector)},
});

export const anyOf = list => ({
  type: 'world_any_actors',
  inputs: {LIST: value(list)},
});

export const give = v => ({type: 'world_return', inputs: {VALUE: value(v)}});

export const note = text => ({type: 'world_comment', fields: {TEXT: text}});

export const yes = () => ({type: 'logic_boolean', fields: {BOOL: 'TRUE'}});
export const no = () => ({type: 'logic_boolean', fields: {BOOL: 'FALSE'}});
export const not = a => ({type: 'logic_negate', inputs: {BOOL: value(a)}});
const logic = (op, a, b) => ({
  type: 'logic_operation',
  fields: {OP: op},
  inputs: {A: value(a), B: value(b)},
});
export const both = (a, b) => logic('AND', a, b);
export const either = (a, b) => logic('OR', a, b);
export const equals = (a, b) => compare('EQ', a, b);
export const atLeast = (a, b) => compare('GTE', a, b);
export const atMost = (a, b) => compare('LTE', a, b);

/** `<test> ? <then> : <otherwise>` — a value, where `when` is a statement. */
export const pick = (test, then, otherwise) => ({
  type: 'logic_ternary',
  inputs: {IF: value(test), THEN: value(then), ELSE: value(otherwise)},
});

const single = (op, a) => ({
  type: 'math_single',
  fields: {OP: op},
  inputs: {NUM: value(a)},
});
export const absolute = a => single('ABS', a);
export const negated = a => single('NEG', a);
export const root = a => single('ROOT', a);

/** `<a> <plus|minus|toward…> <b>` on whole vectors. */
const vectorOp = (method, a, b) => ({
  type: 'world_vector_math',
  fields: {OP: method},
  inputs: {A: value(a), B: value(b)},
});
export const vectorPlus = (a, b) => vectorOp('ADD', a, b);
export const vectorMinus = (a, b) => vectorOp('SUBTRACT', a, b);
export const vectorTimes = (a, b) => vectorOp('MULTIPLY', a, b);
export const vectorOver = (a, b) => vectorOp('DIVIDE', a, b);

export const rotated = (v, degrees) => ({
  type: 'world_vector_rotate',
  inputs: {VECTOR: value(v), DEGREES: value(degrees)},
});

export const vector = (x, y) => ({
  type: 'world_vector_of',
  inputs: {X: value(x), Y: value(y)},
});

export const keyDown = key => ({
  type: 'world_is_key_down',
  fields: {KEY: key},
});

export const pixelsPerUnit = () => ({type: 'world_pixels_per_unit'});

/** Where the pointer is, as a place in the world (`World.mousePosition`). */
export const mousePosition = () => ({type: 'world_mouse_position'});

/** `<subject> has trait <Rule#Trait>`. */
/** `add <actor> to <list>` — the list is a VARIABLE, named in a field. */
export const pushActor = (list, actor) => ({
  type: 'world_push_actor',
  fields: {LIST: {...list.field, type: list.type}},
  inputs: {ACTOR: value(actor)},
});

/** `age of <subject>` — seconds since it was placed in the world. */
export const age = subject => ({
  type: 'world_actor_age',
  inputs: {ACTOR: value(subject)},
});

/** `remove actor <subject>` — gone at the end of this tick, not mid-frame. */
export const removeActor = subject => ({
  type: 'world_remove_actor',
  inputs: {ACTOR: value(subject)},
});

/** `empty <list>`. */
export const clearActors = list => ({
  type: 'world_clear_actors',
  fields: {LIST: {...list.field, type: list.type}},
});

/** `<actor> is in <list>` — membership in a set of actors. */
export const isIn = (actor, list) => ({
  type: 'world_is_in_actors',
  inputs: {ACTOR: value(actor), LIST: value(list)},
});

export const hasTrait = (subject, traitRef) => ({
  type: 'world_has_trait',
  fields: {TRAIT: traitRef},
  inputs: {ACTOR: value(subject)},
});

/** Chain statements through `next`, the way a body hangs together. */
const chain = blocks =>
  blocks
    .filter(Boolean)
    .reduceRight(
      (next, block) => ({...block, ...(next ? {next: {block: next}} : {})}),
      undefined,
    );

/**
 * `when <test> do <…>`, with any number of further tests and an optional else.
 *
 * Blockly counts the extra branches in `extraState`; getting that wrong loads a
 * block with sockets nothing is plugged into, so it is counted here rather than
 * written down.
 */
export const when = (branches, otherwise) => {
  const inputs = {};
  branches.forEach(([test, body], i) => {
    inputs[`IF${i}`] = value(test);
    inputs[`DO${i}`] = value(chain(body));
  });
  if (otherwise) {
    inputs.ELSE = value(chain(otherwise));
  }
  // Blockly's own shape for this mutator: how many extra tests, and whether
  // there is an else. Both are written when there is an else, even a zero.
  const extra = {};
  if (branches.length > 1 || otherwise) {
    extra.elseIfCount = branches.length - 1;
  }
  if (otherwise) {
    extra.hasElse = true;
  }
  return {
    type: 'controls_if',
    ...(Object.keys(extra).length ? {extraState: extra} : {}),
    inputs,
  };
};

/**
 * A local variable: the getter, the setter, and the field a loop binds it in.
 *
 * Made through `rule.local` rather than on its own, because a workspace has to
 * DECLARE its variables as well as use them — a block referring to one that is
 * not in the map loads with an empty field.
 *
 * Blockly resolves a variable by ID and treats the name on a block as a hint,
 * so both live here — the committed `cameraConfined` had the two disagreeing,
 * which showed up nowhere because the map won.
 */
function makeLocal(id, name, type) {
  const field = {id, name};
  return {
    id,
    name,
    type,
    field,
    get: () => ({type: `variables_get_${type}`, fields: {VAR: field}}),
    set: v => ({
      type: `variables_set_${type}`,
      fields: {VAR: field},
      inputs: {VALUE: value(v)},
    }),
  };
}

/** `for each actor <var> in <list> where <test> do <…>`. */
export const forEach = (variable, {where, from, body}) => ({
  type: 'world_for_each',
  fields: {VAR: variable.field},
  inputs: {
    ...(from ? {SOURCE: value(from)} : {}),
    WHERE: value(where),
    DO: value(chain(body)),
  },
});

/** `for each newly <pressed|released> key <var> do <…>`. */
export const forEachKey = (edge, variable, body) => ({
  type: 'world_for_each_key',
  fields: {EDGE: edge, VAR: variable.field},
  inputs: {DO: value(chain(body))},
});

/** `for each newly <pressed|released> mouse button <var> do <…>`. */
export const forEachButton = (edge, variable, body) => ({
  type: 'world_for_each_button',
  fields: {EDGE: edge, VAR: variable.field},
  inputs: {DO: value(chain(body))},
});

// ── Members ──────────────────────────────────────────────────────────────────

/** A parameter of a designed block: a socket, named from the parameter. */
export const param = (name, type = 'number') => ({kind: 'param', name, type});

/**
 * A property, and the blocks that read and write it.
 *
 * `point` is two axes: its getter picks one with a dropdown and its setter takes
 * both. Everything else is a single value.
 */
function property(ruleName, traitId, {name, type, value: initial, readonly}) {
  const exportName = `${PASCAL(name)}Property`;
  const key = `${RULE_SLUG(ruleName)}_${exportName}`;
  // A world property belongs to the rule and has nobody to name, so its blocks
  // take no subject socket; everything else says whose it is.
  const scoped = traitId !== undefined;
  const subject = who => (scoped ? {ACTOR: value(who)} : {});
  const self = {
    name,
    type,
    traitId,
    declaration: {
      type: 'world_rule_property',
      fields: {
        TYPE: type,
        ACCESS: readonly ? 'readonly' : 'writable',
        NAME: name,
        DEFAULT:
          type === 'point' || type === 'vector'
            ? `${initial?.x ?? 0},${initial?.y ?? 0}`
            : String(initial ?? ''),
      },
    },
    /** `get <name> of <subject>` — for everything but a point. */
    of: who => withInputs({type: `world_get_${key}`}, {...subject(who)}),
    /** `get <name> <x|y> of <subject>` — a point reports one axis. */
    axis: (which, who) =>
      withInputs(
        {type: `world_get_${key}`, fields: {COMPONENT: which}},
        {...subject(who)},
      ),
    set: (...args) => {
      const who = scoped ? args.shift() : undefined;
      return {
        type: `world_set_${key}`,
        inputs:
          type === 'point'
            ? {...subject(who), X: value(args[0]), Y: value(args[1])}
            : {...subject(who), VALUE: value(args[0])},
      };
    },
  };
  self.x = who => self.axis('x', who);
  self.y = who => self.axis('y', who);
  if (type === 'actors') {
    /** `add <actor> to <name> of <subject>` — only a LIST has these. */
    self.push = (...args) => {
      const who = scoped ? args.shift() : undefined;
      return {
        type: `world_push_${key}`,
        inputs: {...subject(who), ITEM: value(args[0])},
      };
    };
    /** `remove <actor> from <name> of <subject>`. */
    self.drop = (...args) => {
      const who = scoped ? args.shift() : undefined;
      return {
        type: `world_drop_${key}`,
        inputs: {...subject(who), ITEM: value(args[0])},
      };
    };
  }
  return self;
}

/**
 * Declare a designed block, and hand back the call that uses it.
 *
 * Reporting something makes it a QUERY and reporting nothing makes it an
 * ACTION, which is the same distinction `world_rule_block`'s RETURNS field
 * makes — and it decides the call block's type, so it is read here rather than
 * written down twice.
 */
function declareBlock(ruleSlug, into, variables, spec, scoped) {
  const {returns = 'number', description, say, body} = spec;
  const params = say.filter(part => typeof part !== 'string');
  const refs = {};
  params.forEach(part => {
    const id = `${ruleSlug}_${SLUG(part.name)}`;
    const type = VARIABLE_TYPE(part.type);
    if (!variables.some(v => v.id === id)) {
      variables.push({id, name: part.name, type});
    }
    refs[part.name] = makeLocal(id, part.name, type);
  });
  const wording = say
    .filter(part => typeof part === 'string')
    .join(' ')
    .trim();
  const reports = returns && returns !== 'none';
  const exportName = `${PASCAL(wording)}${reports ? 'Query' : 'Action'}`;

  into.push({
    type: 'world_rule_block',
    fields: {RETURNS: returns, DESCRIPTION: description},
    extraState: {
      parts: say.map(part =>
        typeof part === 'string'
          ? {kind: 'label', text: part}
          : {
              kind: 'param',
              type: part.type,
              var: `${ruleSlug}_${SLUG(part.name)}`,
              name: part.name,
            },
      ),
    },
    inputs: {DO: value(chain(body(refs)))},
  });

  /** Calling it: sockets are named from the parameters, uppercased. */
  const kind = reports ? 'query' : 'do';
  return (args = {}, subject) => ({
    type: `world_${kind}_${ruleSlug}_${exportName}`,
    inputs: {
      ...Object.fromEntries(
        params.map(part => [part.name.toUpperCase(), value(args[part.name])]),
      ),
      ...(scoped && subject !== undefined ? {ACTOR: value(subject)} : {}),
    },
  });
}

/**
 * Declare an event and hand back the block that raises it.
 *
 * The emit's type is built from the event's wording, exactly as the hat's is —
 * one declaration, so raising an event a rule declares needs no string.
 */
function declareEvent(rule, ruleSlug, into, say, scope, variables) {
  // At most ONE value that is not a set of choices. The hat binds such a value
  // to a name for the handler, and the transport is a single `eventValue` — a
  // second would be a second name for the same thing, which is worse than not
  // being allowed. Failing here means `yarn build:rules` says so, rather than
  // the editor quietly showing two variables that are always equal.
  // A set of choices is spelled `enum:<Rule>#<Enum>`; anything else is bound.
  const bindable = say.filter(
    part => typeof part !== 'string' && !String(part.type).startsWith('enum:'),
  );
  if (bindable.length > 1) {
    const named = bindable.map(part => part.name).join(', ');
    throw new Error(
      `event "${say.filter(p => typeof p === 'string').join(' ')}" carries ` +
        `more than one value (${named}). An event carries at most one: the ` +
        'handler binds it by name, and there is one `eventValue` to bind.',
    );
  }
  const parts = say.map(part => {
    if (typeof part === 'string') {
      return {kind: 'label', text: part};
    }
    // Its parameter is a workspace variable like any other, and two events
    // naming the same one share it — which is what `rules/input` does, its
    // trait's events carrying the same key as the world's.
    const id = `${ruleSlug}_${SLUG(part.name)}`;
    if (!variables.some(v => v.id === id)) {
      variables.push({id, name: part.name, type: VARIABLE_TYPE(part.type)});
    }
    return {kind: 'param', type: part.type, var: id};
  });
  into.push({type: 'world_rule_event', extraState: {parts}});
  const wording = say
    .filter(part => typeof part === 'string')
    .join(' ')
    .trim();
  const exportName = `${PASCAL(wording)}Event`;
  const params = say.filter(part => typeof part !== 'string');
  /** `emit <…>` — `for <subject>` only when the event has one. */
  return (carried = {}, subject) => ({
    type: `world_emit_${ruleSlug}_${exportName}`,
    inputs: {
      ...Object.fromEntries(
        params.map(part => [
          params.length > 1 ? part.name.toUpperCase() : 'VALUE',
          value(carried[part.name]),
        ]),
      ),
      ...(scope === 'world' ? {} : {ACTOR: value(subject)}),
    },
  });
}

// ── The rule ─────────────────────────────────────────────────────────────────

export function defineRule({name, ability, header}) {
  const ruleSlug = RULE_SLUG(name);
  const chainMembers = [];
  const steps = [];
  const traits = [];
  const variables = [];

  const rule = {
    name,
    ability,
    header,

    /**
     * A variable this rule's bodies use — a loop's subject, a working value.
     *
     * Declared here so it reaches the workspace's variable map. Blockly resolves
     * one by ID and treats the name on a block as a hint, so a variable used
     * without being declared loads with nothing in its field.
     */
    local(varName, type = 'Actor') {
      const id = `${ruleSlug}_${SLUG(varName)}`;
      // Deduped: a working variable and a designed block's parameter may share
      // a name, and they are then the same variable — which is what the
      // workspace means by one ID.
      if (!variables.some(v => v.id === id)) {
        variables.push({id, name: varName, type});
      }
      return makeLocal(id, varName, type);
    },

    /** `use rule <other>` — by NAME, which is how every reference works. */
    uses(other) {
      chainMembers.push({type: 'world_use_rule', fields: {RULE: other}});
      return rule;
    },

    /**
     * A block this rule adds, and the call that uses it.
     *
     * `say` is its wording: strings are labels, `param()`s are sockets. The
     * name it is filed under is the labels joined, which is also what the call
     * block's type is built from — so declaring it here is what makes calling
     * it possible without writing that string down twice.
     */
    block: spec => declareBlock(ruleSlug, chainMembers, variables, spec, false),

    /**
     * An event, and the block that raises it.
     *
     * Declared on the RULE it is the world's — raised once, handled with no
     * actor. Declared under a trait it is that subject's. Where it is chained
     * decides which, so `event` here and `trait.event` are different members.
     */
    event(say) {
      return declareEvent(
        rule,
        ruleSlug,
        chainMembers,
        say,
        'world',
        variables,
      );
    },

    /**
     * A property of the RULE — the world's, not any subject's.
     *
     * Its blocks take no `of <…>` socket: there is nobody to name, which is
     * what world-scoped means. Gravity's direction and strength are these.
     */
    property(spec) {
      const made = property(name, undefined, spec);
      chainMembers.push(made.declaration);
      return made;
    },
    number: (propName, initial, opts) =>
      rule.property({name: propName, type: 'number', value: initial, ...opts}),
    point: (propName, initial, opts) =>
      rule.property({name: propName, type: 'point', value: initial, ...opts}),
    vector: (propName, initial, opts) =>
      rule.property({name: propName, type: 'vector', value: initial, ...opts}),
    boolean: (propName, initial, opts) =>
      rule.property({name: propName, type: 'boolean', value: initial, ...opts}),

    /**
     * A per-tick step of the RULE's own — a top block beside it, not chained
     * inside, and run once with `(world, delta)` rather than per subject.
     *
     * Where work goes that fits no single actor: reading the keyboard, walking
     * every pair of bodies. A step that IS about one subject belongs under the
     * trait that elects it (`trait.step`), which walks them for you.
     */
    step(stepName, phase, body) {
      steps.push({
        type: 'world_rule_step_in',
        fields: {NAME: stepName, PHASE: phase},
        ...(body.length ? {next: {block: chain(body)}} : {}),
      });
      return rule;
    },

    /** A trait, and the members that belong to whatever elects it. */
    trait(traitName, subject = 'actor') {
      const traitId = SLUG(traitName);
      const members = [];
      const self = {
        /** What this trait needs, as `<Rule>#<Export>Trait`. */
        uses(dep) {
          members.push({type: 'world_use_trait', fields: {TRAIT: dep}});
          return self;
        },
        property(spec) {
          const made = property(name, traitId, spec);
          members.push(made.declaration);
          return made;
        },
        number: (propName, initial, opts) =>
          self.property({
            name: propName,
            type: 'number',
            value: initial,
            ...opts,
          }),
        point: (propName, initial, opts) =>
          self.property({
            name: propName,
            type: 'point',
            value: initial,
            ...opts,
          }),
        vector: (propName, initial, opts) =>
          self.property({
            name: propName,
            type: 'vector',
            value: initial,
            ...opts,
          }),
        boolean: (propName, initial, opts) =>
          self.property({
            name: propName,
            type: 'boolean',
            value: initial,
            ...opts,
          }),
        /** Words — and a colour, which every block a learner touches spells
         *  `#rrggbb` (engine/core/color). */
        string: (propName, initial, opts) =>
          self.property({
            name: propName,
            type: 'string',
            value: initial,
            ...opts,
          }),
        actors: (propName, opts) =>
          self.property({name: propName, type: 'actors', value: '', ...opts}),
        /**
         * ONE actor, not a list — a camera's actor to follow. The difference
         * is what gets generated around it: a list also has `add`/`remove`,
         * and offering those for one actor would let a learner name a second
         * that nothing reads.
         */
        actor: (propName, opts) =>
          self.property({name: propName, type: 'actor', value: '', ...opts}),
        /** Runs once a frame for each subject that has this trait. */
        /** A block this trait adds, asked OF whatever elected it. */
        block: spec => declareBlock(ruleSlug, members, variables, spec, true),
        /** An event about whatever elected this trait. */
        event(say) {
          return declareEvent(rule, ruleSlug, members, say, 'actor', variables);
        },
        step(stepName, phase, body) {
          members.push({
            type: 'world_trait_step',
            fields: {PHASE: phase, NAME: stepName},
            inputs: {DO: value(chain(body))},
          });
          return self;
        },
      };
      traits.push({
        reference: `${name}#${PASCAL(traitName)}Trait`,
        root: () => ({
          type: 'world_rule_trait',
          fields: {
            NAME: traitName,
            ...(subject === 'actor' ? {} : {SUBJECT: subject}),
          },
          ...(members.length ? {next: {block: chain(members)}} : {}),
        }),
      });
      return self;
    },

    /** What another rule names this one's trait by. */
    traitRef: traitName => `${name}#${PASCAL(traitName)}Trait`,

    workspace() {
      const roots = [
        {
          type: 'world_rule',
          fields: {NAME: name, ABILITY: ability},
          ...(chainMembers.length ? {next: {block: chain(chainMembers)}} : {}),
        },
        ...traits.map(trait => trait.root()),
        ...steps,
      ];
      return {
        // What Blockly itself writes at the top of a serialized workspace. It
        // reads it back and a file without one still loads, but a generated
        // workspace should be the shape the editor would have saved.
        blocks: {languageVersion: 0, blocks: layout(roots)},
        ...(variables.length ? {variables} : {}),
      };
    },
  };
  return rule;
}

// ── Layout ───────────────────────────────────────────────────────────────────

/** A row is about this tall once Blockly has drawn it. Generous on purpose. */
const ROW = 34;
const GAP = 60;

/**
 * How many rows a stack occupies: itself, its statement inputs, and whatever is
 * chained after it. Value inputs sit inline and add none.
 */
function rows(block) {
  if (!block || typeof block !== 'object') {
    return 0;
  }
  let total = 1;
  for (const [key, held] of Object.entries(block)) {
    if (key === 'fields' || key === 'extraState') {
      continue;
    }
    if (key === 'next') {
      total += rows(held.block);
      continue;
    }
    if (key === 'inputs') {
      for (const [socket, input] of Object.entries(held)) {
        // Statement sockets stack; a value socket is drawn on the same row.
        if (/^(DO|ELSE|STACK)/.test(socket)) {
          total += rows(input.block ?? input.shadow) + 1;
        }
      }
    }
  }
  return total;
}

/**
 * Place each root below the one before it.
 *
 * Hand-authored rules carry the positions the editor gave them when a person
 * dragged the blocks about; a generated one has to work them out, and round
 * numbers are a guess that holds until a rule grows. Measured from the stack's
 * own height, so adding a member pushes what follows down instead of landing
 * on top of it.
 */
function layout(roots) {
  let y = 20;
  return roots.map(root => {
    const placed = {...root, x: 20, y};
    y += rows(root) * ROW + GAP;
    return placed;
  });
}

// ── Output ───────────────────────────────────────────────────────────────────

/** JSON.stringify, then escape non-ASCII — how these files store a workspace. */
const store = obj =>
  `${JSON.stringify(obj, null, 2).replace(
    /[-￿]/g,
    c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`,
  )}\n`;

const asLiteral = json =>
  `'${json.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;

/** The `.ts` file that holds one stock rule. */
export function moduleFor(rule, constName) {
  return `${rule.header}

/** The \`rules/${constName}.rule\` workspace. GENERATED — edit scripts/rules/${constName}.mjs. */
export const ${constName}Rule =
  ${asLiteral(store(rule.workspace()))};
`;
}

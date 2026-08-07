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

const value = block => ({block});

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
  const extra = {};
  if (branches.length > 1) {
    extra.elseIfCount = branches.length - 1;
  }
  if (otherwise) {
    extra.elseCount = 1;
  }
  return {
    type: 'controls_if',
    ...(Object.keys(extra).length ? {extraState: extra} : {}),
    inputs,
  };
};

// ── Members ──────────────────────────────────────────────────────────────────

/** A parameter of a designed block: a socket, named from the parameter. */
export const param = (name, type = 'number') => ({kind: 'param', name, type});

/**
 * A property, and the blocks that read and write it.
 *
 * `point` is two axes: its getter picks one with a dropdown and its setter takes
 * both. Everything else is a single value.
 */
function property(ruleName, traitId, {name, type, value: initial}) {
  const exportName = `${PASCAL(name)}Property`;
  const key = `${RULE_SLUG(ruleName)}_${exportName}`;
  const self = {
    name,
    type,
    traitId,
    declaration: {
      type: 'world_rule_property',
      fields: {
        TYPE: type,
        ACCESS: 'writable',
        NAME: name,
        DEFAULT:
          type === 'point'
            ? `${initial?.x ?? 0},${initial?.y ?? 0}`
            : String(initial ?? ''),
      },
    },
    /** `get <name> of <subject>` — for everything but a point. */
    of: subject => ({
      type: `world_get_${key}`,
      inputs: {ACTOR: value(subject)},
    }),
    /** `get <name> <x|y> of <subject>` — a point reports one axis. */
    axis: (which, subject) => ({
      type: `world_get_${key}`,
      fields: {COMPONENT: which},
      inputs: {ACTOR: value(subject)},
    }),
    set: (subject, ...values) => ({
      type: `world_set_${key}`,
      inputs:
        type === 'point'
          ? {
              ACTOR: value(subject),
              X: value(values[0]),
              Y: value(values[1]),
            }
          : {ACTOR: value(subject), VALUE: value(values[0])},
    }),
  };
  self.x = subject => self.axis('x', subject);
  self.y = subject => self.axis('y', subject);
  return self;
}

// ── The rule ─────────────────────────────────────────────────────────────────

export function defineRule({name, ability, header}) {
  const ruleSlug = RULE_SLUG(name);
  const chainMembers = [];
  const traits = [];
  const variables = [];

  const rule = {
    name,
    ability,
    header,

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
    block({returns = 'number', description, say, body}) {
      const params = say.filter(part => typeof part !== 'string');
      const refs = {};
      params.forEach(part => {
        const id = `${ruleSlug}_${SLUG(part.name)}`;
        variables.push({id, name: part.name, type: 'Number'});
        refs[part.name] = {
          type: 'variables_get_Number',
          fields: {VAR: {id, name: part.name}},
        };
      });
      const wording = say
        .filter(part => typeof part === 'string')
        .join(' ')
        .trim();
      const exportName = `${PASCAL(wording)}Query`;

      chainMembers.push({
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
                },
          ),
        },
        inputs: {DO: value(chain(body(refs)))},
      });

      /** Calling it: sockets are named from the parameters, uppercased. */
      return args => ({
        type: `world_query_${ruleSlug}_${exportName}`,
        inputs: Object.fromEntries(
          params.map(part => [part.name.toUpperCase(), value(args[part.name])]),
        ),
      });
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
        number: (propName, initial) =>
          self.property({name: propName, type: 'number', value: initial}),
        point: (propName, initial) =>
          self.property({name: propName, type: 'point', value: initial}),
        actors: propName =>
          self.property({name: propName, type: 'actors', value: ''}),
        /** Runs once a frame for each subject that has this trait. */
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
      ];
      return {
        blocks: {blocks: layout(roots)},
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

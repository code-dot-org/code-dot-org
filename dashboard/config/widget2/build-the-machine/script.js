const VIEW = { width: 1000, height: 780 };

const PARTS = [
  { id: 'cpu', name: 'CPU', art: 'art-cpu', fits: ['cpu'], info: 'cpu', category: 'process' },
  { id: 'ram-a', name: 'RAM 1', art: 'art-ram', fits: ['ram-1', 'ram-2'], info: 'ram', category: 'storage' },
  { id: 'ram-b', name: 'RAM 2', art: 'art-ram', fits: ['ram-1', 'ram-2'], info: 'ram', category: 'storage' },
  { id: 'gpu', name: 'GPU', art: 'art-gpu', fits: ['pcie'], info: 'gpu', category: 'process' },
  { id: 'ssd', name: 'SSD', art: 'art-ssd', fits: ['m2'], info: 'ssd', category: 'storage' },
  { id: 'hdd', name: 'HDD', art: 'art-hdd', fits: ['sata'], info: 'hdd', category: 'storage' },
  { id: 'camera', name: 'Camera', art: 'art-camera', fits: ['in-1', 'in-2'], info: 'camera', category: 'input' },
  { id: 'keyboard', name: 'Keyboard', art: 'art-keyboard', fits: ['in-1', 'in-2'], info: 'keyboard', category: 'input' },
  { id: 'monitor', name: 'Monitor', art: 'art-monitor', fits: ['out-1', 'out-2'], info: 'monitor', category: 'output', display: true },
  { id: 'speakers', name: 'Speakers', art: 'art-speakers', fits: ['out-1', 'out-2'], info: 'speakers', category: 'output' }
];

const SOCKETS = [
  { id: 'in-1', label: 'Input jack 1', short: 'Input', info: 'ports-in', x: 20, y: 76, width: 156, height: 96, jack: true, hotSwap: true },
  { id: 'in-2', label: 'Input jack 2', short: 'Input', info: 'ports-in', x: 20, y: 180, width: 156, height: 96, jack: true, hotSwap: true },
  { id: 'out-1', label: 'Output jack 1', short: 'Output', info: 'ports-out', x: 20, y: 306, width: 156, height: 96, jack: true, hotSwap: true },
  { id: 'out-2', label: 'Output jack 2', short: 'Output', info: 'ports-out', x: 20, y: 410, width: 156, height: 96, jack: true, hotSwap: true },
  { id: 'cpu', label: 'Processor socket', info: 'slot-cpu', x: 200, y: 70, width: 270, height: 270, seat: 'seat-use-cpu' },
  { id: 'ram-1', label: 'Memory channel 1', info: 'slot-ram', x: 700, y: 70, width: 54, height: 330, seat: 'seat-use-ram-1' },
  { id: 'ram-2', label: 'Memory channel 2', info: 'slot-ram', x: 790, y: 70, width: 54, height: 330, seat: 'seat-use-ram-2' },
  { id: 'm2', label: 'SSD slot', info: 'slot-drive', x: 200, y: 420, width: 200, height: 44, seat: 'seat-use-ssd' },
  { id: 'sata', label: 'Hard drive port', info: 'slot-sata', x: 856, y: 440, width: 88, height: 44, seat: 'seat-use-hdd' },
  { id: 'pcie', label: 'Expansion slot', info: 'slot-expansion', x: 150, y: 600, width: 560, height: 54, seat: 'seat-use-gpu' }
];

const INPUT_JACKS = ['in-1', 'in-2'];
const OUTPUT_JACKS = ['out-1', 'out-2'];
const MEMORY_SOCKETS = ['ram-1', 'ram-2'];
const DRIVE_SOCKETS = ['m2', 'sata'];

const INFO = {
  board: {
    category: 'Connections',
    text: 'The motherboard is the board that every other part plugs into. It does not think or store anything by itself. Its job is to carry power and information between the parts, along the thin copper lines printed across it.'
  },
  'slot-cpu': {
    category: 'Slot',
    text: 'This is where the CPU goes. Hundreds of tiny contacts inside the socket line up with matching points on the bottom of the chip. Each kind of CPU needs a socket built for it, so a CPU from one computer will not always fit another.'
  },
  'slot-ram': {
    category: 'Slot',
    text: 'RAM sticks go in these two long slots. The notch partway along the slot means a stick can only go in one way around, so it is hard to install backwards. Having two slots is what lets the CPU reach two sticks at once.'
  },
  'slot-drive': {
    category: 'Slot',
    text: 'An SSD goes in this short slot. The drive lies flat against the board instead of connecting with cables, which is one reason laptops can be built so thin.'
  },
  'slot-sata': {
    category: 'Slot',
    text: 'A hard drive connects here with a cable instead of lying flat on the board. The drive itself is bolted somewhere else inside the case, which is why this port stays small even though a hard drive is big and heavy.'
  },
  'slot-expansion': {
    category: 'Slot',
    text: 'This long slot holds an add-on card, most often a GPU. It is called an expansion slot because it lets you add an ability the board did not come with. Leave it empty and the computer still works.'
  },
  'ports-in': {
    category: 'Ports',
    title: 'Input jacks',
    text: 'These jacks stick out of the back of the machine, and they are for devices that send information in. A keyboard or a camera goes here. Each plug is a different shape on purpose, so a cable only fits the jack it belongs in. Anything plugged in on this side is giving the computer something to work with.'
  },
  'ports-out': {
    category: 'Ports',
    title: 'Output jacks',
    text: 'These jacks are for devices that carry information out. A monitor or a set of speakers goes here. Anything plugged in on this side is showing you what the computer produced. Devices on the back can be plugged and unplugged while the computer runs, which is not true of the parts inside.'
  },
  chipset: {
    category: 'Connections',
    text: 'That chip is the chipset, and it is soldered to the board for good. It works like a traffic controller for information: whatever comes from the drive, the expansion slot, and the jacks all passes through it on the way to the CPU. It decides what gets through and when, so the CPU is not interrupted by everything at once.'
  },
  cpu: {
    category: 'Processing',
    text: 'The CPU is the main chip that runs the computer. It reads instructions and carries them out one at a time, very fast. Every program you open depends on the CPU to do the work.'
  },
  ram: {
    category: 'Memory',
    title: 'RAM',
    text: 'RAM is the computer\u2019s work space. Whatever you have open right now is held in RAM so the computer can reach it quickly. RAM is only temporary, so anything left in it disappears when the power goes off.'
  },
  'ram-both': {
    category: 'Memory',
    title: 'Two RAM sticks',
    text: 'You do not have to use both slots, but it helps. Two sticks give the computer a bigger work space, so you can keep more programs and larger files open before things start to slow down. Two sticks also give the computer two paths to its memory instead of one, so information can move in and out faster.'
  },
  gpu: {
    category: 'Processing',
    text: 'The GPU is a second chip built for one job: doing a huge number of small calculations at the same time. The CPU is fast, but it works through tasks in order. Filling a screen with pixels takes millions of tiny calculations at once, so a GPU handles graphics and video much better than a CPU can.'
  },
  ssd: {
    category: 'Storage',
    text: 'An SSD keeps your files on memory chips, with no moving parts at all. Files stay on it when the power is off, and the computer copies them into RAM when it needs them. Because nothing has to spin or travel, an SSD finds a file far faster than a hard drive can.'
  },
  hdd: {
    category: 'Storage',
    title: 'Hard drive',
    text: 'A hard drive keeps your files on a spinning metal disk. A small arm swings across the disk to reach the spot where a file is stored, so there are real moving parts inside this one. Hard drives cost less for the same amount of space, but they are slower, louder, and much easier to break if you drop them.'
  },
  camera: {
    category: 'Input device',
    text: 'A camera is an input device. Input devices bring information into the computer. A camera turns what it sees into a picture the computer can store.'
  },
  keyboard: {
    category: 'Input device',
    text: 'A keyboard is an input device. Input devices bring information into the computer. Each key you press is sent in as a letter, a number, or a command.'
  },
  monitor: {
    category: 'Output device',
    text: 'A monitor is an output device. Output devices send information from the computer back out to you. A monitor shows you the pictures and text the computer produces.'
  },
  speakers: {
    category: 'Output device',
    text: 'Speakers are an output device. Output devices send information from the computer back out to you. Speakers turn the computer\u2019s signals into sound you can hear.'
  }
};

const FIXED = [
  {
    id: 'board',
    name: 'Motherboard',
    art: 'art-board',
    info: 'board',
    status: 'The motherboard is the base of the machine. It cannot be taken out.'
  },
  {
    id: 'chipset',
    name: 'Chipset',
    art: 'art-chipset',
    info: 'chipset',
    status: 'The chipset is soldered to the board. It cannot be taken out.',
    x: 550,
    y: 420,
    width: 140,
    height: 140
  }
];

const SLOTS = SOCKETS.map(function (socket) {
  return { id: `about-${socket.id}`, name: socket.label, info: socket.info };
});

const CATEGORIES = [
  { id: 'input', name: 'Input' },
  { id: 'process', name: 'Processing' },
  { id: 'storage', name: 'Storage' },
  { id: 'output', name: 'Output' }
];

const SORT_WHY = {
  cpu: 'The CPU processes information. It reads instructions and carries them out.',
  gpu: 'The GPU processes information too. Its whole job is running the calculations that draw the picture.',
  ram: 'RAM is storage, but only while the power is on. It holds what the computer is working on right now and loses all of it the moment the machine shuts off.',
  ssd: 'The SSD is storage. It keeps files even when the power is off.',
  hdd: 'The hard drive is storage. It keeps files on a spinning disk even when the power is off.',
  camera: 'A camera is input. It brings information into the computer.',
  keyboard: 'A keyboard is input. It brings information into the computer.',
  monitor: 'A monitor is output. It carries information out of the computer to you.',
  speakers: 'Speakers are output. They carry information out of the computer to you.'
};

const STAGES = {
  cpu: {
    kind: 'step',
    sockets: ['cpu'],
    title: 'Power reaches the CPU',
    text: 'Electricity reaches the board and the CPU starts up. It runs a small program stored on the board itself, and the first thing that program does is check which parts are installed.'
  },
  memory: {
    kind: 'step',
    sockets: MEMORY_SOCKETS,
    title: 'The CPU checks the memory',
    text: 'The CPU counts the RAM and tests it. Memory has to work before anything else can happen, because the operating system needs somewhere to run.'
  }
};

const DRIVE_FOUND = {
  ssd: 'The CPU looks for a drive that holds an operating system, like Windows or ChromeOS. It finds the SSD and copies the operating system into RAM, which takes only a few seconds.',
  hdd: 'The CPU looks for a drive that holds an operating system, like Windows or ChromeOS. It finds the hard drive and copies the operating system into RAM. First the disk has to spin up to speed and the arm has to hunt down the files, so this part of startup drags.',
  both: 'The CPU looks for a drive that holds an operating system, like Windows or ChromeOS. Both drives have one, so the computer starts from the SSD. Reading memory chips beats waiting on a spinning disk every time.'
};

const DRAWN_BY = {
  gpu: 'The operating system is now running in RAM. The GPU takes over drawing the picture, so games, video, and animation stay smooth.',
  brokenGpu: 'The operating system is now running in RAM. The GPU in the expansion slot is damaged, so the CPU has to draw the picture by itself, which means graphics and video look choppy.',
  cpu: 'The operating system is now running in RAM. You left the expansion slot empty, so the CPU has to draw the picture by itself, which means graphics and video look choppy.'
};

const SHOWN_ON = {
  display: {
    title: 'The screen turns on',
    text: 'The monitor lights up and the desktop appears.'
  },
  soundOnly: {
    title: 'There is no screen',
    text: 'The only thing in the output jacks is a set of speakers. You can hear this computer, but you will never see what it is showing.'
  },
  nowhere: {
    title: 'The picture has nowhere to go',
    text: 'The output jacks are empty, so that picture goes nowhere and nobody ever sees it.'
  }
};

const DRIVE_ERROR = {
  display: 'The screen shows an error message instead of a desktop, so at least you can read what went wrong.',
  noDisplay: 'The computer would put an error message on a screen, but there is nothing in the output jacks to show it on. It just sits there stuck, with no way to tell you what is wrong.'
};

const HALTS = {
  brokenCpu: {
    kind: 'fail',
    sockets: [],
    kicker: 'Startup stopped',
    title: 'The CPU is not working',
    text: 'Power reaches the board, but the CPU sitting in the socket is damaged and cannot run the startup program. Nothing else can happen without it. Take it out and swap in a new one.'
  },
  brokenMemory: {
    kind: 'fail',
    sockets: ['cpu'],
    kicker: 'Startup stopped',
    title: 'The memory is not working',
    text: 'The CPU is running, but every stick of RAM on the board is damaged. There is nowhere to load the operating system, so startup stops here. Take the damaged sticks out and swap in new ones.'
  },
  brokenDrive: {
    kind: 'fail',
    sockets: ['cpu', 'ram-1', 'ram-2'],
    kicker: 'Startup stopped',
    title: 'The drives are not working',
    text: 'The CPU and the memory are both fine, but every drive on this board is damaged, so there is no operating system to load.',
    advice: 'Take the damaged drives out and swap in new ones.'
  },
  noCpu: {
    kind: 'fail',
    sockets: [],
    kicker: 'Nothing happens',
    title: 'The computer cannot start',
    text: 'There is no CPU, so nothing is there to run the startup program. The fans might spin, but the computer never begins to start. Every other part is waiting for instructions that will never come.'
  },
  noMemory: {
    kind: 'fail',
    sockets: ['cpu'],
    kicker: 'Startup stopped',
    title: 'No memory found',
    text: 'The CPU is running, but it cannot find any RAM. There is nowhere to load the operating system, so startup stops right here. A real computer beeps or blinks a light to tell you the memory is missing, because it has no screen to write an error on yet.'
  },
  noDrive: {
    kind: 'fail',
    sockets: ['cpu', 'ram-1', 'ram-2'],
    kicker: 'Startup stopped',
    title: 'No operating system found',
    text: 'The CPU and the memory both work, but there is no drive holding an operating system. The computer is on, and it has nothing to run.'
  }
};

const ENDINGS = {
  full: {
    kind: 'done',
    sockets: [],
    kicker: 'Startup complete',
    title: 'The computer is ready',
    text: 'The computer finished starting up. You have a way to send information in and a way to get information back out, so a person can actually sit down and use this machine.'
  },
  noOutput: {
    kind: 'done',
    sockets: [],
    kicker: 'Startup complete',
    title: 'Running with nothing to show',
    text: 'The computer finished starting up, but the output jacks are empty. It is working away with no monitor and no speakers, so you have no way to see or hear what it is doing. Most computers in data centers run exactly like this, with no screen attached at all.'
  },
  noInput: {
    kind: 'done',
    sockets: [],
    kicker: 'Startup complete',
    title: 'Running with no way to control it',
    text: 'The computer finished starting up and it can send information back out, but the input jacks are empty. With no keyboard and no camera, there is no way to send anything into it. It will sit there running and doing nothing, because nothing can tell it what to do.'
  },
  noPorts: {
    kind: 'done',
    sockets: [],
    kicker: 'Startup complete',
    title: 'Running with no way to use it',
    text: 'The computer finished starting up, but both jack groups are empty. Nothing goes in and nothing comes out. The machine is working perfectly and it is completely cut off from you.'
  }
};

const DAMAGED = {
  seatedLive: 'This part is damaged and it is still in the machine. Turn the power off first, then take it out of its slot and choose it again to swap in a new one.',
  seated: 'This part is damaged and it is still in the machine. Take it out of its slot, then choose it again to swap in a new one.',
  loose: 'This part is damaged and it will never work again. Swap in a new one and the rest of your build stays exactly as it is.'
};

const INTRO = 'Pick a part, then pick a glowing slot on the board.';

const SORT_INTRO = 'Pick a part, then pick the group it belongs to. Every part you installed has to go somewhere before you can check your answers.';

function poweredOffNote() {
  return {
    kind: 'event',
    sockets: [],
    kicker: 'Power off',
    title: 'You turned the computer off',
    text: 'The moment the power stopped, everything being held in RAM disappeared. Anything that was saved to the SSD is still sitting there, waiting for the next time you start the computer up.'
  };
}

function pulledCoreNote(name) {
  return {
    kind: 'event',
    sockets: [],
    kicker: 'Power lost',
    title: 'The computer shuts off',
    text: `You pulled the ${name} out while the power was on. Anything the computer was holding in RAM is gone, and nothing was saved. Parts inside a computer are only removed with the power off.`
  };
}

function pulledGpuNote(name) {
  return {
    kind: 'event',
    sockets: [],
    kicker: 'Still running',
    title: 'The screen goes dark',
    text: `You pulled the ${name} out while the computer was running. The picture is gone, but the computer itself is still on and still working. You just took away the part that was drawing the screen.`
  };
}

function coreAddedNote(name) {
  return {
    kind: 'event',
    sockets: [],
    kicker: 'Power lost',
    title: 'That ruins the part',
    text: `You pushed the ${name} into a live board. Electricity was already running through those contacts, and the ${name} did not survive it. In real life you might get lucky, or you might destroy the part and the board with it, which is why every repair guide tells you to unplug a computer before you open it.`
  };
}

function jackChangedNote(label) {
  return {
    kind: 'event',
    sockets: [],
    kicker: 'Still running',
    title: 'The computer keeps running',
    text: `You changed what was in the ${label} while the computer was running, and it did not care at all. Devices that plug into the outside of a computer can come and go while it works. The parts inside cannot.`
  };
}

const state = {
  view: 'board',
  held: null,
  filled: {},
  note: null,
  boot: null,
  power: false,
  damaged: [],
  sort: null
};

const els = {};
const numbers = new Intl.NumberFormat();

/* Lookups */

function getPart(id) {
  return PARTS.concat(FIXED).concat(SLOTS).filter(function (p) { return p.id === id; })[0];
}

function getSocket(id) {
  return SOCKETS.filter(function (s) { return s.id === id; })[0];
}

function getCategory(id) {
  return CATEGORIES.filter(function (c) { return c.id === id; })[0];
}

function aboutId(id) {
  return `about-${id}`;
}

function isDamaged(partId) {
  return state.damaged.indexOf(partId) !== -1;
}

function markDamaged(partId) {
  if (!isDamaged(partId)) {
    state.damaged.push(partId);
  }
}

function socketHolding(partId) {
  return SOCKETS.filter(function (s) { return state.filled[s.id] === partId; })[0];
}

function isPlaced(partId) {
  return Boolean(socketHolding(partId));
}

function workingIn(socketId) {
  const partId = state.filled[socketId];
  return partId && !isDamaged(partId) ? partId : null;
}

function anyFilled(socketIds) {
  return socketIds.some(function (id) { return Boolean(state.filled[id]); });
}

function anyWorking(socketIds) {
  return socketIds.some(function (id) { return Boolean(workingIn(id)); });
}

function partsIn(socketIds) {
  return socketIds
    .map(function (id) { return state.filled[id]; })
    .filter(Boolean);
}

function hasDisplay() {
  return partsIn(OUTPUT_JACKS).some(function (id) { return Boolean(getPart(id).display); });
}

/* Boot script */

function screenStep() {
  const draw = workingIn('pcie')
    ? DRAWN_BY.gpu
    : (state.filled.pcie ? DRAWN_BY.brokenGpu : DRAWN_BY.cpu);
  const shown = hasDisplay()
    ? SHOWN_ON.display
    : (partsIn(OUTPUT_JACKS).length ? SHOWN_ON.soundOnly : SHOWN_ON.nowhere);
  return {
    kind: 'step',
    sockets: workingIn('pcie') ? ['pcie'] : [],
    title: shown.title,
    text: `${draw} ${shown.text}`
  };
}

function driveStep() {
  const ssd = Boolean(workingIn('m2'));
  const hdd = Boolean(workingIn('sata'));
  let text = DRIVE_FOUND.hdd;
  if (ssd && hdd) {
    text = DRIVE_FOUND.both;
  } else if (ssd) {
    text = DRIVE_FOUND.ssd;
  }
  return {
    kind: 'step',
    sockets: DRIVE_SOCKETS.filter(function (id) { return Boolean(workingIn(id)); }),
    title: 'The CPU finds the drive',
    text: text
  };
}

function driveHalt(base) {
  const detail = hasDisplay() ? DRIVE_ERROR.display : DRIVE_ERROR.noDisplay;
  const closing = base.advice ? ` ${base.advice}` : '';
  return {
    kind: base.kind,
    sockets: base.sockets,
    kicker: base.kicker,
    title: base.title,
    text: `${base.text} ${detail}${closing}`
  };
}

function buildScript() {
  if (!state.filled.cpu) {
    return [HALTS.noCpu];
  }
  if (!workingIn('cpu')) {
    return [HALTS.brokenCpu];
  }
  if (!anyFilled(MEMORY_SOCKETS)) {
    return [STAGES.cpu, HALTS.noMemory];
  }
  if (!anyWorking(MEMORY_SOCKETS)) {
    return [STAGES.cpu, HALTS.brokenMemory];
  }
  if (!anyFilled(DRIVE_SOCKETS)) {
    return [STAGES.cpu, STAGES.memory, driveHalt(HALTS.noDrive)];
  }
  if (!anyWorking(DRIVE_SOCKETS)) {
    return [STAGES.cpu, STAGES.memory, driveHalt(HALTS.brokenDrive)];
  }

  const script = [STAGES.cpu, STAGES.memory, driveStep(), screenStep()];
  const hasIn = partsIn(INPUT_JACKS).length > 0;
  const hasOut = partsIn(OUTPUT_JACKS).length > 0;

  if (hasIn && hasOut) {
    script.push(ENDINGS.full);
  } else if (hasIn) {
    script.push(ENDINGS.noOutput);
  } else if (hasOut) {
    script.push(ENDINGS.noInput);
  } else {
    script.push(ENDINGS.noPorts);
  }
  return script;
}

/* Small builders */

function makeArt(artId) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#' + artId);
  svg.appendChild(use);
  return svg;
}

function makeTagged(className, artId, word) {
  const tag = document.createElement('span');
  tag.className = className;
  if (artId) {
    const icon = makeArt(artId);
    icon.setAttribute('class', 'tag-icon');
    tag.appendChild(icon);
  }
  const label = document.createElement('span');
  label.textContent = word;
  tag.appendChild(label);
  return tag;
}

function makeButton(className, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = className;
  btn.textContent = label;
  return btn;
}

function say(message, tone) {
  els.status.className = 'status';
  if (tone) {
    els.status.classList.add(tone);
  }
  els.status.textContent = message;
}

function flashNotes() {
  els.notes.classList.remove('is-fresh');
  void els.notes.offsetWidth;
  els.notes.classList.add('is-fresh');
}

/* Status text */

function socketStatus(socketId) {
  const socket = getSocket(socketId);
  const filledBy = state.filled[socketId];
  if (!filledBy) {
    return `${socket.label} is empty.`;
  }
  return isDamaged(filledBy)
    ? `${socket.label} holds the ${getPart(filledBy).name}, and it is damaged.`
    : `${socket.label} holds the ${getPart(filledBy).name}.`;
}

function statusFor(id) {
  const fixed = FIXED.filter(function (f) { return f.id === id; })[0];
  if (fixed) {
    return fixed.status;
  }
  if (id.indexOf('about-') === 0) {
    return socketStatus(id.slice('about-'.length));
  }

  const name = getPart(id).name;
  const socket = socketHolding(id);
  if (socket) {
    return isDamaged(id)
      ? `${socket.label} holds the ${name}, and it is damaged.`
      : `${socket.label} holds the ${name}.`;
  }
  return isDamaged(id)
    ? `The ${name} is damaged and is not in the machine.`
    : `The ${name} is not in the machine yet.`;
}

/* Board rendering */

function isLit(socketId) {
  if (!state.boot || !state.power || !workingIn(socketId)) {
    return false;
  }
  const through = Math.min(state.boot.step, state.boot.steps.length - 1);
  for (let i = 0; i <= through; i += 1) {
    if (state.boot.steps[i].sockets.indexOf(socketId) !== -1) {
      return true;
    }
  }
  return false;
}

function renderBin() {
  els.bin.textContent = '';
  PARTS.forEach(function (part) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.dataset.partId = part.id;

    const used = isPlaced(part.id);
    const broken = isDamaged(part.id);
    if (broken) {
      btn.classList.add('is-broken');
    }
    if (used) {
      btn.classList.add('is-used');
    }
    if (used || broken) {
      btn.setAttribute('aria-label', broken
        ? `${part.name} is damaged. Read what happened.`
        : `${part.name} is placed. Read what it does again.`);
    } else {
      btn.setAttribute('aria-pressed', String(state.held === part.id));
    }

    btn.appendChild(makeArt(part.art));
    const name = document.createElement('span');
    name.className = 'chip-name';
    name.textContent = part.name;
    btn.appendChild(name);

    if (broken) {
      btn.appendChild(makeTagged('chip-tag is-broken-tag', 'art-warn', 'Damaged'));
    } else if (used) {
      const tag = document.createElement('span');
      tag.className = 'chip-tag';
      tag.textContent = 'Placed';
      btn.appendChild(tag);
    }

    li.appendChild(btn);
    els.bin.appendChild(li);
  });
}

function renderSockets() {
  els.sockets.textContent = '';
  SOCKETS.forEach(function (socket) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = socket.jack ? 'socket jack' : 'socket';
    btn.dataset.socketId = socket.id;
    btn.style.left = (socket.x / VIEW.width * 100) + '%';
    btn.style.top = (socket.y / VIEW.height * 100) + '%';
    btn.style.width = (socket.width / VIEW.width * 100) + '%';
    btn.style.height = (socket.height / VIEW.height * 100) + '%';

    const filledBy = state.filled[socket.id];

    if (socket.jack) {
      if (filledBy) {
        btn.classList.add('is-filled');
        btn.appendChild(makeArt(getPart(filledBy).art));
      } else {
        const label = document.createElement('span');
        label.className = 'jack-label';
        label.textContent = socket.short;
        btn.appendChild(label);
      }
    }

    if (filledBy && isDamaged(filledBy)) {
      const brokenName = getPart(filledBy).name;
      btn.classList.add('is-broken');
      const badge = makeArt('art-warn');
      badge.setAttribute('class', 'socket-badge');
      btn.appendChild(badge);
      btn.setAttribute('aria-label', `${socket.label} holds the ${brokenName}, which is damaged. Choose it to take the ${brokenName} back out.`);
    } else if (filledBy) {
      const heldName = getPart(filledBy).name;
      btn.setAttribute('aria-label', `${socket.label} holds the ${heldName}. Choose it to take the ${heldName} back out.`);
    } else if (state.held) {
      btn.setAttribute('aria-label', `${socket.label} is empty.`);
    } else {
      btn.setAttribute('aria-label', `${socket.label} is empty. Choose it to read what it is.`);
    }

    if (state.held && !filledBy && getPart(state.held).fits.indexOf(socket.id) !== -1) {
      btn.classList.add('is-open');
    }
    if (isLit(socket.id)) {
      btn.classList.add('is-lit');
    }

    els.sockets.appendChild(btn);
  });
}

function buildHotspots() {
  FIXED.forEach(function (item) {
    if (typeof item.x !== 'number') {
      return;
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hotspot';
    btn.dataset.fixedId = item.id;
    btn.style.left = (item.x / VIEW.width * 100) + '%';
    btn.style.top = (item.y / VIEW.height * 100) + '%';
    btn.style.width = (item.width / VIEW.width * 100) + '%';
    btn.style.height = (item.height / VIEW.height * 100) + '%';
    btn.setAttribute('aria-label', `${item.name}. Read what it does.`);
    els.hotspots.appendChild(btn);
  });
}

function renderSeats() {
  SOCKETS.forEach(function (socket) {
    if (!socket.seat) {
      return;
    }
    const node = document.getElementById(socket.seat);
    if (node) {
      node.classList.toggle('is-in', Boolean(state.filled[socket.id]));
    }
  });
}

/* Notes rendering */

function addNote(category, title, text) {
  const kicker = document.createElement('p');
  kicker.className = 'notes-category';
  kicker.textContent = category;
  els.noteBody.appendChild(kicker);

  const heading = document.createElement('h3');
  heading.className = 'notes-name';
  heading.textContent = title;
  els.noteBody.appendChild(heading);

  const body = document.createElement('p');
  body.className = 'notes-text';
  body.textContent = text;
  els.noteBody.appendChild(body);
}

function getInfo(partId) {
  const part = getPart(partId);
  if (part.info === 'ram' && state.filled['ram-1'] && state.filled['ram-2']) {
    return INFO['ram-both'];
  }
  return INFO[part.info];
}

function renderBootNote() {
  const steps = state.boot.steps;
  const entry = steps[state.boot.step];
  const numbered = steps.filter(function (s) {
    return s.kind === 'step' || s.kind === 'fail';
  });

  if (entry.kind === 'step') {
    const place = numbered.indexOf(entry) + 1;
    addNote(`Step ${numbers.format(place)} of ${numbers.format(numbered.length)}`, entry.title, entry.text);
  } else {
    addNote(entry.kicker, entry.title, entry.text);
  }

  const nav = document.createElement('div');
  nav.className = 'step-nav';

  if (state.boot.step > 0) {
    const back = makeButton('btn-quiet', 'Previous step');
    back.id = 'prev';
    nav.appendChild(back);
  }

  const upNext = steps[state.boot.step + 1];
  if (upNext) {
    const next = makeButton('btn-next', upNext.kind === 'step' ? 'Next step' : 'See what happens');
    next.id = 'next';
    nav.appendChild(next);
  } else if (entry.kind === 'done') {
    const sort = makeButton('btn-next', 'Sort the parts');
    sort.id = 'start-sort';
    nav.appendChild(sort);
  }

  if (nav.children.length) {
    els.noteBody.appendChild(nav);
  }
}

function renderPartNote() {
  const part = getPart(state.note);
  const info = getInfo(state.note);

  if (part.art) {
    const art = makeArt(part.art);
    art.setAttribute('class', 'notes-art');
    els.noteBody.appendChild(art);
  }

  addNote(info.category, info.title || part.name, info.text);

  if (isDamaged(state.note)) {
    const seated = isPlaced(state.note);
    const warn = document.createElement('p');
    warn.className = 'notes-text notes-warn';
    if (seated) {
      warn.textContent = state.power ? DAMAGED.seatedLive : DAMAGED.seated;
    } else {
      warn.textContent = DAMAGED.loose;
    }
    els.noteBody.appendChild(warn);

    if (!seated) {
      const nav = document.createElement('div');
      nav.className = 'step-nav';
      const swap = makeButton('btn-next', 'Swap in a new one');
      swap.id = 'replace';
      nav.appendChild(swap);
      els.noteBody.appendChild(nav);
    }
  }

  if (state.boot) {
    const entry = state.boot.steps[state.boot.step];
    const stepsRemain = state.boot.step + 1 < state.boot.steps.length;
    if (entry.kind === 'step' && stepsRemain) {
      const nav = document.createElement('div');
      nav.className = 'step-nav';
      const back = makeButton('btn-next', 'Continue startup');
      back.id = 'resume';
      nav.appendChild(back);
      els.noteBody.appendChild(nav);
    }
  }
}

function renderSortNote() {
  const result = state.sort.result;
  if (!result) {
    const intro = document.createElement('p');
    intro.className = 'notes-intro';
    intro.textContent = SORT_INTRO;
    els.noteBody.appendChild(intro);
    return;
  }

  addNote(
    'Sorting',
    result.misses.length ? 'Some of these are in the wrong group' : 'Every part is in the right group',
    `You put ${numbers.format(result.correct)} of ${numbers.format(result.total)} parts in the right group.`
  );

  if (!result.misses.length) {
    return;
  }

  const list = document.createElement('ul');
  list.className = 'miss-list';
  result.misses.forEach(function (partId) {
    const part = getPart(partId);
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.className = 'miss-name';
    name.textContent = part.name;
    item.appendChild(name);
    const why = document.createElement('span');
    why.textContent = SORT_WHY[part.info];
    item.appendChild(why);
    list.appendChild(item);
  });
  els.noteBody.appendChild(list);
}

function renderNotes() {
  els.noteBody.textContent = '';

  if (state.view === 'sort') {
    renderSortNote();
    return;
  }
  if (!state.note && state.boot) {
    renderBootNote();
    return;
  }
  if (!state.note) {
    const intro = document.createElement('p');
    intro.className = 'notes-intro';
    intro.textContent = INTRO;
    els.noteBody.appendChild(intro);
    return;
  }
  renderPartNote();
}

/* Sort view rendering */

function sortableParts() {
  return PARTS.filter(function (part) { return isPlaced(part.id); });
}

function unassignedParts() {
  return sortableParts().filter(function (part) {
    return !state.sort.assigned[part.id];
  });
}

function makeSortChip(part, extra) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chip';
  btn.dataset.sortPartId = part.id;
  btn.appendChild(makeArt(part.art));
  const name = document.createElement('span');
  name.className = 'chip-name';
  name.textContent = part.name;
  btn.appendChild(name);
  if (extra) {
    btn.appendChild(extra);
  }
  return btn;
}

function renderSortTray() {
  const loose = unassignedParts();

  const heading = document.createElement('h3');
  heading.className = 'rail-title';
  heading.textContent = 'Parts to sort';
  els.sortboard.appendChild(heading);

  if (!loose.length) {
    const done = document.createElement('p');
    done.className = 'sort-empty';
    done.textContent = 'Every part is in a group. Check your answers below.';
    els.sortboard.appendChild(done);
    return;
  }

  const tray = document.createElement('ul');
  tray.className = 'sort-tray';
  loose.forEach(function (part) {
    const li = document.createElement('li');
    const btn = makeSortChip(part, null);
    btn.setAttribute('aria-pressed', String(state.sort.held === part.id));
    li.appendChild(btn);
    tray.appendChild(li);
  });
  els.sortboard.appendChild(tray);
}

function renderSortBins() {
  const wrap = document.createElement('div');
  wrap.className = 'sort-bins';

  CATEGORIES.forEach(function (category) {
    const bin = document.createElement('div');
    bin.className = 'sortbin';

    const inside = sortableParts().filter(function (part) {
      return state.sort.assigned[part.id] === category.id;
    });

    const drop = makeButton('sort-drop', category.name);
    drop.dataset.categoryId = category.id;
    if (state.sort.held) {
      drop.classList.add('is-open');
      drop.setAttribute('aria-label', `Put the part you are holding in the ${category.name} group.`);
    } else {
      drop.setAttribute('aria-label', `${category.name} group holds ${numbers.format(inside.length)} parts.`);
    }
    bin.appendChild(drop);

    const list = document.createElement('ul');
    list.className = 'sort-items';
    inside.forEach(function (part) {
      const li = document.createElement('li');
      let verdict = null;
      if (state.sort.result) {
        const right = part.category === category.id;
        verdict = makeTagged(
          right ? 'sort-verdict is-right' : 'sort-verdict is-wrong',
          right ? 'art-check' : 'art-warn',
          right ? 'Correct' : 'Not yet'
        );
      }
      const btn = makeSortChip(part, verdict);
      if (state.sort.result) {
        btn.classList.add(part.category === category.id ? 'is-right' : 'is-wrong');
      }
      btn.setAttribute('aria-label', `${part.name} is in the ${category.name} group. Choose it to take it back out.`);
      li.appendChild(btn);
      list.appendChild(li);
    });
    bin.appendChild(list);
    wrap.appendChild(bin);
  });

  els.sortboard.appendChild(wrap);
}

function renderSortActions() {
  const actions = document.createElement('div');
  actions.className = 'sort-actions';

  const check = makeButton('btn-next', 'Check my sorting');
  check.id = 'check-sort';
  check.disabled = unassignedParts().length > 0;
  actions.appendChild(check);

  if (state.sort.result) {
    const again = makeButton('btn-quiet', 'Clear the marks');
    again.id = 'clear-marks';
    actions.appendChild(again);
  }

  const back = makeButton('btn-quiet', 'Back to the board');
  back.id = 'exit-sort';
  actions.appendChild(back);

  els.sortboard.appendChild(actions);
}

function renderSortboard() {
  els.sortboard.textContent = '';
  const intro = document.createElement('p');
  intro.className = 'sort-intro';
  intro.textContent = SORT_INTRO;
  els.sortboard.appendChild(intro);
  renderSortTray();
  renderSortBins();
  renderSortActions();
}

/* Top-level render */

function renderPowerButton() {
  els.powerLabel.textContent = state.power ? 'Power off' : 'Power on';
  els.power.classList.toggle('is-on', state.power);
}

function render() {
  const sorting = state.view === 'sort';
  els.stage.hidden = sorting;
  els.sortboard.hidden = !sorting;
  els.stageLabel.classList.toggle('visually-hidden', !sorting);
  els.stageLabel.textContent = sorting ? 'Sort the parts you used' : 'Motherboard';

  renderPowerButton();
  renderBin();
  if (sorting) {
    renderSortboard();
  } else {
    renderSockets();
    renderSeats();
  }
  renderNotes();
}

/* Boot interactions */

function focusStepNav(preferred) {
  const first = document.getElementById(preferred);
  if (first) {
    first.focus();
    return;
  }
  const fallback = document.getElementById('next') || document.getElementById('prev');
  if (fallback) {
    fallback.focus();
  } else {
    els.power.focus();
  }
}

function bootPositionMessage() {
  const steps = state.boot.steps;
  const entry = steps[state.boot.step];
  if (entry.kind !== 'step') {
    return entry.kicker || '';
  }
  const numbered = steps.filter(function (s) {
    return s.kind === 'step' || s.kind === 'fail';
  });
  return `Step ${numbers.format(numbered.indexOf(entry) + 1)} of ${numbers.format(numbered.length)}.`;
}

function interrupt(note, keepPower) {
  const kept = state.boot.steps.slice(0, state.boot.step + 1);
  state.boot = { steps: kept.concat([note]), step: kept.length };
  state.note = null;
  state.power = keepPower;
}

function nextStep() {
  if (!state.boot || state.boot.step + 1 >= state.boot.steps.length) {
    return;
  }
  state.boot.step += 1;
  state.note = null;
  const entry = state.boot.steps[state.boot.step];
  render();
  flashNotes();
  if (entry.kind === 'fail') {
    say('The computer did not finish starting up.', 'is-bad');
  } else if (entry.kind === 'done') {
    say('Startup is finished.', 'is-good');
  } else {
    say(bootPositionMessage());
  }
  focusStepNav('next');
}

function prevStep() {
  if (!state.boot || state.boot.step === 0) {
    return;
  }
  state.boot.step -= 1;
  state.note = null;
  render();
  flashNotes();
  say(bootPositionMessage());
  focusStepNav('prev');
}

function powerOn() {
  state.held = null;
  state.note = null;
  state.power = true;
  state.boot = { steps: buildScript(), step: 0 };
  render();
  flashNotes();
  say('The power is on.');
  focusStepNav('next');
}

function powerOff() {
  state.held = null;
  interrupt(poweredOffNote(), false);
  render();
  flashNotes();
  say('The power is off.');
  els.power.focus();
}

function togglePower() {
  if (state.view === 'sort') {
    exitSort();
  }
  if (state.power) {
    powerOff();
  } else {
    powerOn();
  }
}

/* Board interactions */

function showNote(partId) {
  if (!state.power) {
    state.boot = null;
  }
  state.note = partId;
  render();
  flashNotes();
  say(statusFor(partId));
}

function pickUp(partId) {
  state.held = state.held === partId ? null : partId;
  state.note = partId;
  render();
  flashNotes();
  if (state.held) {
    say(`You are holding the ${getPart(partId).name}. Choose a glowing slot.`);
  } else {
    say('You put the part down.');
  }
}

function replacePart(partId) {
  const at = state.damaged.indexOf(partId);
  if (at !== -1) {
    state.damaged.splice(at, 1);
  }
  state.note = null;
  render();
  say(`A new ${getPart(partId).name} is in the parts list.`, 'is-good');
}

function removeFromSocket(socketId, socket, occupant) {
  delete state.filled[socketId];
  const name = getPart(occupant).name;

  if (state.power) {
    if (socket.hotSwap) {
      interrupt(jackChangedNote(socket.label.toLowerCase()), true);
      render();
      flashNotes();
      say(`You unplugged the ${name} while the computer was running.`);
    } else if (socketId === 'pcie') {
      interrupt(pulledGpuNote(name), true);
      render();
      flashNotes();
      say(`You pulled the ${name} out of a running computer.`, 'is-bad');
    } else {
      interrupt(pulledCoreNote(name), false);
      render();
      flashNotes();
      say(`You pulled the ${name} out of a running computer.`, 'is-bad');
    }
    focusStepNav('next');
    return;
  }

  state.boot = null;
  if (state.note === occupant) {
    state.note = null;
  }
  render();
  say(`You took the ${name} back out.`);
}

function placeInSocket(socketId) {
  const socket = getSocket(socketId);
  const occupant = state.filled[socketId];

  if (occupant) {
    removeFromSocket(socketId, socket, occupant);
    return;
  }

  if (!state.held) {
    showNote(aboutId(socketId));
    return;
  }

  const part = getPart(state.held);
  if (part.fits.indexOf(socketId) === -1) {
    say(`The ${part.name} does not fit the ${socket.label.toLowerCase()}.`, 'is-bad');
    return;
  }

  state.filled[socketId] = part.id;
  state.held = null;

  if (state.power) {
    if (socket.hotSwap) {
      interrupt(jackChangedNote(socket.label.toLowerCase()), true);
      render();
      flashNotes();
      say(`You plugged the ${part.name} into a running computer.`);
    } else {
      markDamaged(part.id);
      interrupt(coreAddedNote(part.name), false);
      render();
      flashNotes();
      say(`The ${part.name} was damaged.`, 'is-bad');
    }
    focusStepNav('next');
    return;
  }

  state.boot = null;
  render();
  say(`The ${part.name} is in.`, 'is-good');
}

/* Sort interactions */

function startSort() {
  state.view = 'sort';
  state.held = null;
  state.note = null;
  state.sort = { held: null, assigned: {}, result: null };
  render();
  flashNotes();
  say('Sort every part you installed into a group.');
  const first = els.sortboard.querySelector('button');
  if (first) {
    first.focus();
  }
}

function exitSort() {
  state.view = 'board';
  state.sort = null;
  state.note = null;
  render();
  say('You are back at the board.');
}

function pickUpSortPart(partId) {
  if (state.sort.assigned[partId]) {
    delete state.sort.assigned[partId];
    state.sort.result = null;
    state.sort.held = partId;
    render();
    say(`You are holding the ${getPart(partId).name}. Choose a group.`);
    return;
  }
  state.sort.held = state.sort.held === partId ? null : partId;
  render();
  if (state.sort.held) {
    say(`You are holding the ${getPart(partId).name}. Choose a group.`);
  } else {
    say('You put the part down.');
  }
}

function assignSortPart(categoryId) {
  if (!state.sort.held) {
    say(`Pick a part first, then choose the ${getCategory(categoryId).name} group.`);
    return;
  }
  const partId = state.sort.held;
  state.sort.assigned[partId] = categoryId;
  state.sort.held = null;
  state.sort.result = null;
  render();
  say(`The ${getPart(partId).name} is in the ${getCategory(categoryId).name} group.`, 'is-good');
}

function checkSort() {
  const parts = sortableParts();
  const misses = parts
    .filter(function (part) { return state.sort.assigned[part.id] !== part.category; })
    .map(function (part) { return part.id; });

  state.sort.result = {
    total: parts.length,
    correct: parts.length - misses.length,
    misses: misses
  };
  render();
  flashNotes();
  say(misses.length
    ? 'Some parts are in the wrong group. Read the notes and move them.'
    : 'Every part is in the right group.', misses.length ? 'is-bad' : 'is-good');
}

function clearMarks() {
  state.sort.result = null;
  render();
  say('The marks are cleared. Move any part you want to change.');
}

/* Reset and failure */

function resetAll() {
  state.view = 'board';
  state.held = null;
  state.filled = {};
  state.note = null;
  state.boot = null;
  state.power = false;
  state.damaged = [];
  state.sort = null;
  render();
  say('Reset. Pick a part.');
}

function fail() {
  const p = document.createElement('p');
  p.className = 'status is-bad';
  p.textContent = 'This activity could not start. Reload the page.';
  document.body.insertBefore(p, document.body.firstChild);
}

/* Wiring */

function onBinClick(e) {
  const btn = e.target.closest('.chip');
  if (!btn) {
    return;
  }
  const partId = btn.dataset.partId;
  if (isPlaced(partId) || isDamaged(partId)) {
    showNote(partId);
    return;
  }
  pickUp(partId);
}

function onNoteClick(e) {
  if (e.target.closest('#resume')) {
    state.note = null;
    render();
    focusStepNav('next');
    return;
  }
  if (e.target.closest('#replace')) {
    replacePart(getPart(state.note).id);
    return;
  }
  if (e.target.closest('#prev')) {
    prevStep();
    return;
  }
  if (e.target.closest('#start-sort')) {
    startSort();
    return;
  }
  if (e.target.closest('#next')) {
    nextStep();
  }
}

function onSortClick(e) {
  const chip = e.target.closest('[data-sort-part-id]');
  if (chip) {
    pickUpSortPart(chip.dataset.sortPartId);
    return;
  }
  const drop = e.target.closest('[data-category-id]');
  if (drop) {
    assignSortPart(drop.dataset.categoryId);
    return;
  }
  if (e.target.closest('#check-sort')) {
    checkSort();
    return;
  }
  if (e.target.closest('#clear-marks')) {
    clearMarks();
    return;
  }
  if (e.target.closest('#exit-sort')) {
    exitSort();
  }
}

function onKeyDown(e) {
  if (state.view !== 'board' || !state.boot || state.note) {
    return;
  }
  if (e.key === 'ArrowRight' && state.boot.step + 1 < state.boot.steps.length) {
    e.preventDefault();
    nextStep();
  } else if (e.key === 'ArrowLeft' && state.boot.step > 0) {
    e.preventDefault();
    prevStep();
  }
}

function init() {
  els.status = document.getElementById('status');
  els.stage = document.getElementById('stage');
  els.stageLabel = document.getElementById('stage-label');
  els.sockets = document.getElementById('sockets');
  els.hotspots = document.getElementById('hotspots');
  els.sortboard = document.getElementById('sortboard');
  els.bin = document.getElementById('bin');
  els.notes = document.getElementById('notes');
  els.noteBody = document.getElementById('note-body');
  els.boardTag = document.getElementById('board-tag');
  els.powerLabel = document.getElementById('power-label');
  els.power = document.getElementById('power');
  els.reset = document.getElementById('reset');

  const ok = Object.keys(els).every(function (k) { return Boolean(els[k]); });
  if (!ok) {
    fail();
    return;
  }

  try {
    els.bin.addEventListener('click', onBinClick);
    els.sockets.addEventListener('click', function (e) {
      const btn = e.target.closest('.socket');
      if (btn) {
        placeInSocket(btn.dataset.socketId);
      }
    });
    els.hotspots.addEventListener('click', function (e) {
      const btn = e.target.closest('.hotspot');
      if (btn) {
        showNote(btn.dataset.fixedId);
      }
    });
    els.noteBody.addEventListener('click', onNoteClick);
    els.sortboard.addEventListener('click', onSortClick);
    els.boardTag.addEventListener('click', function () {
      showNote('board');
    });
    els.power.addEventListener('click', togglePower);
    els.reset.addEventListener('click', resetAll);
    document.addEventListener('keydown', onKeyDown);

    buildHotspots();
    render();
  } catch (error) {
    fail();
  }
}

init();
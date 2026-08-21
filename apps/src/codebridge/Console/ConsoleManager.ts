import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';

// Erase the screen (2J), the scrollback (3J), and home the cursor (H).
// Sent as a write rather than calling terminal.clear(): writes are queued and
// flushed asynchronously, while clear() edits the buffer immediately, so clear()
// silently leaves behind any line that has not been written out yet. As a write,
// the erase is applied in order with the lines around it.
const CLEAR_DISPLAY = '\x1b[2J\x1b[3J\x1b[H';

// xterm.js parses writes on a timer rather than on the spot, and throws
// an error once 50MB of unparsed writes have piled up.
// Hand xterm one chunk at a time and hold the rest here:
// nothing of ours is outstanding at the moment we call write(), so its limit
// stays out of reach. Output arriving while this queue is full is counted and
// dropped; a single oversized write, such as a plot, still goes through whole.
const MAX_QUEUED_BYTES = 4_000_000;

const MAX_TERMINAL_LINES = 5000;
const TERMINAL_LINES_TRIM_BATCH = 1000;

// Manager for xterm.js-based console in codebridge
export default class ConsoleManager {
  private terminal: Terminal;
  private terminalFitAddon: FitAddon;
  private terminalLines: string[];
  private inputBuffer: string;
  // If the last line in terminalLines is a partial line or not (i.e. if it was terminated with a newline).
  private lastLineIsPartial: boolean;
  // The message explaining that the coding environment could not be set up, if
  // it could not be. Unlike program output it stays true for the whole session,
  // so this manager owns writing it.
  private codeEnvironmentError: string | null;
  private terminalLinesListeners: ((lines: string[]) => void)[] = [];
  // Writes waiting to be handed to the terminal, and the number of characters
  // in them. See MAX_QUEUED_BYTES.
  private queuedWrites: string[];
  private queuedBytes: number;
  private awaitingWrite: boolean;
  // Characters dropped because the queue was full, reported once the flood ends.
  private droppedCharacters: number;

  constructor(terminal: Terminal, terminalFitAddon: FitAddon) {
    this.terminal = terminal;
    this.terminalFitAddon = terminalFitAddon;
    this.terminalLines = [];
    this.inputBuffer = '';
    this.lastLineIsPartial = false;
    this.codeEnvironmentError = null;
    this.queuedWrites = [];
    this.queuedBytes = 0;
    this.awaitingWrite = false;
    this.droppedCharacters = 0;
  }

  public getTerminal() {
    return this.terminal;
  }

  public getTerminalFitAddon() {
    return this.terminalFitAddon;
  }

  public setTerminal(terminal: Terminal) {
    this.terminal = terminal;
    // The write we are waiting on belongs to the old terminal and its callback
    // may never arrive, so stop waiting for it.
    this.awaitingWrite = false;
    this.flushQueuedWrites();
  }

  public setTerminalFitAddon(terminalFitAddon: FitAddon) {
    this.terminalFitAddon = terminalFitAddon;
  }

  public clearTerminalLines() {
    this.terminalLines = [];
    this.discardQueuedWrites();
    this.droppedCharacters = 0;
    this.writeToTerminal(CLEAR_DISPLAY);
    this.lastLineIsPartial = false;
    // Characters typed since the last newline are erased along with everything
    // else, so keeping them would send text the user can no longer see.
    this.inputBuffer = '';
    this.executeTerminalLinesListeners();
    // The run button is still disabled and its tooltip still points here, so the
    // explanation has to come back with the empty console.
    if (this.codeEnvironmentError) {
      this.writeConsoleMessage(this.codeEnvironmentError, false);
    }
  }

  // Callers may report the same error as often as they like, and may retract it
  // (null) if the environment turns out to work after all. The test for "already
  // printed" is the console's own contents rather than this manager's state,
  // because the error can reach the console without coming through here: a
  // re-created console replays the previous console's lines, error included.
  public setCodeEnvironmentError(error: string | null) {
    const previousError = this.codeEnvironmentError;
    this.codeEnvironmentError = error;

    if (error) {
      if (!this.terminalLines.some(line => line.includes(error))) {
        this.writeConsoleMessage(error, false);
      }
    } else if (previousError) {
      this.removeTerminalLines(line => line.includes(previousError));
    }
  }

  // Takes lines back off the console, keeping the rest. A terminal can only
  // append, so the only way to unprint something is to draw what is left again.
  private removeTerminalLines(matches: (line: string) => boolean) {
    const remainingLines = this.terminalLines.filter(line => !matches(line));
    if (remainingLines.length === this.terminalLines.length) {
      return;
    }
    this.terminalLines = remainingLines;

    // Queued writes are already part of terminalLines, so the redraw covers
    // them; keeping them queued would only draw them a second time.
    this.discardQueuedWrites();
    const redrawnLines = this.terminalLines.map((line, index) => {
      const isLastLine = index === this.terminalLines.length - 1;
      const terminatesLine = !isLastLine || !this.lastLineIsPartial;
      return terminatesLine ? `${line}\r\n` : line;
    });
    // Anything the user has typed since the last newline is not in
    // terminalLines yet, so redraw it too.
    this.writeToTerminal(
      CLEAR_DISPLAY + redrawnLines.join('') + this.inputBuffer
    );

    this.executeTerminalLinesListeners();
  }

  public getTerminalLines() {
    return this.terminalLines;
  }

  // Writing focuses the terminal so the user can type into a program that is
  // asking for input. Pass focusTerminal false for messages the user did not
  // ask for, which would otherwise pull focus out of whatever they are doing.
  public writeConsoleMessage(message: string, focusTerminal = true) {
    const lines = message.split('\n');
    lines.forEach(l => this.appendTerminalLine(l, focusTerminal));
  }

  public writePartialLine(message: string) {
    this.updateTerminalLines(message);
    this.lastLineIsPartial = true;
    this.writeToTerminal(message);
    this.terminal.scrollToBottom();
    this.terminal.focus();
  }

  // Keystrokes are echoed through the same queue as program output, so that a
  // character the user typed cannot reach the screen ahead of output the program
  // printed before it.
  public echoInput(data: string) {
    this.inputBuffer += data;
    this.writeToTerminal(data);
  }

  // Erases the character to the left of the cursor: back up over it, overwrite
  // it with a space, and back up again.
  public echoBackspace() {
    this.inputBuffer = this.inputBuffer.slice(0, -1);
    this.writeToTerminal('\b \b');
  }

  // Ends the line the user was typing on. The buffer itself is handed to the
  // program and recorded separately, see saveAndClearInputBuffer.
  public echoNewline() {
    this.writeToTerminal('\r\n');
  }

  public getInputBuffer() {
    return this.inputBuffer;
  }

  // Store the current input buffer in the terminal and clear the input buffer.
  // We always store the input buffer as a line with a newlne, because we clear it when
  // the user presses enter.
  public saveAndClearInputBuffer() {
    this.updateTerminalLines(this.inputBuffer);
    this.lastLineIsPartial = false;
    this.inputBuffer = '';
  }

  public addTerminalLinesListener(listener: (lines: string[]) => void) {
    this.terminalLinesListeners.push(listener);
  }

  public removeTerminalLinesListener(listener: (lines: string[]) => void) {
    this.terminalLinesListeners = this.terminalLinesListeners.filter(
      l => l !== listener
    );
  }

  private executeTerminalLinesListeners() {
    this.terminalLinesListeners.forEach(listener =>
      listener(this.terminalLines)
    );
  }

  private appendTerminalLine(line: string, focusTerminal = true) {
    this.updateTerminalLines(line);
    this.lastLineIsPartial = false;
    this.writeToTerminal(`${line}\r\n`);
    this.terminal.scrollToBottom();
    if (focusTerminal) {
      this.terminal.focus();
    }
  }

  private updateTerminalLines(message: string) {
    if (this.lastLineIsPartial && this.terminalLines.length > 0) {
      this.terminalLines[this.terminalLines.length - 1] += message;
    } else {
      this.terminalLines.push(message);
      if (
        this.terminalLines.length >
        MAX_TERMINAL_LINES + TERMINAL_LINES_TRIM_BATCH
      ) {
        this.terminalLines.splice(
          0,
          this.terminalLines.length - MAX_TERMINAL_LINES
        );
      }
    }
    this.executeTerminalLinesListeners();
  }

  // Writes are held until the terminal reports that the previous chunk has been parsed.
  private writeToTerminal(data: string) {
    // A write larger than the whole allowance is still let through when nothing
    // is queued, so that one big item, such as a plot, is never half-drawn.
    if (
      this.queuedBytes > 0 &&
      this.queuedBytes + data.length > MAX_QUEUED_BYTES
    ) {
      this.droppedCharacters += data.length;
      return;
    }
    this.queuedWrites.push(data);
    this.queuedBytes += data.length;
    this.flushQueuedWrites();
  }

  private discardQueuedWrites() {
    this.queuedWrites = [];
    this.queuedBytes = 0;
  }

  private flushQueuedWrites() {
    if (this.awaitingWrite || this.queuedWrites.length === 0) {
      return;
    }
    const chunk = this.queuedWrites.join('');
    this.discardQueuedWrites();
    this.awaitingWrite = true;
    try {
      this.terminal.write(chunk, () => {
        this.awaitingWrite = false;
        this.reportDroppedOutput();
        this.flushQueuedWrites();
      });
    } catch {
      // The terminal refuses a write outright once too much of what it has been
      // given is still unparsed, and then never runs the callback, so this is the
      // only place the flag can be cleared. Count the chunk as dropped and let
      // the next write that the terminal does accept report the total; reporting
      // it here would write again, into the same refusal.
      this.awaitingWrite = false;
      this.droppedCharacters += chunk.length;
    }
  }

  // Said once the console has caught up, rather than once per dropped write.
  private reportDroppedOutput() {
    if (this.droppedCharacters === 0 || this.queuedWrites.length > 0) {
      return;
    }
    const dropped = this.droppedCharacters;
    this.droppedCharacters = 0;
    this.appendTerminalLine(
      `[${dropped.toLocaleString()} characters of output were dropped: the program printed faster than the console could display.]`,
      false
    );
  }
}

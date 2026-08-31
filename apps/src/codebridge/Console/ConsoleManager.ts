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
// dropped; a single oversized write still goes through whole.
const MAX_QUEUED_BYTES = 4_000_000;

// How much output is kept for redrawing the console and for handing over to a
// re-created one.
const MAX_TERMINAL_CHARACTERS = 1_000_000;
const TERMINAL_TRIM_BATCH = 200_000;
// The longest single line kept. Output that never sends a newline, such as one
// input prompt after another, would otherwise grow one line without bound.
// Nothing is cut: a message that would take the line past this starts the next
// one instead, which a redraw then draws on a row of its own. A single message
// longer than this is still kept whole, on a line of its own.
const MAX_LINE_CHARACTERS = 100_000;

const countCharacters = (lines: string[]) =>
  lines.reduce((total, line) => total + line.length, 0);

// Manager for xterm.js-based console in codebridge
export default class ConsoleManager {
  private terminal: Terminal;
  private terminalFitAddon: FitAddon;
  private terminalLines: string[];
  private terminalCharacters: number;
  private inputBuffer: string;
  // If the last line in terminalLines is a partial line or not (i.e. if it was terminated with a newline).
  private lastLineIsPartial: boolean;
  // The message explaining that the coding environment could not be set up, if
  // it could not be. Unlike program output it stays true for the whole session,
  // so this manager owns writing it.
  private codeEnvironmentError: string | null;
  private terminalLinesListeners: ((lines: string[]) => void)[] = [];
  private focusOnWrite: boolean;
  private queuedWrites: string[];
  private queuedBytes: number;
  private awaitingWrite: boolean;
  private droppedCharacters: number;

  constructor(terminal: Terminal, terminalFitAddon: FitAddon) {
    this.terminal = terminal;
    this.terminalFitAddon = terminalFitAddon;
    this.terminalLines = [];
    this.terminalCharacters = 0;
    this.inputBuffer = '';
    this.lastLineIsPartial = false;
    this.codeEnvironmentError = null;
    this.focusOnWrite = true;
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

  // Writing focuses the terminal for programs asking for input. Validation
  // never asks, so it should leave focus alone.
  public setFocusOnWrite(focusOnWrite: boolean) {
    this.focusOnWrite = focusOnWrite;
  }

  // xterm ships .live-region as assertive, so writes interrupt the screen
  // reader. Its parent also holds the browsable row list.
  public setPoliteScreenReaderAnnouncements() {
    this.setScreenReaderAnnouncements(true);
  }

  // Silences the console's own announcements without touching what it displays.
  // A lab that narrates its run reads the console's output itself once the
  // narration is done, so the two do not talk over each other.
  public setScreenReaderAnnouncements(enabled: boolean) {
    this.terminal.element
      ?.querySelector('.xterm-accessibility .live-region')
      ?.setAttribute('aria-live', enabled ? 'polite' : 'off');
  }

  public clearTerminalLines() {
    this.terminalLines = [];
    this.terminalCharacters = 0;
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
    this.terminalCharacters = countCharacters(remainingLines);

    // Queued writes are already part of terminalLines, so the redraw covers
    // them; keeping them queued would only draw them a second time.
    this.discardQueuedWrites();
    // Anything the user has typed since the last newline is not in
    // terminalLines yet, so redraw it too.
    this.writeToTerminal(
      CLEAR_DISPLAY + this.drawnTerminalLines() + this.inputBuffer
    );

    this.executeTerminalLinesListeners();
  }

  // terminalLines as one write. Only the last line is left unterminated, and
  // only while it is still being written to.
  private drawnTerminalLines() {
    return this.terminalLines
      .map((line, index) => {
        const isLastLine = index === this.terminalLines.length - 1;
        const terminatesLine = !isLastLine || !this.lastLineIsPartial;
        return terminatesLine ? `${line}\r\n` : line;
      })
      .join('');
  }

  public replayTerminalLines(lines: string[]) {
    if (lines.length === 0) {
      return;
    }
    this.terminalLines = [...lines];
    this.terminalCharacters = countCharacters(this.terminalLines);
    this.trimTerminalLines();
    // Where the previous console broke its lines is not carried over, so every
    // replayed line is drawn as a line of its own.
    this.lastLineIsPartial = false;
    this.writeToTerminal(this.drawnTerminalLines());
    this.terminal.scrollToBottom();
    // No focus: this is history being redrawn after a remount, not output
    // arriving now, so it must not pull the user out of whatever they are in.
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
    this.focusTerminal();
  }

  public echoInput(data: string) {
    this.inputBuffer += data;
    this.echoToTerminal(data);
  }

  // Erases the character to the left of the cursor: back up over it, overwrite
  // it with a space, and back up again.
  public echoBackspace() {
    this.inputBuffer = this.inputBuffer.slice(0, -1);
    this.echoToTerminal('\b \b');
  }

  // Ends the line the user was typing on. The buffer itself is handed to the
  // program and recorded separately, see saveAndClearInputBuffer.
  public echoNewline() {
    this.echoToTerminal('\r\n');
  }

  // What the user types goes straight to the terminal instead of through the
  // queue. Behind a backlog of program output a queued keystroke would not show
  // up until the backlog had drained, which reads as typing being broken.
  private echoToTerminal(data: string) {
    try {
      this.terminal.write(data);
    } catch {
      // The terminal refuses writes once too much of what it holds is unparsed,
      // and the echo is not worth reporting as lost output: the character is in
      // the input buffer, so the program still receives it and the next redraw
      // still draws it.
    }
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

  private appendTerminalLine(line: string, shouldFocus = true) {
    this.updateTerminalLines(line);
    this.lastLineIsPartial = false;
    this.writeToTerminal(`${line}\r\n`);
    this.terminal.scrollToBottom();
    if (shouldFocus) {
      this.focusTerminal();
    }
  }

  // Every write focuses through here, so setFocusOnWrite governs all of them.
  private focusTerminal() {
    if (this.focusOnWrite) {
      this.terminal.focus();
    }
  }

  private updateTerminalLines(message: string) {
    const lastLine = this.terminalLines[this.terminalLines.length - 1];
    if (
      this.lastLineIsPartial &&
      lastLine !== undefined &&
      lastLine.length + message.length <= MAX_LINE_CHARACTERS
    ) {
      this.terminalLines[this.terminalLines.length - 1] = lastLine + message;
    } else {
      this.terminalLines.push(message);
    }
    this.terminalCharacters += message.length;
    this.trimTerminalLines();
    this.executeTerminalLinesListeners();
  }

  // Drops the oldest lines once the record is over its limit. The last line is
  // always kept: it is the one being written to, and a single message
  // can be larger than the whole allowance on its own.
  private trimTerminalLines() {
    if (
      this.terminalCharacters <=
      MAX_TERMINAL_CHARACTERS + TERMINAL_TRIM_BATCH
    ) {
      return;
    }
    let firstKeptLine = 0;
    while (
      this.terminalCharacters > MAX_TERMINAL_CHARACTERS &&
      firstKeptLine < this.terminalLines.length - 1
    ) {
      this.terminalCharacters -= this.terminalLines[firstKeptLine].length;
      firstKeptLine++;
    }
    this.terminalLines.splice(0, firstKeptLine);
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
      // If we hit an error, count the chunk as dropped.
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

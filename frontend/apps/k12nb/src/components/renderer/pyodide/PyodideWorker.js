"use strict";
/// <reference lib="webworker" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var additionalPackagesFromCode_1 = require("./additionalPackagesFromCode");
var implementOverride_1 = require("./overrides/implementOverride");
var pyodide;
var interruptBuffer = null;
var hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
function runPythonFile(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    code = _a.sent();
                    return [4 /*yield*/, pyodide.runPythonAsync(code)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var loadPyodide, loadPyodide, buffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('PyodideWorker: Starting Pyodide initialization...', process.env.NEXT_PUBLIC_BASE_URL);
                    if (!(process.env.NODE_ENV === 'development')) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("/pyodide/pyodide.mjs"); })];
                case 1:
                    loadPyodide = (_a.sent()).loadPyodide;
                    return [4 /*yield*/, loadPyodide()];
                case 2:
                    pyodide = _a.sent();
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, Promise.resolve().then(function () { return require("/pyodide/pyodide.mjs"); })];
                case 4:
                    loadPyodide = (_a.sent()).loadPyodide;
                    return [4 /*yield*/, loadPyodide()];
                case 5:
                    pyodide = _a.sent();
                    _a.label = 6;
                case 6:
                    console.log('PyodideWorker: Checking for interrupt buffer');
                    if (hasSharedArrayBuffer) {
                        buffer = new SharedArrayBuffer(4);
                        interruptBuffer = new Int32Array(buffer);
                        pyodide.setInterruptBuffer(interruptBuffer);
                        console.log('PyodideWorker: Interrupt buffer created');
                    }
                    else {
                        console.warn('PyodideWorker: SharedArrayBuffer is not available, interrupt functionality will be disabled');
                    }
                    // Override stdout
                    console.log('PyodideWorker: Creating override for stdout');
                    pyodide.globals.set('_override_stdout', {
                        write: function (text) {
                            self.postMessage({ type: 'stdout', text: text });
                            return text.length;
                        },
                        flush: function () {
                            /* no-op */
                        },
                    });
                    // Override input
                    console.log('PyodideWorker: Overriding input calls with async equivalent');
                    runPythonFile(new URL('./async_input.py', import.meta.url));
                    console.log('PyodideWorkder: Creating override for input');
                    pyodide.globals.set('_override_input', function (prompt) {
                        return new Promise(function (resolve) {
                            self.postMessage({
                                type: 'input_request',
                                message: prompt || '',
                            });
                            var messageHandler = function (event) {
                                if (event.data.type === 'input_response') {
                                    self.removeEventListener('message', messageHandler);
                                    resolve(event.data.value);
                                }
                            };
                            self.addEventListener('message', messageHandler);
                        });
                    });
                    // Override base64 image updates
                    console.log('PyodideWorker: Creating override for js functions');
                    pyodide.globals.set('js', {
                        imageBase64: function (image_base64) {
                            self.postMessage({
                                type: 'execute_result',
                                result: { 'image/png': [image_base64] },
                            });
                        },
                    });
                    console.log('PyodideWorker: Initializing Python environment');
                    runPythonFile(new URL('./python_init.py', import.meta.url));
                    return [2 /*return*/];
            }
        });
    });
}
self.onmessage = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, type, data, _b, error_1, code, cellId, basePackages, additionalPackages, _i, _c, loadedPackage, transformedCode, result, error_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = event.data, type = _a.type, data = __rest(_a, ["type"]);
                _b = type;
                switch (_b) {
                    case 'initialize': return [3 /*break*/, 1];
                    case 'run': return [3 /*break*/, 5];
                }
                return [3 /*break*/, 18];
            case 1:
                _d.trys.push([1, 3, , 4]);
                return [4 /*yield*/, initialize()];
            case 2:
                _d.sent();
                self.postMessage({
                    type: 'initialized',
                    interruptBuffer: interruptBuffer ? interruptBuffer.buffer : null,
                    hasInterrupt: hasSharedArrayBuffer,
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _d.sent();
                console.error('PyodideWorker: Failed to initialize Pyodide:', error_1);
                self.postMessage({ type: 'fatal', error: String(error_1) });
                return [3 /*break*/, 4];
            case 4: return [3 /*break*/, 18];
            case 5:
                code = data.code;
                cellId = data.cellId;
                _d.label = 6;
            case 6:
                _d.trys.push([6, 16, , 17]);
                if (!pyodide) return [3 /*break*/, 15];
                console.log('PyodideProvider: Loading packages from imports');
                return [4 /*yield*/, pyodide.loadPackagesFromImports(code)];
            case 7:
                basePackages = _d.sent();
                console.log('PyodideProvider: Loading additional packages from code');
                return [4 /*yield*/, pyodide.loadPackage((0, additionalPackagesFromCode_1.additionalPackagesFromCode)(code))];
            case 8:
                additionalPackages = _d.sent();
                console.log('PyodideProvider: Searching for overrides');
                _i = 0, _c = __spreadArray(__spreadArray([], basePackages, true), additionalPackages, true);
                _d.label = 9;
            case 9:
                if (!(_i < _c.length)) return [3 /*break*/, 12];
                loadedPackage = _c[_i];
                if (!(implementOverride_1.overrides.indexOf(loadedPackage.name) !== -1)) return [3 /*break*/, 11];
                console.log("PyodideProvider: Implementing override for ".concat(loadedPackage.name));
                return [4 /*yield*/, (0, implementOverride_1.implementOverride)(pyodide, loadedPackage.name)];
            case 10:
                _d.sent();
                _d.label = 11;
            case 11:
                _i++;
                return [3 /*break*/, 9];
            case 12:
                // Transform the code first
                console.log("PyodideProvider: Transforming code to support async inputs");
                return [4 /*yield*/, pyodide.runPythonAsync("transform_code(".concat(JSON.stringify(code), ")"))];
            case 13:
                transformedCode = _d.sent();
                // Run the cell code
                console.log("PyodideProvider: Running cell ".concat(cellId));
                return [4 /*yield*/, pyodide.runPythonAsync("".concat(transformedCode))];
            case 14:
                result = _d.sent();
                console.log('PyodideProvider: Returning result');
                if (result) {
                    if (typeof result == 'object') {
                        // Add result representations, if they exist
                        if ('_repr_svg_' in result) {
                            self.postMessage({
                                type: 'execute_result',
                                result: { 'image/svg+xml': result._repr_svg_() },
                            });
                        }
                        if ('_repr_html_' in result) {
                            self.postMessage({
                                type: 'execute_result',
                                result: { 'text/html': result._repr_html_() },
                            });
                        }
                        if ('_repr_png_' in result) {
                            self.postMessage({
                                type: 'execute_result',
                                result: { 'image/png': result._repr_png_() },
                            });
                        }
                        // Add the default result representation
                        self.postMessage({
                            type: 'execute_result',
                            result: { 'text/plain': result.__repr__() },
                        });
                    }
                    else {
                        // The result is not an object. Just pass the result back as a string.
                        self.postMessage({
                            type: 'execute_result',
                            result: { 'text/plain': result.toString() },
                        });
                    }
                }
                self.postMessage({ type: 'execute_completed' });
                _d.label = 15;
            case 15: return [3 /*break*/, 17];
            case 16:
                error_2 = _d.sent();
                console.error(error_2);
                self.postMessage({ type: 'error', error: String(error_2) });
                return [3 /*break*/, 17];
            case 17: return [3 /*break*/, 18];
            case 18: return [2 /*return*/];
        }
    });
}); };

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylize = exports.BG_WHITE = exports.BG_CYAN = exports.BG_MAGENTA = exports.BG_BLUE = exports.BG_YELLOW = exports.BG_GREEN = exports.BG_RED = exports.BG_BLACK = exports.FG_WHITE = exports.FG_CYAN = exports.FG_MAGENTA = exports.FG_BLUE = exports.FG_YELLOW = exports.FG_GREEN = exports.FG_RED = exports.FG_BLACK = exports.UNDERLINE = exports.ITALIC = exports.FAINT = exports.BOLD = exports.RESET = void 0;
exports.RESET = 0;
exports.BOLD = 1;
exports.FAINT = 2;
exports.ITALIC = 3;
exports.UNDERLINE = 4;
exports.FG_BLACK = 30;
exports.FG_RED = 31;
exports.FG_GREEN = 32;
exports.FG_YELLOW = 33;
exports.FG_BLUE = 34;
exports.FG_MAGENTA = 35;
exports.FG_CYAN = 36;
exports.FG_WHITE = 37;
exports.BG_BLACK = 40;
exports.BG_RED = 41;
exports.BG_GREEN = 42;
exports.BG_YELLOW = 43;
exports.BG_BLUE = 44;
exports.BG_MAGENTA = 45;
exports.BG_CYAN = 46;
exports.BG_WHITE = 47;
function stylize(string, ...parameters) {
    return `\x1B[${parameters.join(";")}m` + string + `\x1B[${exports.RESET}m`;
}
exports.stylize = stylize;
;

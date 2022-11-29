export const RESET = 0;
export const BOLD = 1;
export const FAINT = 2;
export const ITALIC = 3;
export const UNDERLINE = 4;

export const FG_BLACK = 30;
export const FG_RED = 31;
export const FG_GREEN = 32;
export const FG_YELLOW = 33;
export const FG_BLUE = 34;
export const FG_MAGENTA = 35;
export const FG_CYAN = 36;
export const FG_WHITE = 37;

export const BG_BLACK = 40;
export const BG_RED = 41;
export const BG_GREEN = 42;
export const BG_YELLOW = 43;
export const BG_BLUE = 44;
export const BG_MAGENTA = 45;
export const BG_CYAN = 46;
export const BG_WHITE = 47;

export function stylize(string: any, ...parameters: Array<number>): string {
	return `\x1B[${parameters.join(";")}m` + string + `\x1B[${RESET}m`;
};

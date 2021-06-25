"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.present = exports.absent = void 0;
function absent(subject) {
    return subject == null;
}
exports.absent = absent;
;
function present(subject) {
    return subject != null;
}
exports.present = present;
;

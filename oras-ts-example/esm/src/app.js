"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.ts
const oras_bin_wrapper_1 = __importDefault(require("oras-bin-wrapper"));
const child_process_1 = require("child_process");
// Get the binary path
console.log(`ORAS binary path: ${oras_bin_wrapper_1.default}`);
// Execute the binary
try {
    const result = (0, child_process_1.execSync)(`${oras_bin_wrapper_1.default} version`, { encoding: 'utf8' });
    console.log('ORAS version:', result.trim());
}
catch (error) {
    console.error('Error executing ORAS binary:', error);
}

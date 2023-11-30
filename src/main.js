import { Assembler } from "./assembler";

const asm = new Assembler('');


const input = `
start:
    leax y,d,u
`

asm.reset(input);

console.log(print_hex(asm.assemble()));


function print_hex(arr) {
    const hex_array = arr.map(num => '0x' + num.toString(16).padStart(2, '0').toUpperCase() + ',');
    console.log(hex_array.join(' '));
}
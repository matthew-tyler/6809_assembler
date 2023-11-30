const moo = require('moo');

const opcodes = ['neg', 'com', 'lsr', 'ror', 'asr', 'asl', 'lsl', 'rol', 'dec', 'inc', 'tst', 'jmp', 'clr', 'nop', 'sync', 'lbra', 'lbsr', 'daa', 'orcc', 'andcc', 'sex', 'exg', 'tfr', 'bra', 'brn', 'bhi', 'bls', 'bcc', 'bhs', 'bcs', 'blo', 'bne', 'beq', 'bvc', 'bvs', 'bpl', 'bmi', 'bge', 'blt', 'bgt', 'ble', 'leax', 'leay', 'leas', 'leau', 'pshs', 'puls', 'pshu', 'pulu', 'rts', 'abx', 'rti', 'cwai', 'mul', 'swi', 'nega', 'coma', 'lsra', 'rora', 'asra', 'asla', 'lsla', 'rola', 'deca', 'inca', 'tsta', 'clra', 'negb', 'comb', 'lsrb', 'rorb', 'asrb', 'aslb', 'lslb', 'rolb', 'decb', 'incb', 'tstb', 'clrb', 'suba', 'cmpa', 'sbca', 'subd', 'anda', 'bita', 'lda', 'sta', 'eora', 'adca', 'ora', 'adda', 'cmpx', 'ldx', 'stx', 'bsr', 'jsr', 'subb', 'cmpb', 'sbcb', 'addd', 'andb', 'bitb', 'ldb', 'stb', 'eorb', 'adcb', 'orb', 'addb', 'ldd', 'std', 'ldu', 'stu', 'lbrn', 'lbhi', 'lbls', 'lbcc', 'lbhs', 'lbcs', 'lblo', 'lbne', 'lbeq', 'lbvc', 'lbvs', 'lbpl', 'lbmi', 'lbge', 'lblt', 'lbgt', 'lble', 'swi2', 'cmpd', 'cmpy', 'ldy', 'sty', 'lds', 'sts', 'swi3', 'cmpu', 'cmps']
const registers = ["cc", "a", "b", "dp", "x", "y", "u", "s", "pc", "d", "pcr"];
const directives = [
    ".byte", "equ", "const", "org", "end", "rmb", "ds", "var", "setdp", "direct", "fill",
    "db", "fcb", "fcc", "dw", "fdb", ".word"
];


const all_keywords = {
    "OPCODE": opcodes.concat(opcodes.map(value => value.toUpperCase())), // include uppercase variant
    "REGISTER": registers.concat(registers.map(value => value.toUpperCase())),
    "DIRECTIVE": directives.concat(directives.map(value => value.toUpperCase())),
};


export const lexer = moo.compile({
    WS: /[ \t]+/,
    COMMENT: /[;\*].*/,
    LABEL: {
        match: /[a-zA-Z_][a-zA-Z0-9_]*:/,
        value: s => s.slice(0, -1).toLowerCase() // remove the trailing ":"
    },
    INTEGER: {
        match: [
            /[-+]?(?:%[01]+)/,           // Binary with % prefix
            /[-+]?(?:0b[01]+)/,           // Binary with 0b prefix
            /[-+]?(?:\$[0-9A-Fa-f]+)/,    // Hex with $ prefix
            /[-+]?(?:0x[0-9A-Fa-f]+)/,     // Hex with 0x prefix
            /[-+]?[0-9]+/,                // Decimal
        ],
        value: (x) => {

            let sign = 1;

            if (x.startsWith('-')) {
                sign = -1;
                x = x.slice(1);
            }

            if (x.startsWith('%') || x.startsWith('0b')) {
                return parseInt(x.replace(/^[-+]?[%0b]/, ''), 2) * sign;
            } else if (x.startsWith('$') || x.startsWith('0x')) {
                return parseInt(x.replace(/^[-+]?[\$0x]x?/, ''), 16) * sign;
            } else {
                return parseInt(x, 10) * sign;
            }
        }
    },

    STRING: {
        match: /"(?:\\["\\]|[^"\n])*"/,
        value: x => x.slice(1, -1)
    },
    CHAR: [
        { match: /'.'/, value: s => s.slice(1, -1) },  // surrounded by single quotes
        { match: /'.?/, value: s => s.slice(1) }       // single starting quote
    ],
    IDENTIFIER: { match: /[a-zA-Z0-9.]+/, type: moo.keywords(all_keywords), value: (x) => x.toLowerCase() },
    INC2: /\+\+/,
    DEC2: /\-\-/,
    INC: /\+/,
    DEC: /\-/,
    EQ: /=/,
    DIRECT: /\</,
    EXT_DIR: /\>/,
    IMMEDIATE: /\#/,
    INDIRECT_START: /\[/,
    INDIRECT_END: /\]/,
    COMMA: /,/,
    NL: { match: /\n/, lineBreaks: true },

});



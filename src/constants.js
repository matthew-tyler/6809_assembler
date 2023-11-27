export const opcodes = new Map([
    [
        "neg",
        {
            direct: { code: 0x00, size: 2 },
            indexed: { code: 0x60, size: 2 },
            extended: { code: 0x70, size: 3 },
        }
    ],
    [
        "com",
        {
            direct: { code: 0x03, size: 2 },
            indexed: { code: 0x63, size: 2 },
            extended: { code: 0x73, size: 3 },
        }
    ],
    [

        "lsr",
        {
            direct: { code: 0x04, size: 2 },
            indexed: { code: 0x64, size: 2 },
            extended: { code: 0x74, size: 3 },
        }
    ],
    [
        "ror",
        {
            direct: { code: 0x06, size: 2 },
            indexed: { code: 0x66, size: 2 },
            extended: { code: 0x76, size: 3 },
        }
    ],
    [
        "asr",
        {
            direct: { code: 0x07, size: 2 },
            indexed: { code: 0x67, size: 2 },
            extended: { code: 0x77, size: 3 },
        }
    ],
    [
        "asl",
        {
            direct: { code: 0x08, size: 2 },
            indexed: { code: 0x68, size: 2 },
            extended: { code: 0x78, size: 3 },
        }
    ],
    [
        "lsl",
        {
            direct: { code: 0x08, size: 2 },
            indexed: { code: 0x68, size: 2 },
            extended: { code: 0x78, size: 3 },
        },
    ],
    [
        "rol",
        {
            direct: { code: 0x09, size: 2 },
            indexed: { code: 0x69, size: 2 },
            extended: { code: 0x79, size: 3 },
        }
    ],
    [
        "dec",
        {
            direct: { code: 0x0A, size: 2 },
            indexed: { code: 0x6A, size: 2 },
            extended: { code: 0x7A, size: 3 },
        }
    ],
    [
        "inc",
        {
            direct: { code: 0x0C, size: 2 },
            indexed: { code: 0x6C, size: 2 },
            extended: { code: 0x7C, size: 3 },
        }
    ],
    [
        "tst",
        {
            direct: { code: 0x0D, size: 2 },
            indexed: { code: 0x6D, size: 2 },
            extended: { code: 0x7D, size: 3 },
        }
    ],
    [
        "jmp",
        {
            direct: { code: 0x0E, size: 2 },
            indexed: { code: 0x6E, size: 2 },
            extended: { code: 0x7E, size: 3 },
        }
    ],
    [
        "clr",
        {
            direct: { code: 0x0F, size: 2 },
            indexed: { code: 0x6F, size: 2 },
            extended: { code: 0x7F, size: 3 },
        }
    ],
    [
        "nop",
        {
            inherent: { code: 0x12, size: 1 },
        },
    ],
    [
        "sync",
        {
            inherent: { code: 0x12, size: 1 },
        },
    ],
    [
        "lbra",
        {
            relative: { code: 0x16, size: 3 },
        },
    ],
    [
        "lbsr",
        {
            relative: { code: 0x17, size: 3 },
        },
    ],
    [
        "daa",
        {
            inherent: { code: 0x19, size: 1 },
        },
    ],
    [
        "orcc",
        {
            immediate: { code: 0x1a, size: 2 },
        },
    ],
    [
        "andcc",
        {
            immediate: { code: 0x1c, size: 2 },
        },
    ],
    [
        "sex",
        {
            inherent: { code: 0x1d, size: 1 },
        },
    ],
    [
        "exg",
        {
            immediate: { code: 0x1e, size: 2 },
        },
    ],
    [
        "tfr",
        {
            immediate: { code: 0x1f, size: 2 },
        },
    ],
    [
        "bra",
        {
            relative: { code: 0x20, size: 2 },
        },
    ],
    [
        "brn",
        {
            relative: { code: 0x21, size: 2 },
        },
    ],
    [
        "bhi",
        {
            relative: { code: 0x22, size: 2 },
        },
    ],
    [
        "bls",
        {
            relative: { code: 0x23, size: 2 },
        },
    ],
    [
        "bcc",
        {
            relative: { code: 0x24, size: 2 },
        },
    ],
    [
        "bhs",
        {
            relative: { code: 0x24, size: 2 },
        },
    ],
    [
        "bcs",
        {
            relative: { code: 0x25, size: 2 },
        },
    ],
    [
        "blo",
        {
            relative: { code: 0x25, size: 2 },
        },
    ],
    [
        "bne",
        {
            relative: { code: 0x26, size: 2 },
        },
    ],
    [
        "beq",
        {
            relative: { code: 0x27, size: 2 },
        },
    ],
    [
        "bvc",
        {
            relative: { code: 0x28, size: 2 },
        },
    ],
    [
        "bvs",
        {
            relative: { code: 0x29, size: 2 },
        },
    ],
    [
        "bpl",
        {
            relative: { code: 0x2a, size: 2 },
        },
    ],
    [
        "bmi",
        {
            relative: { code: 0x2b, size: 2 },
        },
    ],
    [
        "bge",
        {
            relative: { code: 0x2c, size: 2 },
        },
    ],
    [
        "blt",
        {
            relative: { code: 0x2d, size: 2 },
        },
    ],
    [
        "bgt",
        {
            relative: { code: 0x2e, size: 2 },
        },
    ],
    [
        "ble",
        {
            relative: { code: 0x2f, size: 2 },
        },
    ],
    [
        "leax",
        {
            indexed: { code: 0x30, size: 2 },
        },
    ],
    [
        "leay",
        {
            indexed: { code: 0x31, size: 2 },
        },
    ],
    [
        "leas",
        {
            indexed: { code: 0x32, size: 2 },
        },
    ],
    [
        "leau",
        {
            indexed: { code: 0x33, size: 2 },
        },
    ],
    [
        "pshs",
        {
            immediate: { code: 0x34, size: 2 },
        },
    ],
    [
        "puls",
        {
            immediate: { code: 0x35, size: 2 },
        },
    ],
    [
        "pshu",
        {
            immediate: { code: 0x36, size: 4 },
        },
    ],
    [
        "pulu",
        {
            immediate: { code: 0x36, size: 2 },
        },
    ],
    [
        "rts",
        {
            inherent: { code: 0x39, size: 1 },
        },
    ],
    [
        "abx",
        {
            inherent: { code: 0x3a, size: 1 },
        },
    ],
    [
        "rti",
        {
            inherent: { code: 0x3b, size: 1 },
        },
    ],
    [
        "cwai",
        {
            immediate: { code: 0x3c, size: 2 },
        },
    ],
    [
        "mul",
        {
            inherent: { code: 0x3D, size: 1 },
        },
    ],
    [
        "swi",
        {
            inherent: { code: 0x3F, size: 1 },
        },
    ],
    [
        "nega",
        {
            inherent: { code: 0x40, size: 1 },
        },
    ],
    [
        "coma",
        {
            inherent: { code: 0x43, size: 1 },
        },
    ],
    [
        "lsra",
        {
            inherent: { code: 0x44, size: 1 },
        },
    ],
    [
        "rora",
        {
            inherent: { code: 0x46, size: 1 },
        },
    ],
    [
        "asra",
        {
            inherent: { code: 0x47, size: 1 },
        },
    ],
    [
        "asla",
        {
            inherent: { code: 0x48, size: 1 },
        },
    ],
    [
        "lsla",
        {
            inherent: { code: 0x48, size: 1 }, // Note: ASLA and LSLA have the same opcode.
        },
    ],
    [
        "rola",
        {
            inherent: { code: 0x49, size: 1 },
        },
    ],
    [
        "deca",
        {
            inherent: { code: 0x4A, size: 1 },
        },
    ],
    [
        "inca",
        {
            inherent: { code: 0x4C, size: 1 },
        },
    ],
    [
        "tsta",
        {
            inherent: { code: 0x4D, size: 1 },
        },
    ],
    [
        "clra",
        {
            inherent: { code: 0x4F, size: 1 },
        },
    ],
    [
        "negb",
        {
            inherent: { code: 0x50, size: 1 },
        },
    ],
    [
        "comb",
        {
            inherent: { code: 0x53, size: 1 },
        },
    ],
    [
        "lsrb",
        {
            inherent: { code: 0x54, size: 1 },
        },
    ],
    [
        "rorb",
        {
            inherent: { code: 0x56, size: 1 },
        },
    ],
    [
        "asrb",
        {
            inherent: { code: 0x57, size: 1 },
        },
    ],
    [
        "aslb",
        {
            inherent: { code: 0x58, size: 1 },
        },
    ],
    [
        "lslb",
        {
            inherent: { code: 0x58, size: 1 }, // Note: ASLB and LSLB have the same opcode.
        },
    ],
    [
        "rolb",
        {
            inherent: { code: 0x59, size: 1 },
        },
    ],
    [
        "decb",
        {
            inherent: { code: 0x5A, size: 1 },
        },
    ],
    [
        "incb",
        {
            inherent: { code: 0x5C, size: 1 },
        },
    ],
    [
        "tstb",
        {
            inherent: { code: 0x5D, size: 1 },
        },
    ],
    [
        "clrb",
        {
            inherent: { code: 0x5F, size: 1 },
        },
    ],
    [
        "suba",
        {
            immediate: { code: 0x80, size: 2 },
            direct: { code: 0x90, size: 2 },
            indexed: { code: 0xA0, size: 2 },
            extended: { code: 0xB0, size: 3 },
        }
    ],
    [
        "cmpa",
        {
            immediate: { code: 0x81, size: 2 },
            direct: { code: 0x91, size: 2 },
            indexed: { code: 0xA1, size: 2 },
            extended: { code: 0xB1, size: 3 },
        }
    ],
    [
        "sbca",
        {
            immediate: { code: 0x82, size: 2 },
            direct: { code: 0x92, size: 2 },
            indexed: { code: 0xA2, size: 2 },
            extended: { code: 0xB2, size: 3 },
        }
    ],
    [
        "subd",
        {
            immediate: { code: 0x83, size: 3 },
            direct: { code: 0x93, size: 2 },
            indexed: { code: 0xA3, size: 2 },
            extended: { code: 0xB3, size: 3 },
        }
    ],
    [
        "anda",
        {
            immediate: { code: 0x84, size: 2 },
            direct: { code: 0x94, size: 2 },
            indexed: { code: 0xA4, size: 2 },
            extended: { code: 0xB4, size: 3 },
        }
    ],
    [
        "bita",
        {
            immediate: { code: 0x85, size: 2 },
            direct: { code: 0x95, size: 2 },
            indexed: { code: 0xA5, size: 2 },
            extended: { code: 0xB5, size: 3 },
        }
    ],
    [
        "lda",
        {
            immediate: { code: 0x86, size: 2 },
            direct: { code: 0x96, size: 2 },
            indexed: { code: 0xA6, size: 2 },
            extended: { code: 0xB6, size: 3 },
        }
    ],
    [
        "sta",
        {
            direct: { code: 0x97, size: 2 },
            indexed: { code: 0xA7, size: 2 },
            extended: { code: 0xB7, size: 3 },
        }
    ],
    [
        "eora",
        {
            immediate: { code: 0x88, size: 2 },
            direct: { code: 0x98, size: 2 },
            indexed: { code: 0xA8, size: 2 },
            extended: { code: 0xB8, size: 3 },
        }
    ],
    [
        "adca",
        {
            immediate: { code: 0x89, size: 2 },
            direct: { code: 0x99, size: 2 },
            indexed: { code: 0xA9, size: 2 },
            extended: { code: 0xB9, size: 3 },
        }
    ],
    [
        "ora",
        {
            immediate: { code: 0x8A, size: 2 },
            direct: { code: 0x9A, size: 2 },
            indexed: { code: 0xAA, size: 2 },
            extended: { code: 0xBA, size: 3 },
        }
    ],
    [
        "adda",
        {
            immediate: { code: 0x8B, size: 2 },
            direct: { code: 0x9B, size: 2 },
            indexed: { code: 0xAB, size: 2 },
            extended: { code: 0xBB, size: 3 },
        }
    ],
    [
        "cmpx",
        {
            direct: { code: 0x9c, size: 2 },
            indexed: { code: 0xac, size: 2 },
            immediate: { code: 0x8c, size: 3 },
            extended: { code: 0xbc, size: 3 },
        },
    ],
    [
        "ldx",
        {
            direct: { code: 0x9e, size: 2 },
            indexed: { code: 0xae, size: 2 },
            immediate: { code: 0x8e, size: 3 },
            extended: { code: 0xbe, size: 3 },
        },
    ],
    [
        "stx",
        {
            direct: { code: 0x9f, size: 2 },
            indexed: { code: 0xaf, size: 2 },
            extended: { code: 0xbf, size: 3 },
        },
    ],
    [
        "bsr",
        {
            relative: { code: 0x8d, size: 2 },
        },
    ],
    [
        "jsr",
        {
            direct: { code: 0x9d, size: 2 },
            indexed: { code: 0xad, size: 2 },
            extended: { code: 0xbd, size: 3 },
        },
    ],
    [
        "subb",
        {
            direct: { code: 0xd0, size: 2 },
            indexed: { code: 0xe0, size: 2 },
            immediate: { code: 0xc0, size: 2 },
            extended: { code: 0xf0, size: 3 },
        },
    ],
    [
        "cmpb",
        {
            direct: { code: 0xd1, size: 2 },
            indexed: { code: 0xe1, size: 2 },
            immediate: { code: 0xc1, size: 2 },
            extended: { code: 0xf1, size: 3 },
        },
    ],
    [
        "sbcb",
        {
            direct: { code: 0xd2, size: 2 },
            indexed: { code: 0xe2, size: 2 },
            immediate: { code: 0xc2, size: 2 },
            extended: { code: 0xf2, size: 3 },
        },
    ],
    [
        "addd",
        {
            direct: { code: 0xd3, size: 2 },
            indexed: { code: 0xe3, size: 2 },
            immediate: { code: 0xc3, size: 3 },
            extended: { code: 0xf3, size: 3 },
        },
    ],
    [
        "andb",
        {
            direct: { code: 0xd4, size: 3 },
            indexed: { code: 0xe4, size: 2 },
            immediate: { code: 0xc4, size: 2 },
            extended: { code: 0xf4, size: 3 },
        },
    ],
    ["bitb", { direct: { code: 0xd5, size: 2 }, indexed: { code: 0xe5, size: 2 }, immediate: { code: 0xc5, size: 2 }, extended: { code: 0xf5, size: 3 } }],
    ["ldb", { direct: { code: 0xd6, size: 2 }, indexed: { code: 0xe6, size: 2 }, immediate: { code: 0xc6, size: 2 }, extended: { code: 0xf6, size: 3 } }],
    ["stb", { direct: { code: 0xd7, size: 2 }, indexed: { code: 0xe7, size: 2 }, extended: { code: 0xf7, size: 3 } }],
    ["eorb", { direct: { code: 0xd8, size: 2 }, indexed: { code: 0xe8, size: 2 }, immediate: { code: 0xc8, size: 2 }, extended: { code: 0xf8, size: 3 } }],
    ["adcb", { direct: { code: 0xd9, size: 2 }, indexed: { code: 0xe9, size: 2 }, immediate: { code: 0xc9, size: 2 }, extended: { code: 0xf9, size: 3 } }],
    ["orb", { direct: { code: 0xda, size: 2 }, indexed: { code: 0xea, size: 2 }, immediate: { code: 0xca, size: 2 }, extended: { code: 0xfa, size: 3 } }],
    ["addb", { direct: { code: 0xdb, size: 2 }, indexed: { code: 0xeb, size: 2 }, immediate: { code: 0xcb, size: 2 }, extended: { code: 0xfb, size: 3 } }],
    ["ldd", { direct: { code: 0xdc, size: 2 }, indexed: { code: 0xec, size: 2 }, immediate: { code: 0xcc, size: 3 }, extended: { code: 0xfc, size: 3 } }],
    ["std", { direct: { code: 0xdd, size: 2 }, indexed: { code: 0xed, size: 2 }, extended: { code: 0xfd, size: 3 } }],
    ["ldu", { direct: { code: 0xde, size: 2 }, indexed: { code: 0xee, size: 2 }, immediate: { code: 0xce, size: 3 }, extended: { code: 0xfe, size: 3 } }],
    ["stu", { direct: { code: 0xdf, size: 2 }, indexed: { code: 0xef, size: 2 }, extended: { code: 0xff, size: 3 } }],

    [
        "lbrn",
        {
            relative: { code: 0x1021, size: 4 },
        },
    ],
    [
        "lbhi",
        {
            relative: { code: 0x1022, size: 4 },
        },
    ],
    [
        "lbls",
        {
            relative: { code: 0x1023, size: 4 },
        },
    ],
    [
        "lbcc",
        {
            relative: { code: 0x1024, size: 4 },
        },
    ],
    [
        "lbhs", // Note: LBHS and LBCC have the same opcode
        {
            relative: { code: 0x1024, size: 4 },
        },
    ],
    [
        "lbcs",
        {
            relative: { code: 0x1025, size: 4 },
        },
    ],
    [
        "lblo", // Note: LBLO and LBCS have the same opcode
        {
            relative: { code: 0x1025, size: 4 },
        },
    ],
    [
        "lbne",
        {
            relative: { code: 0x1026, size: 4 },
        },
    ],
    [
        "lbeq",
        {
            relative: { code: 0x1027, size: 4 },
        },
    ],
    [
        "lbvc",
        {
            relative: { code: 0x1028, size: 4 },
        },
    ],
    [
        "lbvs",
        {
            relative: { code: 0x1029, size: 4 },
        },
    ],
    [
        "lbpl",
        {
            relative: { code: 0x102A, size: 4 },
        },
    ],
    [
        "lbmi",
        {
            relative: { code: 0x102B, size: 4 },
        },
    ],
    [
        "lbge",
        {
            relative: { code: 0x102C, size: 4 },
        },
    ],
    [
        "lblt",
        {
            relative: { code: 0x102D, size: 4 },
        },
    ],
    [
        "lbgt",
        {
            relative: { code: 0x102E, size: 4 },
        },
    ],
    [
        "lble",
        {
            relative: { code: 0x102F, size: 4 },
        },
    ],
    ["swi2", { inherent: { code: 0x103f, size: 2 } }],
    ["cmpd", { direct: { code: 0x1093, size: 3 }, indexed: { code: 0x10a3, size: 3 }, immediate: { code: 0x1083, size: 4 }, extended: { code: 0x10b3, size: 4 } }],
    ["cmpy", { direct: { code: 0x109c, size: 3 }, indexed: { code: 0x10ac, size: 3 }, immediate: { code: 0x108c, size: 4 }, extended: { code: 0x10bc, size: 4 } }],
    ["ldy", { direct: { code: 0x109e, size: 3 }, indexed: { code: 0x10ae, size: 3 }, immediate: { code: 0x108e, size: 4 }, extended: { code: 0x10be, size: 4 } }],
    ["sty", { direct: { code: 0x109f, size: 3 }, indexed: { code: 0x10af, size: 3 }, extended: { code: 0x10bf, size: 4 } }],
    ["lds", { direct: { code: 0x10de, size: 3 }, indexed: { code: 0x10ee, size: 3 }, immediate: { code: 0x10ce, size: 4 }, extended: { code: 0x10fe, size: 4 } }],
    ["sts", { direct: { code: 0x10df, size: 3 }, indexed: { code: 0x10ef, size: 3 }, extended: { code: 0x10ff, size: 4 } }],
    ["swi3", { inherent: { code: 0x113f, size: 2 } }],
    ["cmpu", { direct: { code: 0x1193, size: 3 }, indexed: { code: 0x11a3, size: 3 }, immediate: { code: 0x1183, size: 4 }, extended: { code: 0x11b3, size: 4 } }],
    ["cmps", { direct: { code: 0x119c, size: 3 }, indexed: { code: 0x11ac, size: 3 }, immediate: { code: 0x118c, size: 4 }, extended: { code: 0x11bc, size: 4 } }],

]);


export const inherent_only = new Set([
    'abx',
    'asla',
    'aslb', // Opcode: $58
    'asra', // Opcode: $47
    'asrb', // Opcode: $46
    'clra', // Opcode: $4F
    'clrb', // Opcode: $5F
    'coma', // Opcode: $43
    'comb', // Opcode: $53
    'deca', // Opcode: $4A
    'decb', // Opcode: $5A
    'inca', // Opcode: $4C
    'incb', // Opcode: $5C
    'lsla', // Opcode: $48
    'lslb', // Opcode: $58
    'lsra', // Opcode: $44
    'lsrb', // Opcode: $54
    'mul',  // Opcode: $3D
    'nega', // Opcode: $40
    'negb', // Opcode: $50
    'nop',  // Opcode: $12
    'rola', // Opcode: $49
    'rolb', // Opcode: $59
    'rora', // Opcode: $46
    'rorb', // Opcode: $56
    'rti',  // Opcode: $3B
    'rts',  // Opcode: $39
    'sex',  // Opcode: $1D
    'swi',  // Opcode: $3F
    'sync', // Opcode: $13
    'tsta', // Opcode: $4D
    'tstb'  // Opcode: $5D
]);

export const relative_only = new Map([
    ['bcc', { opcode: '$24', size: 2 }], // Branch if Carry Clear C=0
    ['bcs', { opcode: '$25', size: 2 }], // Branch if Carry Set C=1
    ['beq', { opcode: '$27', size: 2 }], // Branch if Equal Z=1
    ['bge', { opcode: '$2C', size: 2 }], // Branch if Greater than or equal to zero
    ['bgt', { opcode: '$2E', size: 2 }], // Branch if Greater than Zero
    ['bhi', { opcode: '$22', size: 2 }], // Branch if Higher Z+C=0
    ['bhs', { opcode: '$24', size: 2 }], // Branch if Higher or Same C=0
    ['ble', { opcode: '$2F', size: 2 }], // Branch if Less than or Equal to Zero
    ['blo', { opcode: '$25', size: 2 }], // Branch if Lower C=1
    ['bls', { opcode: '$23', size: 2 }], // Branch if Lower or Same C+Z=1
    ['blt', { opcode: '$2D', size: 2 }], // Branch if Less Than Zero
    ['bmi', { opcode: '$2B', size: 2 }], // Branch if Minus N=1
    ['bne', { opcode: '$26', size: 2 }], // Branch if Not Equal to Zero Z=0
    ['bpl', { opcode: '$2A', size: 2 }], // Branch if Plus N=0
    ['bra', { opcode: '$20', size: 2 }], // Branch Always
    ['brn', { opcode: '$21', size: 2 }], // Branch Never
    ['bsr', { opcode: '$8D', size: 2 }], // Branch to Subroutine
    ['bvc', { opcode: '$28', size: 2 }], // Branch if Overflow Clear V=0
    ['bvs', { opcode: '$29', size: 2 }], // Branch if Overflow Set V=1
    ['lbcc', { opcode: '$10 24', size: 4 }], // Long Branch if Carry Clear C=0
    ['lbcs', { opcode: '$10 25', size: 4 }], // Long Branch if Carry Set C=1
    ['lbeq', { opcode: '$10 27', size: 4 }], // Long Branch if Equal Z=1
    ['lbge', { opcode: '$10 2C', size: 4 }], // Long Branch if Greater than or equal to zero
    ['lbgt', { opcode: '$10 2E', size: 4 }], // Long Branch if Greater than Zero
    ['lbhi', { opcode: '$10 22', size: 4 }], // Long Branch if Higher Z+C=0
    ['lbhs', { opcode: '$10 24', size: 4 }], // Long Branch if Higher or Same C=0
    ['lble', { opcode: '$10 2F', size: 4 }], // Long Branch if Less than or Equal to Zero
    ['lblo', { opcode: '$10 25', size: 4 }], // Long Branch if Lower C=1
    ['lbls', { opcode: '$10 23', size: 4 }], // Long Branch if Lower or Same C+Z=1
    ['lblt', { opcode: '$10 2D', size: 4 }], // Long Branch if Less Than Zero
    ['lbmi', { opcode: '$10 2B', size: 4 }], // Long Branch if Minus N=1
    ['lbne', { opcode: '$10 26', size: 4 }], // Long Branch if Not Equal to Zero Z=0
    ['lbpl', { opcode: '$10 2A', size: 4 }], // Long Branch if Plus N=0
    ['lbra', { opcode: '$16', size: 3 }], // Long Branch Always
    ['lbrn', { opcode: '$10 21', size: 4 }], // Long Branch Never
    ['lbsr', { opcode: '$17', size: 3 }], // Long Branch to Subroutine
    ['lbvc', { opcode: '$10 28', size: 4 }], // Long Branch if Overflow Clear V=0
    ['lbvs', { opcode: '$10 29', size: 4 }]  // Long Branch if Overflow Set V=1
]);

export const accumulators = new Set(['a', 'b', 'd',])

export const psh = new Set(['pshs', 'puls', 'pshu', 'pulu'])

export const register_only = new Set(['tfr', 'exg']);

export const BYTE_MIN = 0x00
export const BYTE_MAX = 0xFF;
export const WORD_MIN = 0x100;
export const WORD_MAX = 0xFFFF;

export const BYTE = 1;
export const WORD = 2;

// Postbyte codes for opcodes.
// in the form 0RR00000
export const X = 0x00;
export const Y = 0x20;
export const U = 0x40;
export const S = 0x60;
export const PC = 0x8C
export const PCR = 0x8D // PCR postbyte. Goes OPCODE POSTBYTE n. 
// So LDY $4007,pcr = 10 AE 8D 00 02 where the 00 02 is the distance between the address 4007 and the PC. Assuming default of 4000.
// + 1 for 16 bit ofsets

export const PB_REGISTERS = {
    'x': 0x00, 'y': 0x20, 'u': 0x40, 's': 0x60, 'pc': 0x8C, 'PCR': 0x8D
}

// +, ++, -, --
// In the form 0RR00000
// This is non indirect. For indirect 0RR1000
// [,R+] Not allowed
// [,--R] not allowed

export const INC_DEC = {
    'INC': 0x80,
    'INC2': 0x81,
    'DEC': 0x82,
    'DEC2': 0x83
}

export const ACCUMULATOR_POSTBYTE = { 'a': 0x86, 'b': 0x85, 'd': 0x8B }

export const INC = 0x80;
export const INC2 = 0x81
export const DEC = 0x82;
export const DEC2 = 0x83;
// needs indirect num

// Inter register postbyts. The upper byte nyble is is the source reigseter and the lower nyble the destination.
// So source register << 4 | Destination register will prodce correct code.
export const INTER_REGISTER_POSTBYTE = {
    'd': 0, 'x': 1, 'y': 2, 'u': 3, 's': 4, 'pc': 5, 'a': 8, 'b': 9, 'cc': 10, 'dp': 11
}

// Used for PSH/PULL
// We have a single byte where each bit is set for a given register.
// PC | U/S | Y | X | DP | B | A | CC
// So PSHS CC,A,B,DP,X,Y,U,PC would give 11111111
export const PSH_PUL_POSTBYTE = {
    'cc': 0x01,
    'a': 0x02,
    'b': 0x04,
    'd': 0x06,
    'dp': 0x08,
    'x': 0x10,
    'y': 0x20,
    'u': 0x40,
    's': 0x40,
    'pc': 0x80
}


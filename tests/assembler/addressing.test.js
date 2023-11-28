import { expect, test, describe } from "bun:test";
import { Assembler } from "../../src/assembler";

const test_asm = new Assembler('');


/**
 * Immediate address modes are when a value is preceded by a # sign.
 * 
 */
describe("Immediate Addressing Modes", () => {
    /**
     * This is a basic case for immediate where it is a opcode followed by the immediate value.
     * 
     */
    test("Simple 8 bit Immediate", () => {

        const test_input = `
        anda #50
        bita #20
        ldb  #124
        `
        const expected_binary = [0x84, 0x32, 0x85, 0x14, 0xC6, 0x7C]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })

    /**
     * Testing simple 16 bit varients with opcode folllowed by 16 bit values.
     */
    test("Simple 16 bit Immediate", () => {

        const test_input = `
        subd #50
        ldy #$0303
        ldd  #124
        `
        const expected_binary = [0x83, 0x00, 0x32, 0x10, 0x8E, 0x03, 0x03, 0xCC, 0x00, 0x7C]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });
    })

    /**
     * Testing using const values for immediate addressing on both 8 bit and 16 bit.
     * 
     */
    test("Const Immediate", () => {

        const test_input = `
        const scLen=7, scInitials=3, scDif=32

        anda #scLen
        bita #scInitials
        ldb  #scDif
        subd #scDif
        ldy #scInitials
        ldd  #scLen
        `
        const expected_binary = [0x84, 0x07, 0x85, 0x03, 0xC6, 0x20, 0x83, 0x00, 0x20, 0x10, 0x8E, 0x00, 0x03, 0xCC, 0x00, 0x07]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })


})


describe("Direct Addressing Modes", () => {
    test("Forced Direct", () => {

        const test_input = `
        andb <84
        asl <$23
        cmpd <$32
        orb <50
        `
        const expected_binary = [
            0xD4,
            0x54,
            0x08,
            0x23,
            0x10,
            0x93,
            0x32,
            0xDA,
            0x32
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })

})


describe("Extended Addressing Modes", () => {

    test("Forced Extended", () => {

        const test_input = `
        andb >84
        asl >$23
        cmpd >$32
        orb >50
        `
        const expected_binary = [
            0xF4,
            0x00,
            0x54,
            0x78,
            0x00,
            0x23,
            0x10,
            0xB3,
            0x00,
            0x32,
            0xFA,
            0x00,
            0x32
        ]
        test_asm.reset(test_input);


        const result = test_asm.assemble()


        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })

})

describe("Inherent Addressing Modes", () => {

    test("Inherent Only", () => {


        const test_input = `
            abx
            asla
            aslb 
            asra 
            asrb 
            clra 
            clrb 
            coma 
            comb 
            deca 
            decb 
            inca 
            incb 
            lsla 
            lslb 
            lsra 
            lsrb 
            mul  
            nega 
            negb 
            nop  
            rola 
            rolb 
            rora 
            rorb 
            rti  
            rts  
            
            `
        const expected_binary = [
            0x3A,
            0x48,
            0x58,
            0x47,
            0x57,
            0x4F,
            0x5F,
            0x43,
            0x53,
            0x4A,
            0x5A,
            0x4C,
            0x5C,
            0x48,
            0x58,
            0x44,
            0x54,
            0x3D,
            0x40,
            0x50,
            0x12,
            0x49,
            0x59,
            0x46,
            0x56,
            0x3B,
            0x39
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });



    })

})


describe("Indexed Addressing Modes", () => {

    test(",R", () => {

        const test_input = `
        leax ,y
        leay ,x
        leax ,u
        leax ,x
        leay ,s
        `
        const expected_binary = [
            0x30,
            0xA4,
            0x31,
            0x84,
            0x30,
            0xC4,
            0x30,
            0x84,
            0x31,
            0xE4
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })


    test("5 bit n,R", () => {

        const test_input = `
        leax -16,y
        leay -10,x
        leax 3,u
        leax 14,x
        leay $02,s
        `
        const expected_binary = [
            0x30,
            0x30,
            0x31,
            0x16,
            0x30,
            0x43,
            0x30,
            0x0E,
            0x31,
            0x62
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });
    })

    test("8 bit n,R", () => {

        const test_input = `
        leax -100,y
        leay -128,x
        leax 16,u
        leax 100,x
        leay 127,s
        `
        const expected_binary = [
            0x30,
            0xA8,
            0x9C,
            0x31,
            0x88,
            0x80,
            0x30,
            0xC8,
            0x10,
            0x30,
            0x88,
            0x64,
            0x31,
            0xE8,
            0x7F
        ]

        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });
    })


    test("16 bit n,R", () => {

        const test_input = `
        leax -3000,y
        leay -32768,x
        leax -129,u
        leax 128,x
        leay 32767,s
        `
        const expected_binary = [
            0x30,
            0xA9,
            0xF4,
            0x48,
            0x31,
            0x89,
            0x80,
            0x00,
            0x30,
            0xC9,
            0xFF,
            0x7F,
            0x30,
            0x89,
            0x00,
            0x80,
            0x31,
            0xE9,
            0x7F,
            0xFF
        ]

        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });
    })


    test("Accumulator offset", () => {

        const test_input = `
        leax a,y
        leay b,x
        leax d,u
        leax a,x
        leay b,s
        `
        const expected_binary = [
            0x30,
            0xA6,
            0x31,
            0x85,
            0x30,
            0xCB,
            0x30,
            0x86,
            0x31,
            0xE5
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })

    test("Auto inc/dec", () => {

        const test_input = `
        leax ,y+
        leay ,x++
        leax ,-u
        leax ,--x
        `
        const expected_binary = [
            0x30,
            0xA0,
            0x31,
            0x81,
            0x30,
            0xC2,
            0x30,
            0x83
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })

    test("8 bit n,PCR", () => {

        const test_input = `
        leax -128,pcr
        leay -100,pcr
        leax 100,pcr
        leax 127,pcr
        `
        const expected_binary = [
            0x30,
            0x8D,
            0xBF,
            0x7C,
            0x31,
            0x8D,
            0xBF,
            0x94,
            0x30,
            0x8D,
            0xC0,
            0x58,
            0x30,
            0x8D,
            0xC0,
            0x6F
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })

    test("16 bit n,PCR", () => {

        const test_input = `
        leax -32768,pcr
        leay -129,pcr
        leax 128,pcr
        leax 32767,pcr
        `
        const expected_binary = [
            0x30,
            0x8D,
            0x3F,
            0xFC,
            0x31,
            0x8D,
            0xBF,
            0x77,
            0x30,
            0x8D,
            0xC0,
            0x74,
            0x30,
            0x8D,
            0x3F,
            0xEF
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })
})


describe("Indirect Indexed Addressing Modes", () => {

    test("[,R]", () => {

        const test_input = `
        leax [,y]
        leay [,x]
        leax [,u]
        leax [,x]
        leay [,s]
        `
        const expected_binary = [
            0x30,
            0xB4,
            0x31,
            0x94,
            0x30,
            0xD4,
            0x30,
            0x94,
            0x31,
            0xF4
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })


    test("8 bit [n,R]", () => {

        const test_input = `
        leax [-100,y]
        leay [-128,x]
        leax [16,u]
        leax [100,x]
        leay [127,s]
        `
        const expected_binary = [
            0x30,
            0xB8,
            0x9C,
            0x31,
            0x98,
            0x80,
            0x30,
            0xD8,
            0x10,
            0x30,
            0x98,
            0x64,
            0x31,
            0xF8,
            0x7F
        ]

        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });
    })


    test("16 bit [n,R]", () => {

        const test_input = `
        leax [-3000,y]
        leay [-32768,x]
        leax [-129,u]
        leax [128,x]
        leay [32767,s]
        `
        const expected_binary = [
            0x30,
            0xB9,
            0xF4,
            0x48,
            0x31,
            0x99,
            0x80,
            0x00,
            0x30,
            0xD9,
            0xFF,
            0x7F,
            0x30,
            0x99,
            0x00,
            0x80,
            0x31,
            0xF9,
            0x7F,
            0xFF
        ]

        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });
    })


    test("Indirect Accumulator offset", () => {

        const test_input = `
        leax [a,y]
        leay [b,x]
        leax [d,u]
        leax [a,x]
        leay [b,s]
        `
        const expected_binary = [
            0x30,
            0xB6,
            0x31,
            0x95,
            0x30,
            0xDB,
            0x30,
            0x96,
            0x31,
            0xF5
        ]

        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })

    test("Indirect Auto inc/dec", () => {

        const test_input = `
        leay [,x++]
        leax [,--x]
        `
        const expected_binary = [
            0x31,
            0x91,
            0x30,
            0x93
        ]


        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })

    test("8 bit [n,PCR]", () => {

        const test_input = `
        leax [-128,pcr]
        leay [-100,pcr]
        leax [100,pcr]
        leax [127,pcr]
        `
        const expected_binary = [
            0x30,
            0x9D,
            0xBF,
            0x7C,
            0x31,
            0x9D,
            0xBF,
            0x94,
            0x30,
            0x9D,
            0xC0,
            0x58,
            0x30,
            0x9D,
            0xC0,
            0x6F
        ]

        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })

    test("16 bit [n,PCR]", () => {

        const test_input = `
        leax [-32768,pcr]
        leay [-129,pcr]
        leax [128,pcr]
        leax [32767,pcr]
        `
        const expected_binary = [
            0x30,
            0x9D,
            0x3F,
            0xFC,
            0x31,
            0x9D,
            0xBF,
            0x77,
            0x30,
            0x9D,
            0xC0,
            0x74,
            0x30,
            0x9D,
            0x3F,
            0xEF
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });

    })

    test("[n]", () => {
        const test_input = `
        leax [100]
        `
        const expected_binary = [
            0x30, 0x9F, 0x64, 0x00
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });



    })
})
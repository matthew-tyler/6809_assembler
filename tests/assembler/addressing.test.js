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
import { expect, test, describe } from "bun:test";
import { Assembler } from "../../src/assembler";
import { test_result } from "./utils";

const test_asm = new Assembler('');



describe('Compiler Directives', () => {

    test('ORG', () => {
        const test_input = `
        start:
        jsr libRoutine01     ;  jsr $f000
      ; ...
      org $F000
      
      libRoutine01:
        pshs d,x
    `
        const expected_binary = [
            0xBD,
            0xF0,
            0x00,
            0x34,
            0x16,
        ]

        test_asm.reset(test_input);

        const result = test_asm.assemble();
        test_result(result, expected_binary);
    })


    test('CONST, EQU, =', () => {
        const test_input = `
        const asciiZero=48, asciiNine=+57, asciiEight=$38 
        const asciiSeven=0x37, asciiOne=%00110001, minusNineteen=-$13
        const PIA=$FF20
    `
        const expected_binary = []
        test_asm.reset(test_input);
        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        const const_table = test_asm.const_table;

        const expected = {
            asciizero: 48,
            asciinine: 57,
            asciieight: 56,
            asciiseven: 55,
            asciione: 49,
            minusnineteen: -19,
            pia: 65312
        }

        for (const [key, expectedValue] of Object.entries(expected)) {
            // Check if the key exists in const_table
            if (key in const_table) {
                // Compare the value from const_table with the expected value
                expect(const_table[key]).toBe(expectedValue);
            } else {
                // If the key doesn't exist in const_table, throw an error or fail the test
                throw new Error(`Key '${key}' not found in const_table.`);
            }
        }


    })

    test('RMB, DS', () => {
        const test_input = `
        lineInput: rmb 5     
        textArea:  ds $0004
        rts
    `
        const expected_binary = [
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x00,
            0x39
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble();
        test_result(result, expected_binary);
    })


    test('END', () => {

        const test_input =
            `
        finish:
            clra
            rts    

            ; Some reminders here ...

            end

            abx

            More reminders here ..
        `

        const expected_binary = [
            0x4F,
            0x39,
        ]

        test_asm.reset(test_input);

        const result = test_asm.assemble()
        test_result(result, expected_binary);
    })

    test.todo('VAR', () => {

    })

    test.todo('SETDP, DIRECT', () => {
        const test_input = `
        start:
        lda #$40
        tfr a,dp
        setdp $40
        lda $4000    ; assembled in Direct mode
        rts
    `
        const expected_binary = [
            0x86,
            0x40,
            0x1F,
            0x8B,
            0x96,
            0x00,
            0x39
        ]

        test_asm.reset(test_input);

        const result = test_asm.assemble();

        test_result(result, expected_binary);
    })

    test('FILL ', () => {
        const test_input = `
        blanks:
        fill $20, 5
        fill 9, $3
        fill $40, 2
    `
        const expected_binary = [
            0x20,
            0x20,
            0x20,
            0x20,
            0x20,
            0x09,
            0x09,
            0x09,
            0x40,
            0x40
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble();

        test_result(result, expected_binary);
    })

    test('DB, FCB, FCC, .BYTE ', () => {

        const test_input = `
            start:
            length:  db 5
            chars:   fcb $38, $35, $3C, $3C, $3F
            text:    fcc "HELLO",0
            empty:   .byte 5, 10
        `
        const expected_binary = [
            0x05,
            0x38,
            0x35,
            0x3C,
            0x3C,
            0x3F,
            0x48,
            0x45,
            0x4C,
            0x4C,
            0x4F,
            0x00,
            0x05,
            0x0A
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        test_result(result, expected_binary);
    })

    test('DW , FDB, .WORD', () => {
        const test_input = `
        bitmap: 
        dw %1111111111111111, %1000000000000001
        .word  5, 10, 0, 0
         fdb    $4000, $1919, $1010
        `
        const expected_binary = [
            0xFF,
            0xFF,
            0x80,
            0x01,
            0x00,
            0x05,
            0x00,
            0x0A,
            0x00,
            0x00,
            0x00,
            0x00,
            0x40,
            0x00,
            0x19,
            0x19,
            0x10,
            0x10
        ]
        test_asm.reset(test_input);
        const result = test_asm.assemble();

        test_result(result, expected_binary);
    })



})



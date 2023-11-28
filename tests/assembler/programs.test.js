import { expect, test, describe } from "bun:test";
import { Assembler } from "../../src/assembler";

const test_asm = new Assembler('');


describe("Full Programs", () => {

    test("Hello World", () => {

        const test_input = `
        start:
            leay helloworld,pcr
            jsr print
            rts
        
        const textscreenbase=$400
        
        print:
            pshs a,x,y
            ldx #textscreenbase
        printloop:
            lda ,y+
            beq printover
            cmpa #$40
            bhs print6847
            adda #$40
        print6847:
            sta ,x+
            bra printloop
        printover:
            puls a,x,y
            rts
        
        
        helloworld:
            fcb "HELLO WORLD",0
        `
        const expected_binary = [0x31, 0x8D, 0x00, 0x1A, 0xBD, 0x40, 0x08, 0x39, 0x34, 0x32, 0x8E, 0x04, 0x00, 0xA6, 0xA0, 0x27, 0x0A, 0x81, 0x40, 0x24, 0x02, 0x8B, 0x40, 0xA7, 0x80, 0x20, 0xF2, 0x35, 0x32, 0x39, 0x48, 0x45, 0x4C, 0x4C, 0x4F, 0x20, 0x57, 0x4F, 0x52, 0x4C, 0x44]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });


    })

    test("Clear Screen", () => {

        const test_input = `
        
const graphicsBase=$600, gLineBytes=$20

start:
    ldd #$0210       ; select 16 colour graphics mode
    swi3
    bsr refreshScreen
    bsr clearScreen
    rts


refreshScreen:
    pshs d,x,y
    ldx #graphicsBase
    ldy #$0600
refreshS1:
    tst ,x+
    tst ,x+
    tst ,x+
    tst ,x+
    leay -1,y
    bne refreshS1
    puls d,x,y,pc
    

clearScreen:
    pshs d,x,y
    ldx #graphicsBase
    ldd #0
    ldy #$0600
clearS1:
    std ,x++
    std ,x++
    leay -1,y
    bne clearS1
    puls d,x,y,pc

`
        const expected_binary = [
            0xCC,
            0x02,
            0x10,
            0x11,
            0x3F,
            0x8D,
            0x03,
            0x8D,
            0x18,
            0x39,
            0x34,
            0x36,
            0x8E,
            0x06,
            0x00,
            0x10,
            0x8E,
            0x06,
            0x00,
            0x6D,
            0x80,
            0x6D,
            0x80,
            0x6D,
            0x80,
            0x6D,
            0x80,
            0x31,
            0x3F,
            0x26,
            0xF4,
            0x35,
            0xB6,
            0x34,
            0x36,
            0x8E,
            0x06,
            0x00,
            0xCC,
            0x00,
            0x00,
            0x10,
            0x8E,
            0x06,
            0x00,
            0xED,
            0x81,
            0xED,
            0x81,
            0x31,
            0x3F,
            0x26,
            0xF8,
            0x35,
            0xB6
        ]
        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });




    })

    test("Character Set", () => {

        const test_input = `
        
; Display the character set
; from 0 to 255

start:
    jsr displayAllChars
    rts

const textScreenBase=$0400

displayAllChars:
    lda #0
    ldx #textScreenBase
displayLoop:
    sta ,x+
    inca
    bne displayLoop
    rts
`
        const expected_binary = [
            0xBD,
            0x40,
            0x04,
            0x39,
            0x86,
            0x00,
            0x8E,
            0x04,
            0x00,
            0xA7,
            0x80,
            0x4C,
            0x26,
            0xFB,
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


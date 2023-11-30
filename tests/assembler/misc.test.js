import { expect, test, describe } from "bun:test";
import { Assembler } from "../../src/assembler";

const test_asm = new Assembler('');



describe('Misc Tests', () => {

    test('Case Insensitive', () => {
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
    `.toUpperCase();
        const expected_binary = [0x31, 0x8D, 0x00, 0x1A, 0xBD, 0x40, 0x08, 0x39, 0x34, 0x32, 0x8E, 0x04, 0x00, 0xA6, 0xA0, 0x27, 0x0A, 0x81, 0x40, 0x24, 0x02, 0x8B, 0x40, 0xA7, 0x80, 0x20, 0xF2, 0x35, 0x32, 0x39, 0x48, 0x45, 0x4C, 0x4C, 0x4F, 0x20, 0x57, 0x4F, 0x52, 0x4C, 0x44, 0x00]



        test_asm.reset(test_input);

        const result = test_asm.assemble()

        expect(result.length).toBe(expected_binary.length);

        result.forEach((element, index) => {
            expect(element).toBe(expected_binary[index]);
        });
    })

});
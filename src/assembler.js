import { lexer } from "./lexer";
import { BYTE, BYTE_MAX, WORD_MIN, WORD_MAX, inherent_only, relative_only, accumulators, psh, register_only, WORD } from "./constants";


class Assembler {

    constructor(source) {
        this.lexer = lexer;
        this.lexer.reset(source.toLowerCase())
        this.label_table = {};
        this.pc = 0;
        this.dp = 0;
        this.binary = [];
        this.current_token = {};

        this.second_parse = false;;
    }

    #next() {
        // Loop indefinitely until a non-comment and non-whitespace token is found
        while (true) {
            this.current_token = this.lexer.next();

            // If the current token is undefined, return it (end of file or stream)
            if (!this.current_token) {
                return;
            }

            // If the current token is not a comment or whitespace, return it
            if (this.current_token.type !== "COMMENT" && this.current_token.type !== "WS") {
                return this.current_token;
            }

            // If it's a comment or whitespace, continue the loop to get the next token
        }
    }


    #error(message) {
        console.log(this.lexer.formatError(this.current_token, message));
    }

    reset(source) {
        this.halt();
        if (source) {
            this.lexer.reset(source.toLowerCase())
        } else {
            this.lexer.reset();
        }
    }

    halt() {
        // to do 
    }

    #handle_directive() {
        switch (this.current_token.value) {
            case 'org':
                // sets the origin. I guess that just updates the PC?
                this.#next();
                if (this.current_token.type == 'INTEGER') {
                    this.pc = Math.abs(this.current_token.value);
                }
                break;
            case 'end':
                // just end the assembler here. 
                this.halt(); // not implemented
                break;
            case 'setdp':
            case 'direct':
                this.#next();
                if (this.current_token.type == 'INTEGER') {
                    this.dp = Math.abs(this.current_token.value);
                }
                break;
            case 'rmb':
            case 'ds':
                this.#next();
                if (this.current_token.type == 'INTEGER') {
                    const num_bytes = Math.abs(this.current_token.value);
                    this.pc += num_bytes;
                    if (this.second_parse) {
                        this.binary = this.binary.concat(new Array(num_bytes).fill(0));
                    }
                }

                break;
            case 'var':
                this.#handle_var();
                break;
            case 'fill':
                this.#handle_fill();
                break;
            case 'db':
            case 'fcb':
            case '.byte':
            case 'fcc':
                this.#handle_data(BYTE);
                break;
            case 'dw':
            case 'fdb':
            case '.word':
                // dw, fdb and .word are the same.
                this.#handle_data(WORD);
                break;
            case 'const':
                // currently handled by EQU at top level    
                break;
        }
    }

    #handle_opcode() {
        if (inherent_only.has(this.current_token.value)) {
            this.#next();
            if (this.current_token.type !== 'NL') {
                this.#error("Inherent instructions don't take arguments")
            }

            this.pc += BYTE; // these instructions are always 1 byte

        } else if (relative_only.has(this.current_token.value)) {
            this.#next();

            this.pc += relative_only.get(this.current_token.value).size;

        } else if (register_only.has(this.current_token.value)) {
            // handle tfr and exg 
            //  any register may be transferred to or exchanged with another of like size; i.e. 8-bit to 8-bit or 16-bit to 16-bit. 
            this.#next();
            // this.#expect("REGISTER")
            this.#next();
            // this.#expect("COMMA");
            this.#next();
            // this.#expect("REGISTER")

            // needs to handle pre and post inc etc

            this.pc += 2 // both these of commands take 2 bytes.

        } else if (psh.has(this.current_token.type)) {
            // handle psh/pul

            while (this.current_token.type !== 'NL') {
                this.#next();
            }

            this.pc += WORD // which I think is just 2 bytes.

        } else {

            let op = this.current_token.type;
            this.#next();

            switch (this.current_token.type) {
                case "INDIRECT_START":
                    // must be the start of an indirect
                    // The coming integers have no 5 bit offset. Otherwise is the same.
                    this.#handle_args(op, "INDIRECT")

                    break;
                case "IMMEDIATE":
                    this.#handle_args(op, "IMMEDIATE")
                    break;

                default:
                    // direct or extended. 
                    // Direct is chosen if address is on the current page. DP is 0 by default.

                    this.#handle_args(op, "INDEX")
                    // console.log("Error?", this.current_token);
                    break;
            }

        }

    }

    #handle_equ(id) {
        while (this.#next()) {

            if (this.current_token.type === 'INTEGER') {
                this.label_table[id] = this.current_token.value;
            } else if (this.current_token.type === 'IDENTIFIER') {

                if (id === null) {
                    id = this.current_token.value;
                } else {
                    this.label_table[id] = this.label_table[this.current_token.value] || this.current_token.value;
                }

            } else if (this.current_token.value === 'equ' || this.current_token.value === "=") {
                continue
            } else if (this.current_token.type === 'COMMA') {
                id = null;
                continue

            } else if (this.current_token.type === 'NL') {
                break;
            } else {
                this.#error("Unexpected token in equ directive");
            }

        }
    }

    #handle_var() {

        this.#next();

        let var_size = 0;

        if (this.current_token.type == 'INTEGER') {
            var_size = this.current_token.value;

        }


        while (this.#next()) {

            if (this.current_token.type === 'IDENTIFIER') {
                // Add label to label_table with the current pc.
                this.label_table[this.current_token.value] = this.pc;

                // Increment the pc by varSize
                this.pc += var_size;
            } else if (this.current_token.type === 'NL') {

                break;
            } else if (this.current_token.type === 'COMMA' || this.current_token.type === 'WS') {
                // Just a separator. Continue to the next token.
                continue;
            } else {
                // Unexpected token. Perhaps handle this as an error or warning.
                this.#error("Unexpected token after var directive")
            }
        }
    }

    #handle_fill() {
        // this looks shit.
        this.#next();

        let fill_byte = null;
        let fill_count = null;

        if (this.current_token.type == 'INTEGER') {
            fill_byte = this.current_token.value;
            this.#next();
        } else {
            this.#error("Expected byte value after fill directive, found.");
            return; // Exit early
        }

        if (this.current_token.type === 'COMMA') {
            this.#next();
        } else {
            this.#error("Expected comma after byte value in fill directive, found.");
            return; // Exit early
        }


        if (this.current_token.type == 'INTEGER') {
            fill_count = this.current_token.value;
        } else {
            this.#error("Unexpected token after fill directive.")
        }

        this.pc += fill_count
    }

    #handle_data(size) {
        //size is either a byte (1) or word (2)
        while (this.#next()) {

            switch (this.current_token.type) {
                case 'STRING':
                    this.pc += this.current_token.value.length;
                    if (this.second_parse) {
                        // Convert the string into an array of ASCII values. 
                        const asciiValues = Array.from(this.current_token.value, char => char.charCodeAt(0));
                        this.binary = this.binary.concat(asciiValues);
                    }
                    break;
                case 'INTEGER':
                    if ((this.current_token.value >= 0 && this.current_token.value <= BYTE_MAX) && size === BYTE) {
                        this.pc += BYTE; // Size of a byte
                        if (this.second_parse) {
                            this.binary.push(this.current_token.value & 0xFF); // Add the byte to the binary array
                        }
                    } else if ((this.current_token.value >= WORD_MIN && this.current_token.value <= WORD_MAX) && size === WORD) {
                        this.pc += WORD; // Size of a word
                        if (this.second_parse) {
                            // Add the word to the binary array in two parts (high byte and low byte)
                            this.binary.push((this.current_token.value >> 8) & 0xFF); // High byte
                            this.binary.push(this.current_token.value & 0xFF); // Low byte
                        }
                    } else {
                        this.#error("Value too large");
                    }
                case 'CHAR':
                    this.pc += BYTE;
                    if (this.second_parse) {
                        // Convert the character to its ASCII value and add it to the binary array
                        this.binary.push(this.current_token.value.charCodeAt(0));
                    }
                    break;
                case 'COMMA':
                case 'NL':
                    continue;
                default:
                    this.#error("Unexpected token in data directive.");
                    break;
            }

        }
    }

    #handle_args(op, mode) {

        let n;
        let register;
        let postbyte;

        /**
         *  All operations from here on should come in the form OPCODE [POSTBYTE] [N]
         *  Where I'm using n above to be N and the brackets to denote optional.
         *  
         *  The postbyte is determined in a couple of spots. 
         *  
         *  For forms ,R the postbtyte is determined in the swtich statement if we are register and the value
         *  or postbyte hasn't already been set. The postbyte should then be x84
         *  
         *  For n,R there's some variations on the postbyte. If -16 to 15 then in form 0RRnnnnn
         *  if -128 to 127 then in form 1RR01000 (x88 | RR)
         *  if -32768 to 32767 then 1RR01001 (x89 | RR)
         *  
         * 
         *  Accumulator offset postbyte follows the patterns
         *  A,R = 1RR00110
         *  B,R = 1RR00101
         *  D,R = 1RR01011
         *  
         *  Inc/Dec
         *  
         *  ,R+ = 1RR00000
         *  ,R++ = 1RR00001
         *  ,-R = 1RR00010
         *  ,--R = 1RR00011
         * 
         *  In Indirect mode only [,R++] and [,--R] are allowed.
         * 
         *  PCR offset comes in the form n,PCR in both 8 and 16 bit. 
         * 
         *  n,PCR -128 to 127 = 100011001
         *  n,PCR -37768 to 32767 = 100011001
         * 
         *  For indirect forms the above just change the last bit after RR so 1RR01000 becomes 1RR11000
         *  
         *  
         */


        this.#next();
        // R,R 
        // n,R
        // ,R
        // n,pcr
        // with pre, post inc and dec


        while (this.current_token.type !== "NL") {

            switch (this.current_token.type) {
                case "CHAR": // I believe chars act just like numbers here. Needs a value transform
                case "INTEGER":

                    let value = this.current_token.value;
                    if (value >= -16 && value <= 15) {
                        // The value fits in a 5-bit offset, indicating a total of 2 bytes
                        this.pc += 2;
                        // should be in the form 0RRnnnnn
                        // Not available if in indirect mode
                        postbyte = this.current_token.value;
                    } else if (value >= -128 && value <= 127) {
                        // The value fits in an 8-bit offset, indicating a total of 3 bytes
                        this.pc += 3
                        n = this.current_token.value;
                        postbyte = 0x88 // needs the RR set.

                    } else if (value >= -32768 && value <= 32767) {
                        // The value fits in a 16-bit offset, indicating a total of 4 bytes
                        this.pc += 4
                        n = this.current_token.value;
                        postbyte = 0x89 // needs the RR set.
                    } else {
                        console.log(this.current_token, "Number not right");
                    }


                    break;

                case "REGISTER":

                    if (accumulators.has(this.current_token.value)) {
                        this.pc += 2; // this really only works if the it's not a long instruction.
                    } else {
                        if (!postbyte) {
                            postbyte = 0x84;
                        }
                    }

                    break;
                case "IDENTIFIER":

                    // if mode === immediate then it must be an 8 bit value. Otherwise assumed to be 2 bytes. 


                    break;
                case "COMMA":
                    break;
                case "INDIRECT_END":
                    if (mode !== "INDIRECT") {
                        console.log("ERROR, should be indirect", this.current_token);
                    }
                    break;
                default:
                    console.log("default args", this.current_token);
                    break;

            }

            this.#next();
        }
    }

    #parse() {

        while (this.#next()) {

            // This switch statement should be the first token of each statement 
            // while helper functions will deal with each statement.
            switch (this.current_token.type) {
                case 'LABEL':
                    this.label_table[this.current_token.value] = this.pc;
                    break;
                case 'DIRECTIVE':
                    this.#handle_directive();
                    break;
                case 'OPCODE':
                    this.#handle_opcode();
                    break;
                case 'IDENTIFIER':
                    // will handle const, equ and =
                    // console.log(this.current_token);
                    this.#handle_equ(this.current_token.value);
                    break;
            }
        }
    }

    assemble() {
        this.#parse();
        this.second_parse = true;

        console.log(this.label_table);

        // this.lexer().reset();
        // this.#parse();
        // return this.binary;
    }
}



let input = `
const asciiZero=48, asciiNine=+57, asciiEight=$38 
const asciiSeven=0x37, asciiOne=%00110001, minusNineteen=-$13
const PIA=$FF20

start:  
  ADDA [$1234]  ; test
  lda #'9
  lda #asciiZero
  lda #asciiNine
  lda #asciiEight
  lda #asciiSeven
  lda #asciiOne
  lda #minusNineteen
  ldb PIA+1
`

const asm = new Assembler(input).assemble();

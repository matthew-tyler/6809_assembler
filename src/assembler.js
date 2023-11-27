import { lexer } from "./lexer";
import { BYTE, BYTE_MAX, WORD_MIN, WORD_MAX, PB_REGISTERS, ACCUMULATOR_POSTBYTE, INC_DEC, inherent_only, relative_only, accumulators, psh, register_only, WORD, BYTE_MIN, opcodes, INTER_REGISTER_POSTBYTE, PSH_PUL_POSTBYTE } from "./constants";


class Assembler {

    constructor(source) {
        this.lexer = lexer;
        this.source = source.toLowerCase();
        this.lexer.reset(this.source)
        this.label_table = {};
        this.const_table = {}
        this.pc = 0;
        this.dp = 0;
        this.binary = [];
        this.current_token = {};

        this.second_parse = false;
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

    reset(new_source) {
        this.halt();

        if (new_source) {
            this.source = new_source.toLowerCase()
        }

        this.lexer.reset(this.source);
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
            this.pc += BYTE; // I think these instructions are always 1 byte...

            if (this.second_parse) {
                const code = opcodes.get(this.current_token.value).inherent.code;
                this.binary.push(code);
            }

            this.#next();
            if (this.current_token.type !== 'NL') {
                this.#error("Inherent instructions don't take arguments")
            }

        } else if (relative_only.has(this.current_token.value)) {

            const instruction = opcodes.get(this.current_token.value);

            this.#next();
            this.pc += instruction.relative.size;

            if (this.current_token.type !== "IDENTIFIER") {
                this.#error("Branches require a label");
            }

            if (this.second_parse) {

                this.binary.push(instruction.relative.code);

                const address = this.label_table[this.current_token.value];

                if (address === undefined) {
                    this.#error("Label not defined");
                }

                let relative_offset = address - this.pc;

                if (instruction.relative.size === 2) {

                    if (relative_offset < -126 || relative_offset > 129) {
                        this.#error("Branch offset out of range");
                    }

                    // Convert to two's complement if the offset is negative
                    if (relative_offset < 0) {
                        relative_offset = 256 + relative_offset; // Equivalent to (0x100 + relative_offset)
                    }

                    this.binary.push(relative_offset & 0xFF); // Add the offset as a single byte.

                } else {

                    // Handle 16-bit relative branches
                    if (relative_offset < -32768 || relative_offset > 32767) {
                        this.#error("Long branch offset out of range");
                    }

                    // Convert to two's complement if the offset is negative
                    if (relative_offset < 0) {
                        relative_offset = 65536 + relative_offset; // Convert to 16-bit two's complement
                    }
                    this.binary.push((relative_offset >> 8) & 0xFF); // High byte
                    this.binary.push(relative_offset & 0xFF);        // Low byte
                }

            }

        } else if (register_only.has(this.current_token.value)) {
            // handle tfr and exg 

            const instruction = opcodes.get(this.current_token.value);

            this.#next();

            const source_register = INTER_REGISTER_POSTBYTE[this.current_token.value]
            if (source_register === undefined) {
                this.#error("Should be a regiseter");
            }
            this.#next();

            if (this.current_token.type !== 'COMMA') {
                this.#error("Registers should be comma seperated");
            }

            this.#next();

            const destination_register = INTER_REGISTER_POSTBYTE[this.current_token.value];

            if (destination_register === undefined) {
                this.#error("Should be a register")
            }

            this.pc += 2 // both of these commands take 2 bytes.

            if (this.second_parse) {
                const postbyte = source_register << 4 | destination_register;
                this.binary.push(instruction.immediate.code, postbyte);
            }


        } else if (psh.has(this.current_token.value)) {
            // handle psh/pul

            const psh_reg = this.current_token.value.charAt(3); // The magic number is just the final char of pshs/puls/pshu/pulu
            const opcode = opcodes.get(this.current_token.value).immediate.code;
            let postbyte = 0;


            while (this.#next().type !== 'NL') {
                if (this.current_token.type === 'COMMA') {
                    continue;
                }

                const register = PSH_PUL_POSTBYTE[this.current_token.value];

                if (register === undefined) {
                    this.#error("Expecting a regiseter");
                }

                if (this.current_token.value === psh_reg) {
                    this.#error("Can't push/pul to/from the same register")
                }

                postbyte |= register;
            }



            this.pc += WORD // which I think is just 2 bytes.

            if (this.second_parse) {
                this.binary.push(opcode, postbyte);
            }

        } else {

            const mnomnic = this.current_token.value;
            const op = opcodes.get(mnomnic);
            this.#next();

            switch (this.current_token.type) {

                case "IMMEDIATE":
                    if (op.immediate === undefined) {
                        this.#error(`Immediate addressing mode not allowed with ${mnomnic}`)
                    }


                    this.pc += op.immediate.size;

                    let value = 0;
                    let sign = 1; // janky as. 

                    while (this.#next().type !== 'NL') {
                        if (this.current_token.type === "INC") {
                            continue;
                        }

                        // a not so elegant way to handle subtracting
                        if (this.current_token.type == "DEC") {
                            sign = -1;
                            continue;
                        }

                        if (this.current_token.type !== "INTEGER" && this.current_token.type !== "IDENTIFIER") {
                            this.#error("Expecting a value")
                        }

                        if (this.current_token.type === "INTEGER") {
                            value += this.current_token.value;
                        } else if (this.current_token.type === "IDENTIFIER") {
                            value += (this.const_table[this.current_token.value] || this.label_table[this.current_token.value]) * sign;
                            sign = 1;
                        }
                    }

                    if (this.second_parse) {

                        this.binary.push(op.immediate.code)

                        if (op.immediate.size == 2) {
                            this.binary.push(value & 0xFF)

                        } else {
                            this.binary.push((value >> 8) & 0xFF); // High byte
                            this.binary.push(value & 0xFF);        // Low byte
                        }


                    }
                    break;

                case "INDIRECT_START":
                    // must be the start of an indirect
                    // The coming integers have no 5 bit offset. Otherwise is the same.

                    this.#next();
                    this.#handle_args(op, "INDIRECT");
                    break;
                case "DIRECT":
                case "EXT_DIR":
                    this.#next();
                    this.#handle_args(op, this.current_token.type);
                default:
                    this.#handle_args(op); // Mode currently undefined
                    break;
            }

        }

    }

    #handle_args(op, mode) {

        let n = 0;
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


        // A,R 
        // n,R
        // ,R
        // n,pcr
        // [n]
        // with pre, post inc and dec

        if (this.current_token.type !== 'COMMA') {
            switch (this.current_token.type) {
                case "CHAR": // I believe chars act just like numbers here. Needs a value transform
                case "INTEGER":
                    n = this.current_token.value;
                    break;
                case "REGISTER":
                    if (accumulators.has(this.current_token.value)) {
                        postbyte = ACCUMULATOR_POSTBYTE[this.current_token.value];
                    } else {
                        this.#error('Expecting value or an accumulator')
                    }
                    break;
                case "IDENTIFIER":
                    let value = this.label_table[this.current_token.value] || this.const_table[this.current_token.value];
                    if (value === undefined) {

                        if (this.second_parse) {
                            this.#error('Unresolved label');
                        }
                        value = 0;
                    }
                    n = value;
                    break;
                default:
                    this.#error('Unexpected token')
                    break;

            }
        }
        this.#next();

        if (this.current_token.type === 'INDIRECT_END') {
            // handle [n]
            this.pc += (op.indexed.size + 2) // + 2 for the postbyte and arg
            if (this.second_parse) {
                this.binary.push(0x9F)
                this.binary.push((n >> 8) & 0xFF); // High byte
                this.binary.push(n & 0xFF);        // Low byte
            }
            return;

        } else if (this.current_token.type === 'COMMA') {
            this.#next();
        }

        if (this.current_token.type === 'DEC' || this.current_token.type === 'DEC2') {
            if (this.current_token === 'DEC' && mode === 'INDIRECT') {
                this.#error('-R and R+ not allowed in indirect')
            }

            if (postbyte) {
                this.#error("Auto increment/decrement can't be used with an offset")
            }

            postbyte = INC_DEC[this.current_token.type];
            this.#next();
        }


        if (this.current_token.type === 'REGISTER') {
            if (accumulators.has(this.current_token.value)) {
                this.#error("Expecting a register, either X, Y, U or S")
            }

            if (this.current_token.value === 'pcr') {

                if (postbyte !== undefined) {
                    this.#error("PCR should be used with an offset")
                }

                if (n >= -128 && n <= 127) {
                    postbyte = 0x8D;
                } else if (n >= -32768 && n <= 32767) {
                    postbyte = 0x8E;
                } else {
                    this.#error("Number too large or small")
                }

            } else {
                register = PB_REGISTERS[this.current_token.value];
            }

        } else {
            this.#error(`Unexepceted argument ${this.current_token.text}`)
        }

        this.#next();
        if (this.current_token.type === 'INC' || this.current_token.type === 'INC2') {
            if (this.current_token === 'INC' && mode === 'INDIRECT') {
                this.#error('-R and R+ not allowed in indirect')
            }
            if (postbyte) {
                this.#error("Auto increment/decrement can't be used with an offset")
            }
            postbyte = INC_DEC[this.current_token.type];
            this.#next();
        }

        if (this.current_token.type === 'INDIRECT_END' && mode !== 'INDIRECT') {
            this.#error("Possibly missing [ at start of arguments");
        }

        if (this.current_token.type !== 'NL') {
            this.#error('Unexpected token');
        }


        // must be indexed, so size is opcode + the size to rep the number
        if (register) {
            this.pc += op.indexed.size;

            // This is in the case n,R or ,R 
            if (!postbyte) {
                if (n === 0) {
                    // handle as 1RR00100
                    postbyte = 0x84 | PB_REGISTERS[register];
                } else if ((n >= -16 && n <= 15) && mode !== 'INDIRECT') {
                    // The value fits in a 5-bit offset, indicating a total of 2 bytes
                    // should be in the form 0RRnnnnn
                    // Not available if in indirect mode
                    postbyte = n | PB_REGISTERS[register];
                } else if (n >= -128 && n <= 127) {

                    this.pc += 1 // Adds 1 byte for handling the postbyte
                    postbyte = 0x88 | PB_REGISTERS[register];

                } else if (value >= -32768 && value <= 32767) {

                    this.pc += 2 // adds 2 bytes for size + instruction.
                    postbyte = 0x89 | PB_REGISTERS[register];
                } else {
                    console.log(this.current_token, "Number not right");
                }
            } else {
                // This must be A,R for accumulator offset
                // or auto inc/dec
                postbyte = postbyte | PB_REGISTERS[register];
            }

            if (mode === 'INDIRECT') {
                // set 00010000 for the indirect version of the postbyte
                postbyte = postbyte | 0x10
            }


            if (this.second_parse) {

                this.binary.push(op.indexed.code, postbyte)

                if (n > 128) {
                    this.binary.push((n >> 8) & 0xFF); // High byte
                    this.binary.push(n & 0xFF);        // Low byte
                } else {
                    this.binary.push(n & 0xFF);
                }

            }

        } else {

            // I think must be pcr so I guess something needs calculating... 

        }



    }

    #handle_equ(id) {
        while (this.#next()) {

            if (this.current_token.type === 'INTEGER') {
                this.const_table[id] = this.current_token.value;
            } else if (this.current_token.type === 'IDENTIFIER') {

                if (id === null) {
                    id = this.current_token.value;
                } else {
                    this.const_table[id] = this.const_table[this.current_token.value] || this.current_token.value;
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
                // Add label to const_table with the current pc.
                this.const_table[this.current_token.value] = this.pc;

                // Increment the pc by varSize
                this.pc += Math.abs(var_size);
                // Handle the second pass for machine code generation
                if (this.second_parse) {
                    const reserved_space = new Array(Math.abs(var_size)).fill(0);
                    this.binary = this.binary.concat(reserved_space);
                }
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
        this.#next();

        // Expect an integer for fill_byte
        if (this.current_token.type !== 'INTEGER') {
            this.#error("Expected byte value after fill directive.");
            return;
        }
        let fill_byte = this.current_token.value;
        if (fill_byte < BYTE_MIN || fill_byte > BYTE_MAX) {
            this.#error("Byte value out of range (0-255).");
            return;
        }

        // Expect a comma after fill_byte
        this.#next();
        if (this.current_token.type !== 'COMMA') {
            this.#error("Expected comma after byte value in fill directive.");
            return;
        }

        // Expect an integer for fill_count
        this.#next();
        if (this.current_token.type !== 'INTEGER') {
            this.#error("Expected count value after comma in fill directive.");
            return;
        }
        let fill_count = this.current_token.value;

        this.pc += fill_count;

        // Handle machine code generation in second pass
        if (this.second_parse) {
            const fill_data = new Array(fill_count).fill(fill_byte);
            this.binary = this.binary.concat(fill_data);
        }
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
                    break;
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

    print_hex() {
        const hex_array = this.binary.map(num => num.toString(16).padStart(2, '0').toUpperCase());
        console.log(hex_array.join(' '));
    }


    assemble() {
        this.#parse();

        this.second_parse = true;
        this.lexer.reset(this.source);
        this.#parse();

        console.log(this.label_table);
        console.log(this.const_table)
        this.print_hex()

        // 
        // this.#parse();
        // return this.binary;
    }
}



let input = `
const graphicsBase=$600, gLineBytes=$20
ldx #graphicsBase-gLineBytes+1
`

const asm = new Assembler(input).assemble();

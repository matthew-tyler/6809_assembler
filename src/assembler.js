import { lexer } from "./lexer";
import { BYTE, BYTE_MAX, WORD_MIN, WORD_MAX, PB_REGISTERS, ACCUMULATOR_POSTBYTE, INC_DEC, inherent_only, relative_only, accumulators, psh, register_only, WORD, BYTE_MIN, opcodes, INTER_REGISTER_POSTBYTE, PSH_PUL_POSTBYTE } from "./constants";


export class Assembler {

    constructor(source, base_address) {
        this.lexer = lexer;
        this.reset(source, base_address)
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

    #insert_binary(...values) {

        for (let value of values) {

            if (value > BYTE_MAX) {
                this.binary.push((value >> 8) & 0xFF);
                this.binary.push(value & 0xFF);
            } else {
                this.binary.push(value);
            }

        }

    }

    #error(message) {
        console.log(this.lexer.formatError(this.current_token, message));
    }

    reset(new_source, base_address) {
        this.halt();

        if (new_source) {
            this.source = new_source.concat('\n')
        }

        this.lexer.reset(this.source);
        this.label_table = {};
        this.const_table = {}
        this.pc = base_address || 0x4000;
        this.dp = 0;
        this.binary = [];
        this.current_token = {};

        this.second_parse = false;
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
            this.#handle_inherent();
        } else if (relative_only.has(this.current_token.value)) {
            this.#handle_relative();
        } else if (register_only.has(this.current_token.value)) {
            this.#handle_register_only();
        } else if (psh.has(this.current_token.value)) {
            this.#handle_psh_pul();
        } else {

            const mnemonic = this.current_token.value;
            const op = opcodes.get(mnemonic);
            this.#next();

            switch (this.current_token.type) {

                case "IMMEDIATE":
                    this.#handle_immediate(op, mnemonic);
                    break;
                case "DIRECT":
                case "EXT_DIR":
                    this.#handle_direct(op, this.current_token.type);
                    break;
                case "INDIRECT_START":
                    this.#next();
                    this.#handle_args(op, "INDIRECT");
                    break;
                default:
                    this.#handle_args(op); // Mode currently undefined
                    break;
            }

        }

    }

    #handle_immediate(op, mnemonic) {
        if (op.immediate === undefined) {
            this.#error(`Immediate addressing mode not allowed with ${mnemonic}`);
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
                this.#error("Expecting a value");
            }

            if (this.current_token.type === "INTEGER") {
                value += this.current_token.value;
            } else if (this.current_token.type === "IDENTIFIER") {
                value += (this.const_table[this.current_token.value] || this.label_table[this.current_token.value]) * sign;
                sign = 1;
            }
        }

        if (this.second_parse) {

            this.#insert_binary(op.immediate.code);

            if (op.immediate.size == 2) {
                this.binary.push(value & 0xFF);

            } else {

                this.binary.push((value >> 8) & 0xFF); // High byte
                this.binary.push(value & 0xFF);
            }

        }
    }

    #handle_direct(op, mode) {
        // direct in the form op < or > then n.

        const n = this.#value_token(this.#next());
        if (mode === "EXT_DIR") {

            const opcode = op.extended.code;

            if (opcode === undefined) {
                this.#error("No extended direct mode for this operation")
            }

            this.pc += op.extended.size;

            if (this.second_parse) {
                this.#insert_binary(opcode)

                if (n.length === 2) {
                    this.binary.push(...n);
                } else {
                    this.binary.push(0x00, ...n)
                }
            }
        } else {

            const opcode = op.direct.code;

            if (opcode === undefined) {
                this.#error("No direct mode for this operation")
            }

            this.pc += op.direct.size;

            if (this.second_parse) {
                this.#insert_binary(opcode)

                if (n.length === 1) {
                    this.binary.push(...n);
                } else {
                    this.binary.push(n.pop())
                }
            }
        }
    }

    #handle_inherent() {
        this.pc += BYTE; // I think these instructions are always 1 byte...

        if (this.second_parse) {
            const code = opcodes.get(this.current_token.value).inherent.code;
            this.#insert_binary(code);
        }

        this.#next();
        if (this.current_token.type !== 'NL') {
            this.#error("Inherent instructions don't take arguments")
        }
    }

    #handle_relative() {
        const instruction = opcodes.get(this.current_token.value);

        this.#next();
        this.pc += instruction.relative.size;

        if (this.current_token.type !== "IDENTIFIER") {
            this.#error("Branches require a label");
        }

        if (this.second_parse) {

            this.#insert_binary(instruction.relative.code);

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
    }

    #handle_register_only() {
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
            this.#insert_binary(instruction.immediate.code, postbyte);
        }
    }

    #handle_psh_pul() {
        const psh_reg = this.current_token.value.charAt(3); // The magic number is just the final char of pshs/puls/pshu/pulu
        const opcode = opcodes.get(this.current_token.value).immediate.code;
        let postbyte = 0;


        while (this.#next().type !== 'NL') {
            if (this.current_token.type === 'COMMA') {
                continue;
            }

            const register = PSH_PUL_POSTBYTE[this.current_token.value];

            if (register === undefined) {
                this.#error("Expecting a register");
            }

            if (this.current_token.value === psh_reg) {
                this.#error("Can't push/pul to/from the same register")
            }

            postbyte |= register;
        }

        this.pc += WORD // which I think is just 2 bytes.

        if (this.second_parse) {
            this.#insert_binary(opcode, postbyte);
        }

    }

    #handle_args(op, mode) {

        let n = 0;
        let register;
        let postbyte;

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
                        value = WORD_MIN;
                    }

                    n = value;
                    break;
                default:
                    this.#error('Unexpected token')
                    break;

            }
        }
        this.#next();




        if (this.current_token.type === 'NL') {

            n = this.#encode_value_as_bytes(n)

            if (n.length == 1) {

                if (op.direct === undefined) {
                    this.#error('Direct addressing not allowed')
                }

                this.pc += op.direct.size;

                if (this.second_parse) {
                    this.#insert_binary(op.direct.code);
                    this.binary.push(...n); // low byte
                }
            } else {

                if (op.extended === undefined) {
                    this.#error("Extended addressing not allowed");
                }

                this.pc += op.extended.size;


                if (this.second_parse) {
                    this.#insert_binary(op.extended.code);
                    this.binary.push(...n); // low byte
                }

            }
            return;

        }


        if (this.current_token.type === 'INDIRECT_END') {
            // handle [n]
            this.pc += (op.indexed.size + 2) // + 2 for the postbyte and arg

            if (this.second_parse) {

                this.#insert_binary(op.indexed.code)
                this.binary.push(0x9F)

                n = this.#encode_value_as_bytes(n, WORD);
                if (n.length === 2) {
                    this.binary.push(...n);
                } else {
                    this.binary.push(...n);
                }
            }
            return;

        } else if (this.current_token.type === 'COMMA') {
            this.#next();
        }

        if (this.current_token.type === 'DEC' || this.current_token.type === 'DEC2') {
            if (this.current_token.type === 'DEC' && mode === 'INDIRECT') {
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
                    postbyte = 0x8C;
                } else {
                    postbyte = 0x8D;
                }

            } else {
                register = PB_REGISTERS[this.current_token.value];
            }

        } else {
            this.#error(`Unexpected argument ${this.current_token.text}`)

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

        if (this.current_token.type === 'INDIRECT_END') {

            if (mode !== 'INDIRECT') {
                this.#error("Possibly missing [ at start of arguments");
            }
            this.#next();
        }

        if (this.current_token.type !== 'NL') {
            // console.log(this.current_token);
            this.#error('Unexpected token');
        }


        if (register !== undefined) {
            this.pc += op.indexed.size;

            // This is in the case n,R or ,R 
            if (postbyte === undefined) {



                if (n === 0) {
                    // handle as 1RR00100
                    postbyte = 0x84 | register;
                } else if ((n >= -16 && n <= 15) && mode !== 'INDIRECT') {
                    // The value fits in a 5-bit offset, indicating a total of 2 bytes
                    // should be in the form 0RRnnnnn
                    // Not available if in indirect mode

                    if (n < 0) { // Checks if the 8th bit is set (for 8-bit numbers)
                        n = (32 + n) % 32; // Invert all bits and limit to 8 bits
                    }
                    postbyte = n | register;
                    n = 0;

                } else if (n >= -128 && n <= 127) {

                    this.pc += 1 // Adds 1 byte for handling the postbyte

                    postbyte = 0x88 | register;

                } else if (n >= -32768 && n <= 32767) {

                    this.pc += 2 // adds 2 bytes for size + instruction. These do nothing.....
                    postbyte = 0x89 | register;

                } else {
                    console.log(this.current_token, "Number not right");
                }
            } else {
                // This must be A,R for accumulator offset
                // or auto inc/dec
                postbyte = postbyte | register;

            }

            if (mode === 'INDIRECT') {
                // set 00010000 for the indirect version of the postbyte
                postbyte = postbyte | 0x10
            }


            if (this.second_parse) {
                this.#insert_binary(op.indexed.code, postbyte)

                if (n === 0) {
                    return;
                }
                n = this.#encode_value_as_bytes(n);
                this.binary.push(...n);
            }

        } else {

            this.pc += op.indexed.size;


            // console.log(this.current_token);
            if (postbyte === 0x8C) {

                if (mode === 'INDIRECT') {
                    // set 00010000 for the indirect version of the postbyte
                    postbyte = postbyte | 0x10
                }

                this.pc += 1;
                n = n - this.pc;
                n = this.#encode_value_as_bytes(n, BYTE);

                if (this.second_parse) {
                    this.#insert_binary(op.indexed.code, postbyte)
                    this.binary.push(...n);
                }

            } else if (postbyte === 0x8D) {

                if (mode === 'INDIRECT') {
                    // set 00010000 for the indirect version of the postbyte
                    postbyte = postbyte | 0x10
                }
                this.pc += 2;
                n = n - this.pc;
                n = this.#encode_value_as_bytes(n, WORD);

                if (this.second_parse) {
                    this.#insert_binary(op.indexed.code, postbyte)
                    this.binary.push(...n);
                }

            }


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
        while (this.#next().type !== 'NL') {


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
                    if (size === BYTE) {
                        this.pc += BYTE; // Size of a byte
                        if (this.second_parse) {
                            this.binary.push(this.current_token.value & 0xFF); // Add the byte to the binary array
                        }
                    } else if (size === WORD) {
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
                    // case 'NL':
                    continue;
                default:
                    this.#error("Unexpected token in data directive.");
                    break;
            }

        }
    }

    #value_token(token) {

        switch (token.type) {
            case "CHAR":
            case "INTEGER":
                return this.#encode_value_as_bytes(token.value);
            case "IDENTIFIER":
                let value = this.label_table[token.value] || this.const_table[token.value];
                if (value === undefined && this.second_parse) {
                    this.#error('Unresolved label');
                }
                return this.#encode_value_as_bytes(value);
            default:
                this.#error('Expecting a value')
                break;
        }
    }

    #size_of_value(value) {

        if (value >= -128 && value <= 127) {
            return BYTE;
        } else if (value >= -32768 && value <= 32767) {
            return WORD;
        }

        this.#error(`${value} is too small or large `)
        // console.log(this.#next());
    }

    #encode_value_as_bytes(value, size) {

        const output_bytes = []



        if (!size) {

            size = this.#size_of_value(value)
        }

        if (size === BYTE) {

            if (value < 0) {
                value += 0x100;
            }


            output_bytes.push(value & 0xFF); // Low byte
        } else if (size === WORD) {
            if (value < 0) {
                value += 0x10000;
            }

            output_bytes.push(value >> 8); // High byte
            output_bytes.push(value & 0xFF); // Low byte
        }

        return output_bytes;
    }

    #parse() {

        while (this.#next()) {
            // This switch statement should be the first token of each statement 
            // while helper functions will deal with each statement.
            // console.log('tp', this.current_token);
            switch (this.current_token.type) {
                case 'LABEL':
                    // console.log('top_label', this.current_token, this.pc)
                    if (!this.second_parse) {
                        this.label_table[this.current_token.value] = this.pc;
                    }
                    break;
                case 'DIRECTIVE':
                    this.#handle_directive();
                    break;
                case 'OPCODE':
                    this.#handle_opcode();
                    break;
                case 'IDENTIFIER':
                    // will handle const, equ and =
                    if (!this.second_parse) {
                        this.#handle_equ(this.current_token.value);
                    }
                    break;
            }
        }
    }

    print_hex(arr) {
        const hex_array = arr.map(num => num.toString(16).padStart(2, '0').toUpperCase());
        console.log(hex_array.join(' '));
    }


    assemble() {
        this.#parse();
        this.second_parse = true;
        this.f_label_table = this.label_table;
        this.lexer.reset(this.source);
        this.pc = 0x4000;
        this.#parse();
        return this.binary;
    }
}



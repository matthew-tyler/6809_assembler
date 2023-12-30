import { lexer } from "./lexer";
import { BYTE, BYTE_MAX, WORD_MIN, WORD_MAX, PB_REGISTERS, ACCUMULATOR_POSTBYTE, INC_DEC, inherent_only, relative_only, accumulators, psh, register_only, WORD, BYTE_MIN, opcodes, INTER_REGISTER_POSTBYTE, PSH_PUL_POSTBYTE } from "./constants";


/**
 * A JavaScript-based assembler for the 6809 8-bit CPU. This class provides
 * functionality to convert assembly language code into machine code.
 */
export class Assembler {

    /**
     * Creates an instance of the Assembler.
     * @param {string} source - The assembly source code as a string.
     * @param {number} [base_address=0x4000] - The base address for the assembly. Default 0x4000
     */
    constructor(source, base_address) {
        this.lexer = lexer;
        this.reset(source, base_address)
    }

    /**
     * Retrieves the next token from the lexer, skipping comments and whitespace.
     * @private
     */
    #next() {
        // Loop indefinitely until a non-comment and non-whitespace token is found
        while (true) {
            this.current_token = this.lexer.next();

            // If the current token is undefined, return it
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

    /**
     * Inserts binary values into the binary array if in the second parse phase.
     * @param  {...any} values - The values to be inserted.
     * @private
     */
    #insert_binary(...values) {

        if (!this.second_parse) {
            return;
        }

        for (let value of values) {

            if (value > BYTE_MAX) {
                this.binary.push((value >> 8) & 0xFF);
                this.binary.push(value & 0xFF);
            } else {
                this.binary.push(value);
            }

        }

    }

    /**
     * Logs an error message with the current token's context.
     * @param {string} message - The error message to log.
     * @private
     */
    #error(message) {
        console.log(this.lexer.formatError(this.current_token, message));
    }

    /**
     * Expects a specific token type and throws an error with a custom message if not found.
     * @param {string} token_type - The expected type of the token.
     * @param {string} error_message - The error message if the expectation is not met.
     * @private
     */
    #expect(token_type, error_message) {
        if (this.current_token.type !== token_type) {
            this.#error(error_message)
        }
    }

    /**
     * Resets the assembler with new source code and/or base address.
     * @param {string} new_source - The new source code for the assembler.
     * @param {number} [base_address=0x4000] - The base address for the assembly. Default 0x4000
     */
    reset(new_source, base_address) {
        this.halt();

        if (new_source) {
            this.source = new_source.concat('\n')
        }

        this.running = true;
        this.lexer.reset(this.source);
        this.label_table = {};
        this.const_table = {}
        this.pc = base_address || 0x4000;
        this.base_address = base_address || 0x4000;
        this.dp = 0;
        this.binary = [];
        this.current_token = {};
        this.second_parse = false;
    }


    /**
     * Halts the execution of the assembler.
     */
    halt() {
        this.running = false;
    }

    /**
     * Handles assembly directives.
     * @private
     */
    #handle_directive() {
        switch (this.current_token.value) {
            case 'org':
                // sets the origin. I guess that just updates the PC?
                this.#next();
                this.#expect('INTEGER', "ORG directives should be followed by a valid number")
                this.pc = Math.abs(this.current_token.value);
                break;
            case 'end':
                this.halt();
                break;
            case 'setdp':
            case 'direct':
                this.#next();
                this.#expect('INTEGER', "DP directives should be followed by a valid number")
                this.dp = Math.abs(this.current_token.value);
                break;
            case 'rmb':
            case 'ds':
                this.#next();
                this.#expect('INTEGER', "RMB/DS directives should be followed by a valid number")
                const num_bytes = Math.abs(this.current_token.value);
                this.pc += num_bytes;
                this.#insert_binary(...new Array(num_bytes).fill(0));
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

    /**
     * Handles the processing of the current opcode.
     * Depending on the opcode type, it delegates to the appropriate handler function.
     * @private
     */
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
                    this.#handle_indexed(op, "INDIRECT");
                    break;
                default:
                    this.#handle_indexed(op); // Mode currently undefined
                    break;
            }

        }

    }


    /**
     * Handles immediate addressing mode of operation.
     * It processes the immediate value and inserts the corresponding binary code.
     * @param {Object} op - The operation details object.
     * @param {string} mnemonic - The mnemonic of the current opcode.
     * @private
     */
    #handle_immediate(op, mnemonic) {
        if (op.immediate === undefined) {
            this.#error(`Immediate addressing mode not allowed with ${mnemonic}`);
        }

        this.pc += op.immediate.size;

        let value = 0;
        let sign = 1; // janky as. 

        while (this.#next().type !== 'NL') {
            switch (this.current_token.type) {
                case "INC":
                    // Skip token
                    break;
                case "DEC":
                    // Toggle sign for subtraction
                    sign = -1;
                    break;
                case "INTEGER":
                    // Add integer value to the total
                    value += this.current_token.value * sign;
                    sign = 1; // Reset sign after using
                    break;
                case "IDENTIFIER":
                    // Add value from tables, considering sign
                    value += (this.const_table[this.current_token.value] || this.label_table[this.current_token.value] || 0) * sign;
                    sign = 1; // Reset sign after using
                    break;
                default:
                    this.#error("Expecting a value");
            }
        }

        if (this.second_parse) {

            this.#insert_binary(op.immediate.code);

            // this.#encode_value_as_bytes()

            if (op.immediate.size == 2) {
                this.binary.push(value & 0xFF);

            } else {

                this.binary.push((value >> 8) & 0xFF); // High byte
                this.binary.push(value & 0xFF);
            }

        }
    }

    /**
     * Handles direct addressing mode of operation.
     * It processes the operand for direct addressing mode and inserts the corresponding binary code.
     * @param {Object} op - The operation details object.
     * @param {string} mode - The addressing mode ('DIRECT' or 'EXT_DIR').
     * @private
     */
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

    /**
     * Handles inherent addressing mode. It assumes these instructions are always one byte and
     * inserts the corresponding binary code for the opcode on the second parse.
     * @private
     */
    #handle_inherent() {
        this.pc += BYTE; // I think these instructions are always 1 byte...

        const code = opcodes.get(this.current_token.value).inherent.code;
        this.#insert_binary(code);
        this.#next();
        this.#expect('NL', "Instruction not expecting arguments")
    }

    /**
     * Handles relative addressing mode. This method calculates the relative offset
     * for branch instructions and inserts the corresponding binary code.
     * @private
     */
    #handle_relative() {
        const instruction = opcodes.get(this.current_token.value);

        this.#next();
        this.pc += instruction.relative.size;

        this.#expect('IDENTIFIER', "Branches require a label")

        if (this.second_parse) {

            this.#insert_binary(instruction.relative.code);

            const address = this.label_table[this.current_token.value];

            if (address === undefined) {
                this.#error("Label not defined");
            }

            let relative_offset = address - this.pc;

            if (instruction.relative.size === 2) {

                if (relative_offset < -126 || relative_offset > 129) {
                    this.#error("Branch offset out of range, consider using a long branch");
                }
                this.#insert_binary(...this.#encode_value_as_bytes(relative_offset, BYTE))

            } else {

                // Handle 16-bit relative branches
                if (relative_offset < -32768 || relative_offset > 32767) {
                    this.#error("Long branch offset out of range");
                }

                this.#insert_binary(...this.#encode_value_as_bytes(relative_offset, WORD))
            }

        }
    }

    /**
     * Handles operations that work only with registers, such as 'tfr' and 'exg'.
     * It processes the opcode and the source and destination registers, then
     * constructs and inserts the binary code for these operations.
     * @private
     */
    #handle_register_only() {
        // handle tfr and exg 

        const instruction = opcodes.get(this.current_token.value);

        this.#next();
        const source_register = INTER_REGISTER_POSTBYTE[this.current_token.value]
        if (source_register === undefined) {
            this.#error("Should be a regiseter");
        }

        this.#next();
        this.#expect('COMMA', "Registers should be comma seperated")

        this.#next();

        const destination_register = INTER_REGISTER_POSTBYTE[this.current_token.value];

        if (destination_register === undefined) {
            this.#error("Should be a register")
        }

        this.pc += 2 // both of these commands take 2 bytes.

        const postbyte = source_register << 4 | destination_register;
        this.#insert_binary(instruction.immediate.code, postbyte);

    }

    /**
     * Handles push and pull operations for the CPU stack. This method reads the
     * opcode and register list, calculates the postbyte, and inserts the binary code.
     * @private
     */
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
        this.#insert_binary(opcode, postbyte);
    }

    /**
     * Handles indexed addressing mode. This method processes the operand and
     * addressing mode for indexed operations and constructs the binary code on the second parse.
     * @param {Object} op - The operation details object.
     * @param {string} mode - The addressing mode ('DIRECT', 'INDIRECT', etc.).
     * @private
     */
    #handle_indexed(op, mode) {

        let n = 0;
        let register;
        let postbyte;

        switch (this.current_token.type) {
            case "CHAR": // I believe chars act just like numbers here. Needs a value transform
            case "INTEGER":
                n = this.current_token.value;
                break;
            case "REGISTER":
                if (accumulators.has(this.current_token.value)) {
                    postbyte = ACCUMULATOR_POSTBYTE[this.current_token.value];
                } else {
                    register = PB_REGISTERS[this.current_token.value];
                    // this.#error('Expecting value or an accumulator')
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
            case 'COMMA':
                // commas do nothing.
                break;
            default:
                this.#error('Unexpected token')
                break;

        }

        this.#next();

        // Handles op value
        if (this.current_token.type === 'NL') {

            if (register !== undefined) {
                this.#handle_register_op(op, mode, n, postbyte, register);
                return

            }

            n = this.#encode_value_as_bytes(n)

            if (n.length == 1) {

                if (op.direct === undefined) {
                    this.#error('Direct addressing not allowed')
                }

                this.pc += op.direct.size;
                this.#insert_binary(op.direct.code, ...n);

            } else {

                if (op.extended === undefined) {
                    this.#error("Extended addressing not allowed");
                }

                this.pc += op.extended.size;
                this.#insert_binary(op.extended.code, ...n);
            }

            return;

        }

        // handles op [n]
        if (this.current_token.type === 'INDIRECT_END') {
            if (postbyte) {
                this.#error("Can't use the form [register]")
            }

            this.#next();
            this.#expect('NL', "Unexpected value following statement")

            this.pc += (op.indexed.size + 2) // + 2 for the postbyte and arg
            n = this.#encode_value_as_bytes(n, WORD);
            this.#insert_binary(op.indexed.code, 0x9F, ...n)
            return;
        }

        // step forward on comma
        if (this.current_token.type === 'COMMA') {
            this.#next();
        }

        // handles opcode ,--Y sorta thing
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

        // determins register or if PCR
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

        // handles opcode ,y++ sorta thing
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


        // handles opcode ,y] 
        if (this.current_token.type === 'INDIRECT_END') {
            if (mode !== 'INDIRECT') {
                this.#error("Possibly missing [ at start of arguments");
            }
            this.#next();
        }

        this.#expect('NL', 'Unexpected token')

        if (register !== undefined) {
            this.#handle_register_op(op, mode, n, postbyte, register);
            return

        }

        this.#handle_pcr(op, mode, postbyte, n);
    }

    /**
     * Handles program counter relative addressing. This method calculates the offset
     * from the program counter and constructs the binary code for PCR addressing.
     * @param {Object} op - The operation details object.
     * @param {string} mode - The addressing mode.
     * @param {number} postbyte - The postbyte value calculated for PCR addressing.
     * @param {number} n - The numerical value representing the offset or address.
     * @private
     */
    #handle_pcr(op, mode, postbyte, n) {
        this.pc += op.indexed.size;
        if (mode === 'INDIRECT') {
            // set 00010000 for the indirect version of the postbyte
            postbyte = postbyte | 0x10;
        }

        if (postbyte === 0x8C || postbyte === 0x9C) {

            this.pc += 1;
            n = n - this.pc;
            n = this.#encode_value_as_bytes(n, BYTE);

            this.#insert_binary(op.indexed.code, postbyte, ...n);

        } else if (postbyte === 0x8D || postbyte === 0x9D) {

            this.pc += 2;
            n = n - this.pc;
            n = this.#encode_value_as_bytes(n, WORD);
            this.#insert_binary(op.indexed.code, postbyte, ...n);

        }
    }

    /**
     * Handles operations specific to register-to-register operations. This method
     * calculates the postbyte for register-specific operations and constructs the
     * binary code accordingly.
     * @param {Object} op - The operation details object.
     * @param {string} mode - The addressing mode.
     * @param {number} n - The numerical value representing the offset or address.
     * @param {number} postbyte - The postbyte value for the operation.
     * @param {number} register - The register code for the operation.
     * @private
     */
    #handle_register_op(op, mode, n, postbyte, register) {
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
    }

    /**
     * Handles the EQU directive for setting constants.
     * It assigns integer values or other constants to identifiers in the const_table.
     * @param {string|null} id - The identifier for the constant being set.
     * @private
     */
    #handle_equ(id) {
        while (this.#next().type !== 'NL') {
            switch (this.current_token.type) {
                case 'INTEGER':
                    this.const_table[id] = this.current_token.value;
                    break;
                case 'IDENTIFIER':
                    // Handles identifiers: sets ID if not set, otherwise assigns value to const_table
                    if (id === null) {
                        id = this.current_token.value;
                    } else {
                        this.const_table[id] = this.const_table[this.current_token.value] || this.current_token.value;
                    }
                    break;
                case 'COMMA':
                    // Resets the identifier upon encountering a comma
                    id = null;
                    break;
                default:
                    if (this.current_token.value !== 'equ' && this.current_token.value !== "=") {
                        this.#error("Unexpected token in equ directive");
                    }
            }

        }
    }

    /**
     * Handles the VAR directive for defining variables.
     * It allocates space for variables and sets their addresses in the const_table.
     * @private
     */
    #handle_var() {
        this.#next();

        let var_size = 0;

        if (this.current_token.type === 'INTEGER') {
            var_size = this.current_token.value;
        }

        while (this.#next().type !== 'NL') {
            switch (this.current_token.type) {
                case 'IDENTIFIER':
                    // Adds label to const_table with the current pc and increments pc by var_size
                    this.const_table[this.current_token.value] = this.pc;
                    this.pc += Math.abs(var_size);
                    this.#insert_binary(...new Array(Math.abs(var_size)).fill(0));
                    break;
                case 'COMMA':
                case 'WS':
                    // Skips separators like commas and whitespace
                    break;
                default:
                    this.#error("Unexpected token after var directive");
            }
        }
    }

    /**
     * Handles the FILL directive for initializing a block of memory with a value.
     * It fills a specified number of bytes with a given byte value.
     * @private
     */
    #handle_fill() {
        this.#next();

        // Expect an integer for fill_byte
        this.#expect('INTEGER', "Expected byte value after fill directive.")

        let fill_byte = this.current_token.value;

        if (fill_byte < BYTE_MIN || fill_byte > BYTE_MAX) {
            this.#error("Byte value out of range (0-255).");
            return;
        }

        // Expect a comma after fill_byte
        this.#next();
        this.#expect('COMMA', "Expected comma after byte value in fill directive.")

        // Expect an integer for fill_count
        this.#next();
        this.#expect('INTEGER', "Expected count value after comma in fill directive.");

        let fill_count = this.current_token.value;

        this.pc += fill_count;
        this.#insert_binary(...new Array(fill_count).fill(fill_byte))
    }

    /**
     * Handles the data directives for defining byte or word data.
     * It inserts the specified data into the binary output.
     * @param {number} size - The size of the data (BYTE or WORD).
     * @private
     */
    #handle_data(size) {
        //size is either a byte (1) or word (2)
        while (this.#next().type !== 'NL') {


            switch (this.current_token.type) {
                case 'STRING':
                    this.pc += this.current_token.value.length;
                    this.#insert_binary(...Array.from(this.current_token.value, char => char.charCodeAt(0)))
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
                    this.#insert_binary(this.current_token.value.charCodeAt(0))
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

    /**
     * Extracts and encodes the value from a token into bytes.
     * It is used to process CHAR, INTEGER, and IDENTIFIER tokens.
     * @param {Object} token - The token from which to extract the value.
     * @returns {number[]} The encoded value as an array of bytes.
     * @private
     */
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

    /**
     * Determines the size of a value in bytes.
     * It checks if the value fits within a byte or requires a word.
     * @param {number} value - The value to check.
     * @returns {number} The size of the value (BYTE or WORD).
     * @private
     */
    #size_of_value(value) {

        if (value >= -128 && value <= 127) {
            return BYTE;
        } else if (value >= -32768 && value <= 65536) {
            return WORD;
        }

        this.#error(`${value} is too small or large `)
    }

    /**
     * Encodes a value into an array of bytes based on the specified size.
     * It converts a given value into its byte or word representation.
     * @param {number} value - The value to encode.
     * @param {number} [size] - The size of the value in bytes (BYTE or WORD).
     * @returns {number[]} The encoded value as an array of bytes.
     * @private
     */
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

    /**
     * Parses the source code and performs the first pass of assembly.
     * It interprets labels, directives, opcodes, and identifiers.
     * @private
     */
    #parse() {

        while (this.#next() && this.running) {
            // This switch statement should be the first token of each statement 
            // while helper functions will deal with each statement.
            // console.log('tp', this.current_token);
            switch (this.current_token.type) {
                case 'LABEL':
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

    /**
     * Prints the binary output in hexadecimal format.
     * It is useful for debugging and verifying the assembled code.
     * @param {number[]} arr - The array of byte values to print.
     */
    print_hex(arr) {
        const hex_array = arr.map(num => num.toString(16).padStart(2, '0').toUpperCase());
        console.log(hex_array.join(' '));
    }


    /**
     * Parses the assembly source code and assembles it into machine code.
     * @returns {number[]} The assembled machine code as an array of byte values.
     */
    assemble() {
        this.#parse();
        this.second_parse = true;
        this.running = true;
        this.lexer.reset(this.source);
        this.pc = this.base_address;
        this.#parse();
        return this.binary;
    }
}
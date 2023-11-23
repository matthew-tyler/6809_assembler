import { lexer } from "./lexer";


class Assembler {

    constructor(source) {
        this.lexer = lexer;
        this.reset(source.toLowerCase())
        this.label_table = new Map();
        this.pc = 0;
        this.dp = 0;
        this.binary = [];
        this.current_token = null;

        this.second_parse = false;;
    }

    #next() {
        this.current_token = lexer.next();

        if (this.current_token.type === "COMMENT" || this.current_token.type === "WS") {
            this.#next();
        } else {
            // This allows us to do next in while loops as the lexer will return undefined when done. 
            return this.current_token
        }
    }

    #error(message) {
        throw new Error(this.lexer.formatError(this.current_token, message))
    }

    #handle_directive() {

    }

    #handle_opcode() {

    }

    #handle_equ(id) {

    }

    #handle_var() { }

    #handle_fill() { }

    #handle_data() { }

    #handle_args(op, mode) {

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
                    this.#handle_equ(this.current_token.value);
                    break;
            }
        }
    }

    assemble() {
        this.#parse();
        this.second_parse = true;

        // this.lexer().reset();
        // this.#parse();
        // return this.binary;
    }
}


# 6809 Assembler in JavaScript

## Introduction

This project is a JavaScript-based assembler for the 6809 8-bit CPU, a classic microprocessor known for its use in various classic computing systems. The assembler is designed to convert assembly language code written for the 6809 CPU into machine code. This project is currently in progress though in a somewhat working state. 

## Features

- **Assembly Language Processing**: Converts 6809 assembly language instructions into machine code.
- **Error Handling**: Provides informative error messages for syntax or logical errors in the assembly code.
- **Compatibility**: Designed to be compatible with various systems that utilised the 6809 CPU.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm (Node Package Manager)
- [Bun](https://bun.sh/) for running and testing the assembler

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/matthew-tyler/6809_assembler.git
   ```

2. Install dependencies: 
    ```bash
    cd 6809-assembler-js
    npm install
    ```
    
### Usage

To assemble, first import the assembler 

```javascript
import { Assembler } from "./assembler";
```

Then create a new assembler with your input string

```javascript

const input = `
    start:
        pshs a,x,y
`

const asm = new Assembler(input);
```

You can call the assemble method on the assembler and it will return the machine code.

```javascript
const output = asm.assemble();
```

You can reuse the same assembler with you input by calling the reset method

```javascript

const new_input = `
    start:
        lda #5
`

asm.reset(new_input)
```

The default starting address is 0x4000. To provide a new address pass this as the second argument to the constructor or reset method.

```javascript
const input = `
    start:
        pshs a,x,y
`

const asm = new Assembler(input, 0x0);

asm.reset(input, 0x0400)
```


### Run With Bun

This project is currently run with bun. Why? Because node is annoying with the import statements. I could fix this by changing the module type etc but I had bun installed and it worked. 

example:

```bash
bun src/main.js
```

### Testing

The tests are written with bun test. The tests aren't exactly exhaustive but they cover some of the basics. There are some known problems that I have yet to write the tests for, and no doubt many more unknown problems. 

To run tests:

```bash
bun test
```


## The Project 

### Why?

This project is purely born out of interest for the 6809 and massively inspired by the 6809.uk website. It was written with very little planning by somebody who knows very little about assemblers. So if you find yourself asking "why?" the answer is quite probably "because I didn't/don't know better". 

This started as a "write one to throw away" and it has yet to be thrown away. 

With all of that in mind, I will explain what I've done and I'm more than open to be told how it could be improved.


### Project Structure

```
.
├── LICENSE
├── README.md -> You are here
├── package-lock.json
├── package.json
├── src
│   ├── assembler.js -> Contains the assembler class
│   ├── constants.js -> Some constants used by the assembler
│   ├── lexer.js     -> The Moo based lexer, used by the assembler to tokenize.
│   └── main.js      -> Just a simple interface to the assembler for basic usage
└── tests
    └── assembler
        ├── addressing.test.js  -> Tests for address 6809 modes
        ├── directives.test.js  -> Tests for assembler directives
        ├── misc.test.js        -> Assorted other tests
        ├── programs.test.js    -> Full programs.
        └── utils.js            -> Functions used by all of the other test files.
```


### The Lexer

This assembler is built on top of the [Moo](https://github.com/no-context/moo) tokenizer/lexer. 

I did this as I was initially noodling around with my own single character lookahead solution, but wasn't entierly sure what I needed to handle. Moo was an easy option to extend quickly however there's some things I'd like to do that it currently doesn't handle. 

Although it may be that I'm trying to do something that isn't entirely sensible, so it remains to be seen if it'll stay or go. 


### The Assembler

I built the assembler as a class. It seemed to work well to have something of a state container, and to work somewhat like an iterator. The basic idea is to call "next" until a newline token is returned from the lexer, and each time we do we use the current token to determine more about the addressing mode etc until we can correctly determine the machine code for each line. 

As things got more complex this simple "call next then check the token" approach became a bit hard to follow. It certainly is messier than I would like, however it does appear to work and makes it easy to write fairly fine grained error messages. 

This assembler works as a two pass assembler to handle forward references. In the first pass it will determine the size but not generate machine code leaving that until the second parse. 
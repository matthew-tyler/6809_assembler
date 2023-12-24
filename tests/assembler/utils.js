
import { expect } from "bun:test";




export function print_hex(arr) {
    const hex_array = arr.map(num => num.toString(16).padStart(2, '0').toUpperCase());
    console.log(hex_array.join(' '));
}

export function test_result(result, expected_binary) {
    expect(result.length).toBe(expected_binary.length);

    result.forEach((element, index) => {
        expect(element).toBe(expected_binary[index]);
    });
}


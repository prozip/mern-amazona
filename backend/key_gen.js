import RSA from "./my_rsa.js";


// Message
const message = 'Hello, World!';

// Generate RSA keys
const keys = RSA.generate(250);

console.log('My RSA Keys: ');
console.log('n:', keys.n.toString());
console.log('d:', keys.d.toString());
console.log('e:', keys.e.toString());
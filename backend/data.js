import bcrypt from 'bcryptjs';
import RSA from './my_rsa.js';
import dotenv from 'dotenv';
dotenv.config();


const encryptRSA = (plaintext_msg) =>{
  var encoded_message = RSA.encode(plaintext_msg);
  var encrypted_message = RSA.encrypt(encoded_message, process.env.RSA_N, process.env.RSA_E);
  return encrypted_message.toString()
}
const decryptRSA = (encrypted_message) =>{
  var decrypted_message = RSA.decrypt(encrypted_message, process.env.RSA_D, process.env.RSA_N);
  var decoded_message = RSA.decode(decrypted_message);
  return decoded_message.toString()
}
const data = {
  users: [
    {
      name: encryptRSA('admin'),
      email: encryptRSA('admin@example.com'),
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
    },
    {
      name: encryptRSA('John'),
      email: encryptRSA('user@example.com'),
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
    },
  ],
  products: [
    // {
    //   // _id: '1',
    //   name: 'Nike Slim shirt',
    //   slug: 'nike-slim-shirt',
    //   category: 'Shirts',
    //   image: '/images/p1.jpg', // 679px × 829px
    //   price: 120,
    //   countInStock: 10,
    //   brand: 'Nike',
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: 'high quality shirt',
    // },
    // {
    //   // _id: '2',
    //   name: 'Adidas Fit Shirt',
    //   slug: 'adidas-fit-shirt',
    //   category: 'Shirts',
    //   image: '/images/p2.jpg',
    //   price: 250,
    //   countInStock: 0,
    //   brand: 'Adidas',
    //   rating: 4.0,
    //   numReviews: 10,
    //   description: 'high quality product',
    // },
    // {
    //   // _id: '3',
    //   name: 'Nike Slim Pant',
    //   slug: 'nike-slim-pant',
    //   category: 'Pants',
    //   image: '/images/p3.jpg',
    //   price: 25,
    //   countInStock: 15,
    //   brand: 'Nike',
    //   rating: 4.5,
    //   numReviews: 14,
    //   description: 'high quality product',
    // },
    // {
    //   // _id: '4',
    //   name: 'Adidas Fit Pant',
    //   slug: 'adidas-fit-pant',
    //   category: 'Pants',
    //   image: '/images/p4.jpg',
    //   price: 65,
    //   countInStock: 5,
    //   brand: 'Puma',
    //   rating: 4.5,
    //   numReviews: 10,
    //   description: 'high quality product',
    // },
  ],
};
export default data;

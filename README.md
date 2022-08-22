WIP

### Installation
```
npm i moleculer-encryption-middleware
```

### Usage
This middleware, is just a little improvement of the [official middleware](https://moleculer.services/docs/0.14/middlewares.html#Encryption) because it use random IV instead of a fix IV


```typescript
// moleculer.config.js
import { encryptionMiddleware } from "moleculer-encryption-middleware";
//or with require
//const { encryptionMiddleware } = require("moleculer-encryption-middleware");

// this value need to be the same for all nodes
const password = Buffer.from("67544A58287C12EB654D0B6C14A5B36EC5916BD5A31BD7AD8F5B826B7C35A7D8", "hex");
//change it . no need to be a big number. less than 10 is enough. It need to be the same on all nodes (like the password)
const IVPosition = 4;

// you can use a string, so the password will be hashed with sha256
// ( so "moleculer" will become "67544A58287C12EB654D0B6C14A5B36EC5916BD5A31BD7AD8F5B826B7C35A7D8")
// const password = "moleculer";

module.exports = {
  middlewares: [
      encryptionMiddleware({
          password,
          IVPosition,
          //optional
          algorithm: "aes-256-cbc",
          //length of the initialization vector . It depends on the algorithm .
          //For aes-256-cbc it is 16
          IVLength: 16
      })
  ]
};
```

### Available options

- password: Buffer | string | Uint8Array
  - need to be a 32 bytes Buffer or a string that will be sha256 hashed
- algorithm: string : algorithm to use for encryption (default: 'aes-256-cbc')
  - algorithm to use for encryption
- IVPosition: number : initialization vector position
  - need to be the same for all nodes (more secure to specify it, better with a small value)
- IVLength: number : length of the initialization vector (default: 16)
  - length of the initialization vector (16 for aes-256-cbc)

### Supported algorithms

 - "aes-256-cbc"

WIP

### Installation
```
npm i moleculer-encryption-middleware
```

### Usage


```typescript
// moleculer.config.js
import { encryptionMiddleware } from "moleculer-encryption-middleware";
//or with require
//const { encryptionMiddleware } = require("moleculer-encryption-middleware");

module.exports = {
  middlewares: [
      encryptionMiddleware({
          password: Buffer.from("67544A58287C12EB654D0B6C14A5B36EC5916BD5A31BD7AD8F5B826B7C35A7D8", "hex")
      })
  ]
};
```

### Available options

- password: Buffer | string | Uint8Array
  - need to be a 32 bytes long Buffer or a string that will be sha256 hashed
- algorithm: string : algorithm to use for encryption (default: 'aes-256-cbc')
  - algorithm to use for encryption
- IVPosition: number : initialization vector position
  - need to be the same for all nodes (more secure to specify it, better with a small value)
- IVLength: number : length of the initialization vector (default: 16)
  - length of the initialization vector, mandatory for node < 15.x (16 for aes-256-cbc)


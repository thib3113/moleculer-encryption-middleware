export interface EncryptionMiddleware {
    getAlgorithm(): string;

    decrypt(data: Buffer): Buffer;

    encrypt(data: Buffer): Buffer;
}

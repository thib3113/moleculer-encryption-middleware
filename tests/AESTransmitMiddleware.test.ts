import { Buffer } from 'buffer';
import { ServiceBroker } from 'moleculer';
import { AEStransmitMiddleware } from '../src/middlewares/AES';

describe('Test AESTransmitMiddleware', () => {
    const broker = new ServiceBroker({ logger: false });
    const password = 'mw-test';

    it('should export function', () => {
        const mw = new AEStransmitMiddleware(broker.logger, { password });
        expect(mw.encrypt).toBeInstanceOf(Function);
        expect(mw.decrypt).toBeInstanceOf(Function);
    });

    it('should keep same data with encrypt/decrypt', () => {
        const mw = new AEStransmitMiddleware(broker.logger, { password });

        const testString = 'moleculer';
        const testBuffer = Buffer.from(testString);

        const encryptedBuffer = mw.encrypt(testBuffer);

        expect(encryptedBuffer.toString()).not.toBe(testString);

        const decryptedBuffer = mw.decrypt(encryptedBuffer);
        expect(decryptedBuffer.toString()).toBe(testString);
    });

    // TODO redo the tests
    // it("should encrypt the data", () => {
    // 	const mw = Middleware(password);
    // 	const passwordBuffer = crypto.createHash("sha256").update(password).digest();
    //
    // 	const meta = {};
    // 	const next = jest.fn();
    // 	const send = mw.transporterSend.call(broker, next);
    //
    // 	send("topic", Buffer.from("plaintext data"), meta);
    //
    // 	expect(next).toHaveBeenCalledTimes(1);
    // 	expect(next).toHaveBeenCalledWith("topic", expect.any(Buffer), meta);
    //
    // 	const returnedBuffer = next.mock.calls[0][1];
    // 	expect(returnedBuffer).toBeInstanceOf(Buffer);
    // 	expect(Array.from(returnedBuffer)).toEqual(
    // 		Buffer.from("752ccddae14f6d892fe5843a0e0a2805e7709436de37f350122b47ddbabfcfb1", "hex")
    // 	);
    // });
    //
    // it("should encrypt the data with IV", () => {
    // 	const pass = crypto.randomBytes(32);
    // 	const iv = crypto.randomBytes(16);
    // 	const mw = Middleware(pass, "aes-256-ctr", iv);
    //
    // 	const meta = {};
    // 	const next = jest.fn();
    // 	const send = mw.transporterSend.call(broker, next);
    // 	const encrypter = crypto.createCipheriv("aes-256-ctr", pass, iv);
    //
    // 	send("topic", Buffer.from("plaintext data"), meta);
    //
    // 	expect(next).toHaveBeenCalledTimes(1);
    // 	expect(next).toHaveBeenCalledWith("topic", expect.any(Buffer), meta);
    // 	expect(next.mock.calls[0][1]).toEqual(
    // 		Buffer.concat([encrypter.update("plaintext data"), encrypter.final()])
    // 	);
    // });
    //
    // it("should decrypt data with IV", () => {
    // 	const mw = Middleware(password);
    //
    // 	const meta = {};
    // 	const next = jest.fn();
    // 	const receive = mw.transporterReceive.call(broker, next);
    // 	const encrypter = crypto.createCipher("aes-256-cbc", password);
    // 	const encryptedData = Buffer.concat([
    // 		encrypter.update("plaintext data"),
    // 		encrypter.final()
    // 	]);
    //
    // 	receive("topic", encryptedData, meta);
    // 	expect(next).toHaveBeenCalledTimes(1);
    // 	expect(next).toHaveBeenCalledWith("topic", Buffer.from("plaintext data"), meta);
    // });
    //
    // it("should decrypt data", () => {
    // 	const pass = crypto.randomBytes(32);
    // 	const iv = crypto.randomBytes(16);
    // 	const mw = Middleware(pass, "aes-256-ctr", iv);
    //
    // 	const meta = {};
    // 	const next = jest.fn();
    // 	const receive = mw.transporterReceive.call(broker, next);
    // 	const encrypter = crypto.createCipheriv("aes-256-ctr", pass, iv);
    // 	const encryptedData = Buffer.concat([
    // 		encrypter.update("plaintext data"),
    // 		encrypter.final()
    // 	]);
    //
    // 	receive("topic", encryptedData, meta);
    // 	expect(next).toHaveBeenCalledTimes(1);
    // 	expect(next).toHaveBeenCalledWith("topic", Buffer.from("plaintext data"), meta);
    // });
});

import { ServiceBroker, Middleware, CallMiddlewareHandler } from 'moleculer';
import middleware, { encryptionMiddlewareOptions } from '../src';
import { AEStransmitMiddleware } from '../src/middlewares/AES';

jest.mock('../src/middlewares/AES');

describe('Test EncryptionMiddleware', () => {
    const password = 'mw-test';
    describe('basics tests', () => {
        let broker: ServiceBroker;
        beforeEach(() => {
            broker = new ServiceBroker({ logger: false });
        });
        it('should register hooks', () => {
            const mw = middleware({ password });
            // const mw = middleware({ password });
            expect(mw.transporterSend).toBeInstanceOf(Function);
            expect(mw.transporterReceive).toBeInstanceOf(Function);
        });

        it('should be accepted by the broker', () => {
            const mw = middleware({ password });
            broker.middlewares.add(mw);
        });

        it('should do creation', async () => {
            const mw = middleware({ password });
            // @ts-ignore
            mw.created.bind(broker)();
        });

        it('should pass options to middleware', async () => {
            const options: encryptionMiddlewareOptions = { password: 'fooBar', algorithm: 'algorithm', IVLength: 125, IVPosition: 1 };
            const mw = middleware(options);
            // @ts-ignore
            mw.created.bind(broker)();

            expect(AEStransmitMiddleware).toBeCalledWith(expect.anything(), expect.objectContaining(options));
        });
    });

    describe('functions test', () => {
        let broker: ServiceBroker;
        let currentMiddleware: Middleware & {
            transporterSend: (handler: CallMiddlewareHandler) => CallMiddlewareHandler;
            transporterReceive: (handler: CallMiddlewareHandler) => CallMiddlewareHandler;
        };
        beforeEach(() => {
            broker = new ServiceBroker({ logger: false });
            // @ts-ignore
            currentMiddleware = middleware({ password });
            // @ts-ignore
            currentMiddleware.created.bind(broker)();
        });

        it('should call the encrypt function', async () => {
            const nextFunction = jest.fn();

            const send = await currentMiddleware.transporterSend(nextFunction);

            //retrieve the internal function
            const data = 'data';
            await send('topic', Buffer.from(data), {});

            const dataPassedToEncrypt: Buffer = (AEStransmitMiddleware.prototype.encrypt as jest.Mock).mock.calls[0][0];
            expect(dataPassedToEncrypt).toBeInstanceOf(Buffer);
            expect(dataPassedToEncrypt.toString()).toBe(data);
        });
    });

    // it('should keep same data with encrypt/decrypt', () => {
    //     // const mw = middleware({ password });
    //     const meta = {};
    //     const sendNext = jest.fn();
    //     const receiveNext = jest.fn();
    //     // @ts-ignore
    //     const send = mw.transporterSend(sendNext);
    //     // @ts-ignore
    //     const receive = mw.transporterReceive(receiveNext);
    //
    //     const testString = 'moleculer';
    //
    //     send('topic', Buffer.from(testString), meta);
    //
    //     const sendBuffer = sendNext.mock.calls[0][1];
    //
    //     receive('topic', sendBuffer, meta);
    //
    //     const receiveBuffer = receiveNext.mock.calls[0][1];
    //
    //     expect(receiveBuffer.toString()).toBe(testString);
    //
    //     // expect(sendNext).toHaveBeenCalledTimes(1);
    //     // expect(sendNext).toHaveBeenCalledWith("topic", expect.any(Buffer), meta);
    // });

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

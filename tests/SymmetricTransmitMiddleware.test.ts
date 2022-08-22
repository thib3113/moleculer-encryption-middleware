import { Buffer } from 'buffer';
import { ServiceBroker } from 'moleculer';
import { SymmetricTransmitMiddleware } from '../src';
import * as crypto from 'crypto';

jest.mock('crypto');

describe('Test SymmetricTransmitMiddleware', () => {
    let mockCrypto: jest.Mocked<typeof crypto>;
    // let cipherMock: {
    //     update: jest.Mock;
    //     final: jest.Mock;
    // };
    beforeEach(() => {
        // const cipherMock = {
        //     update: jest.fn().mockImplementation(() => Buffer.from('')),
        //     final: jest.fn().mockImplementation(() => Buffer.from(''))
        // };
        mockCrypto = crypto as jest.Mocked<typeof crypto>;
        mockCrypto.getCiphers.mockImplementation(() => ['aes-256-cbc', 'aes-256-ccm']);
        // @ts-ignore
        mockCrypto.createHash.mockImplementation((...args) => jest.requireActual('crypto').createHash(...args));
        // @ts-ignore
        mockCrypto.createCipheriv.mockImplementation((...args) => jest.requireActual('crypto').createCipheriv(...args));
        // @ts-ignore
        mockCrypto.createDecipheriv.mockImplementation((...args) => jest.requireActual('crypto').createDecipheriv(...args));
        mockCrypto.randomBytes.mockImplementation((...args) => jest.requireActual('crypto').randomBytes(...args));
    });

    const broker = new ServiceBroker({ logger: false });
    const password = 'my-super-password';
    const bufferPassword = jest.requireActual('crypto').createHash('sha256').update(password).digest();

    it('should export function', () => {
        const mw = new SymmetricTransmitMiddleware(broker.logger, { password });
        expect(mw.encrypt).toBeInstanceOf(Function);
        expect(mw.decrypt).toBeInstanceOf(Function);
    });

    describe('test errors', () => {
        const options = { password: Buffer.from(password) };
        it('should throw error if no password is provided', () => {
            expect.assertions(4);
            try {
                // @ts-ignore
                new SymmetricTransmitMiddleware(broker.logger, { password: undefined });
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect((e as Error).message).toBe('You must set a password for encryption');
            }
            try {
                new SymmetricTransmitMiddleware(broker.logger, { password: Buffer.from('') });
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect((e as Error).message).toBe('You must set a password for encryption');
            }
        });
        it("should throw error if no cipher doesn't exist is provided", () => {
            expect.assertions(2);

            try {
                // @ts-ignore
                new SymmetricTransmitMiddleware(broker.logger, { ...options, algorithm: 'tutu' });
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect((e as Error).message).toBe("The algorithm 'tutu' is not supported.");
            }
        });
        it('should throw error if fail to get IVLength', () => {
            expect.assertions(2);

            // @ts-ignore
            mockCrypto.getCipherInfo = null;
            try {
                // @ts-ignore
                new SymmetricTransmitMiddleware(broker.logger, { ...options, IVLength: 0 });
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect((e as Error).message).toBe(
                    'Impossible to retrieve IVLength automatically . You must set an IVLength for encryption'
                );
            }
        });
        it('should throw error if fail encrypt/decrypt', () => {
            expect.assertions(2);

            try {
                // @ts-ignore
                new SymmetricTransmitMiddleware(broker.logger, { ...options, IVLength: 0 });
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect((e as Error).message).toBe(
                    'Impossible to retrieve IVLength automatically . You must set an IVLength for encryption'
                );
            }
        });
        describe('test getCipherInfo', () => {
            // TODO need node 16 to test it
        });
    });

    describe('test functions', () => {
        let mw: SymmetricTransmitMiddleware;
        beforeEach(() => {
            mw = new SymmetricTransmitMiddleware(broker.logger, { password });
        });
        it('should encrypt', () => {
            const r = mw.encrypt(Buffer.from('moleculer'));
            console.log(r);
        });
    });

    describe('test encryption', () => {
        describe('test encrypt/decrypt', () => {
            it('should encrypt/decrypt with a password', () => {
                const mw = new SymmetricTransmitMiddleware(broker.logger, { password }, true);

                const testString = 'moleculer';
                const testBuffer = Buffer.from(testString);

                const encryptedBuffer = mw.encrypt(testBuffer);
                const encryptedBuffer2 = mw.encrypt(testBuffer);

                expect(encryptedBuffer.toString()).not.toBe(testString);

                const decryptedBuffer = mw.decrypt(encryptedBuffer);
                expect(decryptedBuffer.toString()).toBe(testString);

                expect(encryptedBuffer2.toString()).not.toBe(encryptedBuffer.toString());
            });
            it('should encrypt/decrypt with a password a really small string', () => {
                const mw = new SymmetricTransmitMiddleware(broker.logger, { password, IVPosition: 2 }, true);

                const testString = 'm';
                const testBuffer = Buffer.from(testString);

                const encryptedBuffer = mw.encrypt(testBuffer);
                // const encryptedBuffer2 = mw.encrypt(testBuffer);

                expect(encryptedBuffer.toString()).not.toBe(testString);

                const decryptedBuffer = mw.decrypt(encryptedBuffer);
                expect(decryptedBuffer.toString()).toBe(testString);

                // expect(encryptedBuffer2.toString()).not.toBe(encryptedBuffer.toString());
            });
            it('should encrypt/decrypt with a buffer', () => {
                const mw = new SymmetricTransmitMiddleware(broker.logger, { password: bufferPassword }, true);

                const testString = 'moleculer';
                const testBuffer = Buffer.from(testString);

                const encryptedBuffer = mw.encrypt(testBuffer);
                const encryptedBuffer2 = mw.encrypt(testBuffer);

                expect(encryptedBuffer.toString()).not.toBe(testString);

                const decryptedBuffer = mw.decrypt(encryptedBuffer);
                expect(decryptedBuffer.toString()).toBe(testString);

                expect(encryptedBuffer2.toString()).not.toBe(encryptedBuffer.toString());
            });
            // it('should encrypt/decrypt with a password and custom algorithm', () => {
            //     // The authentication tag length must be specified during cipher creation by setting the authTagLength option and must be one of 4, 6, 8, 10, 12, 14 or 16 bytes.
            //     const mw = new SymmetricTransmitMiddleware(
            //         broker.logger,
            //         { password: bufferPassword, algorithm: 'aes-256-ccm', IVLength: 13, cipherOptions: { authTagLength: 16 } },
            //         true
            //     );
            //
            //     const testString = 'moleculer';
            //     const testBuffer = Buffer.from(testString);
            //
            //     const encryptedBuffer = mw.encrypt(testBuffer);
            //     const encryptedBuffer2 = mw.encrypt(testBuffer);
            //
            //     expect(encryptedBuffer.toString()).not.toBe(testString);
            //
            //     const decryptedBuffer = mw.decrypt(encryptedBuffer);
            //     expect(decryptedBuffer.toString()).toBe(testString);
            //
            //     expect(encryptedBuffer2.toString()).not.toBe(encryptedBuffer.toString());
            // });
        });
    });
});

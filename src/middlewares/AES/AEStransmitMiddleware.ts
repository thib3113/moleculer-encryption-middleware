import Moleculer from 'moleculer';
import crypto from 'crypto';
import { EncryptionMiddleware } from '../../Interfaces/EncryptionMiddleware';
import { IAESTransmitMiddlewareOptionalOptions } from './IAESTransmitMiddlewareOptionalOptions';
import { IAESTransmitMiddlewareMandatoryOptions } from './IAESTransmitMiddlewareMandatoryOptions';
import { IAESTransmitMiddlewareOptions } from './IAESTransmitMiddlewareOptions';
import MoleculerError = Moleculer.Errors.MoleculerError;

const _privateMap = new WeakMap();

const defaultOptions: IAESTransmitMiddlewareOptionalOptions = {
    algorithm: 'aes-256-cbc',
    IVPosition: 4,
    IVLength: 16
};

export class AEStransmitMiddleware implements EncryptionMiddleware {
    private logger: Moleculer.LoggerInstance;
    get encryptionKey(): Buffer {
        return this.getPrivate<Buffer>('encryptionKey');
    }

    set encryptionKey(value: Buffer) {
        this.setPrivate<Buffer>('encryptionKey', value);
    }
    private readonly algorithm: string;
    private readonly IVPosition: number;
    private readonly IVLength: number;
    constructor(logger: Moleculer.LoggerInstance, options: IAESTransmitMiddlewareOptions) {
        this.logger = logger;
        const { password, IVPosition, IVLength, algorithm } = { ...defaultOptions, ...options } as IAESTransmitMiddlewareMandatoryOptions &
            IAESTransmitMiddlewareOptionalOptions;

        this.encryptionKey = typeof password === 'string' ? crypto.createHash('sha256').update(password).digest() : password;

        if (!this.encryptionKey || this.encryptionKey.length === 0) {
            throw new MoleculerError('You must set a password for encryption');
        }

        const currentCipher = crypto.getCiphers().find((c) => c === algorithm);
        if (!currentCipher) {
            throw new MoleculerError(`The algorithm '${algorithm}' is not supported.`);
        }

        let calculatedIVLength: number = 0;
        // crypto.getCipherInfo only available in node v15+
        if (crypto.getCipherInfo) {
            const cipherInfos = crypto.getCipherInfo(currentCipher);
            if (cipherInfos) {
                if (this.encryptionKey.byteLength < cipherInfos.keyLength) {
                    throw new MoleculerError(
                        `The key is too short. The key need to contain ${cipherInfos.keyLength} bytes. (${this.encryptionKey.byteLength} bytes actually)`
                    );
                }
                if (cipherInfos.ivLength && IVLength < cipherInfos.ivLength) {
                    throw new MoleculerError(
                        `The IVLength is too short. The key need to contain ${cipherInfos.ivLength} bytes. (${IVLength} actually)`
                    );
                }
                calculatedIVLength = cipherInfos.ivLength || 0;
            }
        }

        this.algorithm = algorithm;
        this.IVPosition = IVPosition;
        if (!IVLength && !calculatedIVLength) {
            throw new MoleculerError('Impossible to retrieve IVLength automatically . You must set an IVLength for encryption');
        }
        this.IVLength = IVLength || calculatedIVLength;

        //do an encryption test (depends on the computer running the script)
        try {
            const testString = 'moleculer';
            if (this.decrypt(this.encrypt(Buffer.from(testString))).toString() !== testString) {
                throw new MoleculerError('Fail to encrypt/decrypt and get the same string');
            }
        } catch (e) {
            throw new MoleculerError(`Encryption test failed : ${(e as Error).message}`);
        }
    }

    public encrypt(data: Buffer): Buffer {
        const iv = crypto.randomBytes(this.IVLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
        return this.insertIV(Buffer.concat([cipher.update(data), cipher.final()]), iv);
    }

    public decrypt(message: Buffer): Buffer {
        const [iv, data] = this.extractIV(message);
        const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
        return Buffer.concat([decipher.update(data), decipher.final()]);
    }

    private insertIV(data: Buffer, iv: Buffer): Buffer {
        const position = this.getIVPosition(data);
        const dataArray = Array.from(data);
        iv.forEach((byte, index) => {
            dataArray.splice(position + index, 0, byte);
        });
        return Buffer.from(dataArray);
    }

    private extractIV(data: Buffer): [Buffer, Buffer] {
        const position = this.getIVPosition(data);
        const dataArray = Array.from(data);
        const IV = dataArray.splice(position, this.IVLength);

        return [IV, dataArray].map((array) => Buffer.from(array)) as [Buffer, Buffer];
    }

    private getIVPosition(data: Buffer): number {
        return this.IVPosition < data.byteLength ? this.IVPosition : data.byteLength - 1;
    }

    public getAlgorithm(): string {
        return this.algorithm;
    }

    /**
     * @typeParam T - the type retrieve.
     * @param key - the key to retrieve
     */
    private getPrivate<T>(key: string): T {
        const privateDatas = this.privateMap.get(this);
        return privateDatas[key];
    }

    /**
     * @typeParam T - the type to set.
     * @param key - the key to set
     * @param value - the value
     */
    private setPrivate<T>(key: string, value: T): void {
        const privateDatas = this.privateMap.get(this) || {};
        privateDatas[key] = value;
        this.privateMap.set(this, privateDatas);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private get privateMap(): WeakMap<any, any> {
        return _privateMap;
    }
}

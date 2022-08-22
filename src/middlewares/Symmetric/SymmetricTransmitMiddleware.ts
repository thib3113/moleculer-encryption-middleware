import Moleculer from 'moleculer';
import crypto, { CipherCCMOptions, CipherGCMOptions, CipherOCBOptions } from 'crypto';
import { EncryptionMiddleware } from '../../Interfaces/EncryptionMiddleware';
import { ISymmetricTransmitMiddlewareOptionalOptions } from './ISymmetricTransmitMiddlewareOptionalOptions';
import { ISymmetricTransmitMiddlewareMandatoryOptions } from './ISymmetricTransmitMiddlewareMandatoryOptions';
import { ISymmetricTransmitMiddlewareOptions } from './ISymmetricTransmitMiddlewareOptions';
import stream from 'node:stream';
import MoleculerError = Moleculer.Errors.MoleculerError;

const _privateMap = new WeakMap();

const defaultOptions: Partial<ISymmetricTransmitMiddlewareOptionalOptions> = {
    algorithm: 'aes-256-cbc',
    IVPosition: 4,
    IVLength: 16
};

export class SymmetricTransmitMiddleware implements EncryptionMiddleware {
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
    private readonly cipherOptions: CipherCCMOptions | CipherGCMOptions | CipherOCBOptions | stream.TransformOptions | undefined;
    constructor(logger: Moleculer.LoggerInstance, options: ISymmetricTransmitMiddlewareOptions, skipManualValidation: boolean = false) {
        this.logger = logger;
        const { password, IVPosition, IVLength, algorithm } = {
            ...defaultOptions,
            ...options
        } as ISymmetricTransmitMiddlewareMandatoryOptions & ISymmetricTransmitMiddlewareOptionalOptions;

        this.encryptionKey = typeof password === 'string' ? crypto.createHash('sha256').update(password).digest() : password;

        if (!this.encryptionKey || this.encryptionKey.length === 0) {
            throw new MoleculerError('You must set a password for encryption');
        }

        const currentCipher = crypto.getCiphers().find((c) => c === algorithm);
        if (!currentCipher) {
            console.warn(`The algorithm '${algorithm}' is not supported.`);
        }

        this.algorithm = algorithm;
        this.IVPosition = ~~IVPosition;
        this.IVLength = ~~IVLength;
        this.cipherOptions = options.cipherOptions;

        //bad way to do ... but it's a nightmare to tests
        if (!skipManualValidation) {
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
    }

    public encrypt(data: Buffer): Buffer {
        const iv = crypto.randomBytes(this.IVLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv, this.cipherOptions);
        return this.insertIV(Buffer.concat([cipher.update(data), cipher.final()]), iv);
    }

    public decrypt(message: Buffer): Buffer {
        const [iv, data] = this.extractIV(message);
        const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv, this.cipherOptions);
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
        return this.IVPosition < data.byteLength ? this.IVPosition : 1;
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

import { CipherCCMOptions, CipherGCMOptions, CipherOCBOptions } from 'crypto';
import stream from 'node:stream';

export interface ISymmetricTransmitMiddlewareOptionalOptions {
    algorithm: string;
    IVPosition: number;
    IVLength: number;
    cipherOptions: CipherCCMOptions | CipherGCMOptions | CipherOCBOptions | stream.TransformOptions;
}

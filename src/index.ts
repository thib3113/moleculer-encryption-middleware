import { SymmetricTransmitMiddleware, ISymmetricTransmitMiddlewareOptions } from './middlewares/Symmetric';
import type { Middleware, Service } from 'moleculer';
import { EncryptionMiddleware } from './Interfaces/EncryptionMiddleware';
import Moleculer, { CallMiddlewareHandler } from 'moleculer';
import MoleculerError = Moleculer.Errors.MoleculerError;

export * from './middlewares/Symmetric';

export type encryptionMiddlewareOptions = ISymmetricTransmitMiddlewareOptions & { throwError?: boolean };

export const encryptionMiddleware = (options: encryptionMiddlewareOptions): Middleware => {
    let middleware: EncryptionMiddleware | undefined;
    let logger: Moleculer.LoggerInstance | undefined;
    return {
        // @ts-ignore
        name: 'encryptionMiddleware',

        created(this: Service) {
            logger = this.logger;
            middleware = new SymmetricTransmitMiddleware(this.logger, options);

            /* istanbul ignore next */
            this.logger.info(`The transmission is ENCRYPTED with algorithm '${middleware.getAlgorithm()}'.`);
        },

        transporterSend(next: CallMiddlewareHandler): CallMiddlewareHandler {
            return (topic, data, meta) => {
                if (!middleware) {
                    throw new MoleculerError('Something is wrong in the middleware initialization.');
                }
                return next(topic, middleware.encrypt(data), meta);
            };
        },

        transporterReceive(next: CallMiddlewareHandler): CallMiddlewareHandler {
            return (cmd, data, s) => {
                if (!middleware) {
                    throw new MoleculerError('Something is wrong in the middleware initialization.');
                }
                try {
                    return next(cmd, middleware.decrypt(data), s);
                } catch (err) {
                    (logger?.error || console.error)('Received packet decryption error.', err);
                    if (options.throwError) {
                        throw err;
                    }
                }
                return Promise.resolve();
            };
        }
    };
};

export default encryptionMiddleware;

import { ISymmetricTransmitMiddlewareMandatoryOptions } from './ISymmetricTransmitMiddlewareMandatoryOptions';
import { ISymmetricTransmitMiddlewareOptionalOptions } from './ISymmetricTransmitMiddlewareOptionalOptions';

export type ISymmetricTransmitMiddlewareOptions = ISymmetricTransmitMiddlewareMandatoryOptions &
    Partial<ISymmetricTransmitMiddlewareOptionalOptions>;

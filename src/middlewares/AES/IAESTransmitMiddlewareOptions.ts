import { IAESTransmitMiddlewareMandatoryOptions } from './IAESTransmitMiddlewareMandatoryOptions';
import { IAESTransmitMiddlewareOptionalOptions } from './IAESTransmitMiddlewareOptionalOptions';

export type IAESTransmitMiddlewareOptions = IAESTransmitMiddlewareMandatoryOptions & Partial<IAESTransmitMiddlewareOptionalOptions>;

import * as jwt from 'jsonwebtoken';
import { AuthTokenResult, IUseToken } from '../auth/interfaces/auth.interface';

export const UseToken = (token: string): IUseToken | string => {
  try {
    const decode = jwt.decode(token) as AuthTokenResult;
    const currentDate = new Date();
    const expirationDate = new Date(decode.exp);

    return {
      sub: decode.sub,
      role: decode.role,
      isExpired: +expirationDate <= +currentDate / 1000,
    };
  } catch (error) {
    return 'Token is not valid';
  }
};

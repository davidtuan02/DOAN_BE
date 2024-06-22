import * as jwt from 'jsonwebtoken';
import { IExpiration, IToken } from 'src/auth/interfaces/token.interface';

export const UseToken = (token: string): IExpiration | string => {
  try {
    const decode = jwt.decode(token) as unknown as IToken;
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

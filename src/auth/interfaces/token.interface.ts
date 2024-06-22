export interface IToken {
  role: string;
  sub: string;
  exp: string;
  iat: string;
}

export interface IExpiration {
  role: string;
  sub: string;
  isExpired: boolean;
}

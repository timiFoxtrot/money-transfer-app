export interface IUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
}

export interface IAccount {
  userId: number;
  account_number: string;
  balance: string;
}

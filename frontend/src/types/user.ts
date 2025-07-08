// src/types/user.ts
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  dob?: string ;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  gender?: string;
  parentGuardian?: string;
  startDate?: string;
  graduationDate?: string;
  roles: string[];
  avatar?: string;
  createdAt: string;
}

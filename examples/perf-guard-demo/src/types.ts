export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  city: string;
  country: string;
  phone: string;
  avatar: string;
}

export type SortKey = "name" | "age" | "country";

export type Mode = "buggy" | "optimized";

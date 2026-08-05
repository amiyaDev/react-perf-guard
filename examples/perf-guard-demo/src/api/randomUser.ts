import type { User } from "../types";

interface RandomUserApiResult {
  login: { uuid: string };
  name: { first: string; last: string };
  email: string;
  dob: { age: number };
  location: { city: string; country: string };
  phone: string;
  picture: { thumbnail: string };
}

interface RandomUserApiResponse {
  results: RandomUserApiResult[];
}

// randomuser.me — free, no API key required. Caps out around 5000 results per request.
export async function fetchUsers(count: number, seed = "perfguard"): Promise<User[]> {
  const url = `https://randomuser.me/api/?results=${count}&seed=${seed}&nat=us,gb,ca,au,de,fr&noinfo`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`randomuser.me responded with ${res.status}`);
  }

  const data: RandomUserApiResponse = await res.json();

  return data.results.map((u) => ({
    id: u.login.uuid,
    firstName: u.name.first,
    lastName: u.name.last,
    email: u.email,
    age: u.dob.age,
    city: u.location.city,
    country: u.location.country,
    phone: u.phone,
    avatar: u.picture.thumbnail,
  }));
}

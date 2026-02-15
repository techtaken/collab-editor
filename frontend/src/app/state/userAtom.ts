import { atom } from "recoil";
import { User } from '../../../../shared-types/src/lib/shared-types';

export const userAtom = atom<User | null>({
  key: "userAtom",
  default: (() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) as User : null;
  })(),
});
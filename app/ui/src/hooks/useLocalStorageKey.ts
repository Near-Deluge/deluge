import React, { useEffect, useState } from "react";

// @ts-ignore
import { generateRandomKeypair } from "deluge-helper";
// @ts-ignore
import { parseSeedPhrase } from "near-seed-phrase";

export interface ILocalStorageKey {
  publicKey: string;
  secretKey: string;
}

export const generateKeyPair = () => {
  return generateRandomKeypair();
};

export const retrieveKeyPair = (seedPhrases: string) => {
  const { publicKey, secretKey } = parseSeedPhrase(seedPhrases);
  return {
    publicKey,
    secretKey,
  };
};

const useLocalStorageKey = (): [
  KeyPair: ILocalStorageKey,
  setPublicKey: any
] => {
  const KEY_LOCAL = "deluge_shop_key";

  const [KeyPair, setKeypair] = useState<ILocalStorageKey>(() => {
    const item = localStorage.getItem(KEY_LOCAL);
    if (item !== null) {
      return JSON.parse(item);
    } else {
      return {
        publicKey: "",
        secretKey: "",
      };
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY_LOCAL, JSON.stringify(KeyPair));
  }, [KeyPair]);

  return [KeyPair, setKeypair];
};

export default useLocalStorageKey;

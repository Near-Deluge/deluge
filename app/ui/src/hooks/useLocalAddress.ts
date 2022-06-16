import React, { useEffect, useState } from "react";
import { LocalAddress } from "../utils/interface";

const useLocalAddresses = (): [
  localAddresses: Array<LocalAddress>,
  addAddress: (address: LocalAddress) => any,
  removeAddress: (id: number) => any,
  deleteAllAddresses: () => any
] => {
  const KEY_LOCAL = "deluge_addresses";

  const [localAddresses, setLocalAddresses] = useState<Array<LocalAddress>>(
    () => {
      const item = localStorage.getItem(KEY_LOCAL);
      if (item !== null) {
        return JSON.parse(item);
      } else {
        return [];
      }
    }
  );

  useEffect(() => {
    localStorage.setItem(KEY_LOCAL, JSON.stringify(localAddresses));
  }, [localAddresses]);

  const addAddress = (address: LocalAddress) => {
    setLocalAddresses([...localAddresses, address]);
  };

  const removeAddress = (idx: number) => {
    setLocalAddresses([
      ...localAddresses.filter((l, index) => {
        return index !== idx;
      }),
    ]);
  };

  const deleteAllAddress = () => {
    setLocalAddresses([]);
  };

  return [localAddresses, addAddress, removeAddress, deleteAllAddress];
};

export default useLocalAddresses;

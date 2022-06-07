import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BaseContractContext } from "..";
import { setAllStores } from "../redux/slices/store.slice";

const useGetAllStores = () => {
  const base_contract = useContext(BaseContractContext);

  const allStores = useSelector((state: any) => state.storeSlice.allStore);

  const dispatcher = useDispatch();

  useEffect(() => {
    (async () => {
      if (base_contract !== null && allStores.length === 0) {
        // @ts-ignore
        const res = await base_contract.list_stores();
        dispatcher(setAllStores(res));
      }
    })();
  }, [allStores]);

  return {};
};

export default useGetAllStores;

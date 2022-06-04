import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CIDString } from "web3.storage";
import { WebContext } from "..";
import { addToAllCids } from "../redux/slices/products.slice";

const useGetOrFetchProductCid = (cid: CIDString) => {
  const web3 = useContext(WebContext);

  const allCids = useSelector((state: any) => state.productSlice.allCids);
  const dispatcher = useDispatch();

  useEffect(() => {
    (async () => {
      // console.log(allCids);
      // if (allCids && allCids[cid] === undefined) {
      //   const instance = await web3;
      //   const res = await instance.get(cid);
      //   const files = await res?.files();
      //   if (files) {
      //     let textData = await files[0].text();
      //     let parseObject = JSON.parse(textData);
      //     console.log(parseObject)
      //     dispatcher(addToAllCids({ cid: cid, product_details: parseObject }));
      //   }
      // }
    })();
  });

  return;
};

export default useGetOrFetchProductCid;

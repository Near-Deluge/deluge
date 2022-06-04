import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Store } from '../utils/interface';

const useIsAUserProduct = (productId: any) => {

    const allProducts  = useSelector((state: any) => state.productSlice.allProducts);
    const allStores = useSelector((state: any) => state.storeSlice.allStore);



    useEffect(() => {
        allStores.map((store: Store) => {
            let res = store.products.filter((pid) => pid === productId);
            if(res.length > 0) {
                console.log("yes")
            } else {
                console.log("no")
            }
        })    
    }, [allProducts])

  return {}
}

export default useIsAUserProduct
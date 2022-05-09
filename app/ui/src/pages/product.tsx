import { Paper } from "@mui/material";
import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useParams } from "react-router-dom";
import { CIDString } from "web3.storage";
import { initProductStorage } from "../components/products/addProduct";
import { Product as IProduct, Product_Storage } from "../utils/interface";
import { WebContext } from "../index";
import { addOneCidUserDetails } from "../redux/slices/products.slice";

const Product = () => {
  const { cid } = useParams();
  const dispatcher = useDispatch();
  const instance = useContext(WebContext);

  const userProducts = useSelector(
    (state: any) => state.productSlice.userProducts
  );
  const userCidDetails = useSelector(
    (state: any) => state.productSlice.user_cid_details
  );

  const [currentProduct, setCurrentProduct] = React.useState<Product_Storage>({
    ...initProductStorage,
  });

  const fetch_product = async (cid: CIDString) => {
      const inst = await instance;
      const res = await inst.get(cid);
      const files = await res?.files();
      if (files) {
        let textData = await files[0].text();
        let parseObject = JSON.parse(textData);
        dispatcher(addOneCidUserDetails(parseObject));
      }
  };

  React.useEffect(() => {
    let product = userProducts.filter((item: IProduct) => item.cid === cid)[0];
    let productCidDetails = userCidDetails.filter(
      (item: Product_Storage) => item.product_id === product.pid
    );
    
    if (productCidDetails.length > 0) {
      setCurrentProduct(productCidDetails[0]);
    } else {
      fetch_product(cid as CIDString);
    }
  }, [userCidDetails]);
  
  return <Paper>{JSON.stringify(currentProduct)}</Paper>;
};

export default Product;

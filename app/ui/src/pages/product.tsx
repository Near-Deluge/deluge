import {
  Chip,
  Divider,
  Paper,
  Typography,
  Box,
  Button,
  ImageList,
  ImageListItem,
  Grid,
  IconButton,
  CircularProgress,
} from "@mui/material";
import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useParams, Link, useNavigate } from "react-router-dom";
import { CIDString } from "web3.storage";
import {
  initProductStorage,
  get_symbol_from_unit,
} from "../components/products/addProduct";
import {
  Product as IProduct,
  Product_Storage,
  Store,
} from "../utils/interface";
import { StorageContext, WalletConnectionContext, WebContext } from "../index";
import {
  addOneCidAllUserDetails,
  addOneCidUserDetails,
} from "../redux/slices/products.slice";
import { ArrowLeft, Close, ShoppingBag } from "@mui/icons-material";

import { BaseContractContext } from "../index";
import { addItem, removeItem } from "../redux/slices/cart.slice";
import { useSnackbar } from "notistack";
import Ratings from "../components/ratings";
import useProductIsInCart from "../hooks/useProductIsInCart";

import isIPFS from "is-ipfs";

export const initProductBC: IProduct = {
  pid: "",
  cid: "",
  inventory: 0,
  name: "",
  media: "",
  price: "",
};

type IPaddedDividerSpacer = {
  v_m?: Number;
  h_m?: Number;
};

export const PaddedDividerSpacer: React.FC<IPaddedDividerSpacer> = ({
  v_m,
  h_m,
}) => {
  let marg_str = "";
  if (v_m !== undefined) {
    marg_str += v_m + "px ";
  } else {
    marg_str += "10px ";
  }
  if (h_m !== undefined) {
    marg_str += h_m + "px";
  } else {
    marg_str += "0px";
  }
  return <Divider sx={{ margin: marg_str }} />;
};

// This is a Individual Product View.
// User can update, delete or add this product to cart

const Product = () => {
  const { cid } = useParams();
  const dispatcher = useDispatch();
  const instance = useContext(WebContext);
  const navigation = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const base_contract = useContext(BaseContractContext);
  const walletConnection = useContext(WalletConnectionContext);

  const allStore = useSelector((state: any) => state.storeSlice.allStore);

  const getShopIdFromProductID = (productId: string): string => {
    let fStoreId = "";
    allStore &&
      allStore.forEach((store: Store) => {
        let res = store.products.filter((ipid) => ipid === productId);
        if (res.length > 0) {
          fStoreId = store.id.toString();
        }
      });
    return fStoreId;
  };

  const handleAddCartProduct = (item: IProduct) => {
    allStore.map((store: Store) => {
      let res = store.products.filter((ipid) => ipid === item.pid);
      if (res.length > 0) {
        dispatcher(addItem({ product: item, store: store, qty: 1 }));
        enqueueSnackbar(`Product ${item.name} Added to Cart.`, {
          variant: "success",
        });
      }
    });
  };

  const handleRemoveItem = (pid: string) => {
    if (isInCart && orderId.length > 0) {
      dispatcher(
        removeItem({
          orderId: orderId,
          productId: currentProductBC.pid,
        })
      );
      enqueueSnackbar(`Successfully Removed Item from Cart.`, {
        variant: "success",
      });
    } else {
      enqueueSnackbar(`Some Error Occured !`, {
        variant: "error",
      });
    }
  };

  const userProducts = useSelector(
    (state: any) => state.productSlice.userProducts
  );
  const userCidDetails = useSelector(
    (state: any) => state.productSlice.user_cid_details
  );
  const allProducts = useSelector(
    (state: any) => state.productSlice.allProducts
  );
  const allCidDetails = useSelector(
    (state: any) => state.productSlice.all_cid_details
  );

  const [currentProduct, setCurrentProduct] = React.useState<Product_Storage>({
    ...initProductStorage,
  });

  const [currentProductBC, setCurrentProductBC] = React.useState<IProduct>({
    ...initProductBC,
  });

  const [isUserProd, setIsUserProd] = React.useState(false);

  // This fetches a cid from ipfs and dispatch action to the global state in redux
  const fetch_product = async (cid: CIDString) => {
    const inst = await instance;
    const res = await inst.get(cid);
    const files = await res?.files();
    if (files) {
      let textData = await files[0].text();
      let parseObject = JSON.parse(textData);
      dispatcher(addOneCidUserDetails(parseObject));
      enqueueSnackbar("Product Details Successfully Fetched from IPFS.", {
        variant: "info",
      });
    }
  };

  const fetch_product_non_owned = async (cid: CIDString) => {
    const inst = await instance;
    const res = await inst.get(cid);
    const files = await res?.files();
    if (files) {
      let textData = await files[0].text();
      let parseObject = JSON.parse(textData);
      dispatcher(addOneCidAllUserDetails(parseObject));
      enqueueSnackbar("Product Details Successfully Fetched from IPFS.", {
        variant: "info",
      });
    }
  };

  React.useEffect(() => {
    let product = userProducts.filter((item: IProduct) => item.cid === cid)[0];
    if (product) {
      setCurrentProductBC({ ...product });
      let productCidDetails = userCidDetails.filter(
        (item: Product_Storage) => item.product_id === product.pid
      );

      if (productCidDetails.length > 0) {
        setCurrentProduct(productCidDetails[0]);
      } else {
        fetch_product(cid as CIDString);
      }
      setIsUserProd(true);
    } else {
      // If Product is not found, search it here
      setIsUserProd(false);
      let product = allProducts.filter((item: IProduct) => item.cid === cid)[0];

      if (product) {
        setCurrentProductBC({ ...product });
        let productCidDetails = allCidDetails.filter(
          (item: Product_Storage) => item.product_id === product.pid
        );

        if (productCidDetails.length > 0) {
          setCurrentProduct(productCidDetails[0]);
        } else {
          fetch_product_non_owned(cid as CIDString);
        }
      }
    }
  }, [userCidDetails]);

  const handleDeleteProduct = async () => {
    console.log(base_contract);
    try {
      const params = {
        pid: currentProductBC.pid,
        store_id: walletConnection?.getAccountId(),
      };

      console.log(params);
      //@ts-ignore
      const res = await base_contract.delete_product({
        args: { ...params },
        amount: "0",
        meta: "delete_product",
      });
      enqueueSnackbar("Product deleted from your store.", {
        variant: "warning",
      });
      console.log(res);
    } catch (e) {
      console.log(e);
      enqueueSnackbar("Some error Occured Check the logs.", {
        variant: "error",
      });
    }
  };

  const { isInCart, orderId } = useProductIsInCart(
    currentProductBC.pid,
    getShopIdFromProductID(currentProductBC.pid)
  );

  const storageContext = useContext(StorageContext);

  const parseImageLink = async (link: string, index: number) => {
    if (isIPFS.cid(link)) {
      const value = await storageContext.getFirstFile(link);
      if (value) {
        let ObjLink = URL.createObjectURL(value);
        let oldImgArr = currentProduct.images.map((item, i) => {
          if (i === index) {
            return ObjLink;
          } else {
            return item;
          }
        });
        setCurrentProduct({
          ...currentProduct,
          images: [...oldImgArr],
        });
      }
    }
  };

  const parseVideoLink = async (link: string, index: number) => {
    if (isIPFS.cid(link)) {
      const value = await storageContext.getFirstFile(link);
      if (value) {
        let ObjLink = URL.createObjectURL(value);
        let oldImgArr = currentProduct.videos.map((item, i) => {
          if (i === index) {
            return ObjLink;
          } else {
            return item;
          }
        });
        setCurrentProduct({
          ...currentProduct,
          videos: [...oldImgArr],
        });
      }
    }
  };

  return (
    <Paper sx={{ padding: "20px" }}>
      <Box display={"flex"}>
        <IconButton
          onClick={() => {
            navigation(-1);
          }}
          sx={{
            marginRight: "20px",
          }}
        >
          <ArrowLeft />
        </IconButton>
      </Box>
      <Typography variant="h3" gutterBottom textAlign={"center"}>
        {currentProduct.name}
      </Typography>
      <Typography textAlign={"center"}>{currentProduct.description}</Typography>
      <Grid container>
        <Grid item xs={12} sm={6} padding="10px">
          <Paper>
            <ImageList
              sx={{ height: 450 }}
              cols={3}
              rowHeight={164}
              variant="woven"
            >
              {currentProduct.images.map((img, index) => {
                parseImageLink(img, index);
                return (
                  <ImageListItem key={`${img}${index}`}>
                    <img
                      src={img}
                      alt={currentProduct.name.toString()}
                      loading="lazy"
                    />
                  </ImageListItem>
                );
              })}
            </ImageList>
          </Paper>
          <PaddedDividerSpacer v_m={20} />
          <Paper>
            <ImageList
              sx={{ height: 450 }}
              cols={3}
              rowHeight={164}
              variant="woven"
            >
              {currentProduct.videos.map((video, index) => {
                parseVideoLink(video, index);
                return <video key={`${video}${index}`} src={video} />;
              })}
            </ImageList>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} padding="20px 10px">
          <Typography>{`Items Left: ${currentProductBC.inventory}`}</Typography>
          <Typography>{`Price: ${
            parseInt(currentProductBC.price) / 10 ** 8
          } DLG`}</Typography>
          <PaddedDividerSpacer v_m={15} />
          <Typography>{`Product ID: ${currentProduct.product_id}`}</Typography>
          <Typography>{`Brand: ${currentProduct.brand}`}</Typography>
          <Box>
            <Typography>Categories</Typography>
            {currentProduct.category.map((category, index) => {
              return (
                <Chip
                  label={category}
                  key={`${category}${index}`}
                  color="secondary"
                  sx={{ margin: "5px" }}
                ></Chip>
              );
            })}
          </Box>
          <Typography>Physical Details</Typography>
          <Box>
            <Typography>{`Length: ${
              currentProduct.physical_details.dimensions.l
            } ${get_symbol_from_unit(
              currentProduct.physical_details.dimensions.unit
            )}`}</Typography>
            <Typography>{`Width:  ${
              currentProduct.physical_details.dimensions.w
            } ${get_symbol_from_unit(
              currentProduct.physical_details.dimensions.unit
            )}`}</Typography>
            <Typography>{`Height:  ${
              currentProduct.physical_details.dimensions.h
            } ${get_symbol_from_unit(
              currentProduct.physical_details.dimensions.unit
            )}`}</Typography>
          </Box>
          <Typography>Size: {currentProduct.physical_details.size}</Typography>
          <Typography>{`Weight: ${currentProduct.physical_details.weight.value} ${currentProduct.physical_details.weight.unit}`}</Typography>
          <PaddedDividerSpacer v_m={10} />
          <Typography>{`Where to use this product: ${currentProduct.usecase}`}</Typography>
          <Typography>{`Expected Delivery Time: ${currentProduct.expected_delivery}`}</Typography>

          <Box>
            <Typography>{`Available In`}</Typography>
            {currentProduct.available_in.map((item, index) => {
              return (
                <Chip
                  key={`${item}${index}`}
                  label={item.toString()}
                  variant="outlined"
                  color="primary"
                  sx={{ margin: "5px" }}
                />
              );
            })}
          </Box>
          <Box sx={{ margin: "10px 0px" }}>
            {isInCart ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<Close />}
                onClick={() => handleRemoveItem(currentProductBC.pid)}
              >
                Remove from Cart
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingBag />}
                onClick={() => handleAddCartProduct(currentProductBC)}
              >
                Add to Cart
              </Button>
            )}
          </Box>
          {isUserProd && (
            <Box sx={{ margin: "10px 0px" }}>
              <Button
                variant="contained"
                color="error"
                sx={{ marginRight: "10px" }}
                onClick={handleDeleteProduct}
              >
                Delete Product
              </Button>
              <Link to={`/products/${cid}/update`}>
                <Button variant="outlined" color="primary">
                  Update/Change Product Details
                </Button>
              </Link>
            </Box>
          )}
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12} margin="10px 0px ">
          <Typography textAlign={"center"} variant="h5" fontWeight={"bold"}>
            Product Reviews
          </Typography>
        </Grid>
        {currentProductBC.pid.length > 0 ? (
          <Ratings
            productId={currentProductBC.pid}
            shopId={getShopIdFromProductID(currentProductBC.pid) || ""}
          />
        ) : (
          <CircularProgress />
        )}
      </Grid>
    </Paper>
  );
};

export default Product;

import React, { useContext, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { CIDString } from "web3.storage/dist/src/lib/interface";
import { BaseContractContext, WalletConnectionContext, WebContext } from "..";
import {
  initProductStorage,
  length_unit,
  size,
  weight_unit,
} from "../components/products/addProduct";
import { addOneCidUserDetails } from "../redux/slices/products.slice";
import { Product_Storage, Product as IProduct } from "../utils/interface";
import { initProductBC } from "./product";

import BN from "big.js";

import {
  Typography,
  Container,
  Button,
  Divider,
  TextField,
  Paper,
  Chip,
  InputAdornment,
  MenuItem,
  CircularProgress,
  IconButton
} from "@mui/material";
import { Box } from "@mui/system";
import InventoryIcon from "@mui/icons-material/Inventory";
import { ArrowLeft, ArrowLeftOutlined } from "@mui/icons-material";

const UpdateProduct = () => {
  const { cid } = useParams();
  const navigation = useNavigate();
  const dispatcher = useDispatch();

  const web3Instance = useContext(WebContext);

  const base_contract = useContext(BaseContractContext);
  const walletConnection = useContext(WalletConnectionContext);

  const userProducts = useSelector(
    (state: any) => state.productSlice.userProducts
  );
  const userCidDetails = useSelector(
    (state: any) => state.productSlice.user_cid_details
  );

  // Progress Loading
  const [loading, setLoading] = React.useState(false);

  const [currentProduct, setCurrentProduct] = React.useState<Product_Storage>({
    ...initProductStorage,
  });

  const [currentProductBC, setCurrentProductBC] = React.useState<IProduct>({
    ...initProductBC,
  });

  // This fetches a cid from ipfs and dispatch action to the global state in redux
  const fetch_product = async (cid: CIDString) => {
    const inst = await web3Instance;
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
    if (product) {
      setCurrentProductBC({
        ...product,
        price: parseFloat((product.price / 10 ** 8).toString()),
      });
      let productCidDetails = userCidDetails.filter(
        (item: Product_Storage) => item.product_id === product.pid
      );

      if (productCidDetails.length > 0) {
        setCurrentProduct(productCidDetails[0]);
      } else {
        fetch_product(cid as CIDString);
      }
    } else {
      // If Product is not found in user, redirect to store page
      navigation("/store", { replace: true });
    }
  }, [userCidDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentProduct({
      ...currentProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleBCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentProductBC({
      ...currentProductBC,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryDelete = (item: String) => {
    const newList = currentProduct.category.filter((val) => val !== item);
    setCurrentProduct({
      ...currentProduct,
      category: [...newList],
    });
  };

  const handleCategoryAdd = (item: String) => {
    if (item.length > 3) {
      setCurrentProduct({
        ...currentProduct,
        category: [item, ...currentProduct.category],
      });
    }
  };

  const handleImageDelete = (item: String) => {
    const newList = currentProduct.images.filter((val) => val !== item);
    setCurrentProduct({
      ...currentProduct,
      images: [...newList],
    });
  };

  const handleImageAdd = (item: String) => {
    if (item.length > 3) {
      setCurrentProduct({
        ...currentProduct,
        images: [item, ...currentProduct.images],
      });
    }
  };

  const handleVideoDelete = (item: String) => {
    const newList = currentProduct.videos.filter((val) => val !== item);
    setCurrentProduct({
      ...currentProduct,
      videos: [...newList],
    });
  };

  const handleVideoAdd = (item: String) => {
    if (item.length > 3) {
      setCurrentProduct({
        ...currentProduct,
        videos: [item, ...currentProduct.videos],
      });
    }
  };

  const handleCountryDelete = (item: String) => {
    const newList = currentProduct.available_in.filter((val) => val !== item);
    setCurrentProduct({
      ...currentProduct,
      available_in: [...newList],
    });
  };

  const handleCountryAdd = (item: String) => {
    if (item.length > 1) {
      setCurrentProduct({
        ...currentProduct,
        available_in: [item, ...currentProduct.available_in],
      });
    }
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentProduct({
      ...currentProduct,
      physical_details: {
        ...currentProduct.physical_details,
        dimensions: {
          ...currentProduct.physical_details.dimensions,
          [e.target.name]: parseFloat(e.target.value),
        },
      },
    });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      let file = new File([JSON.stringify(currentProduct)], "deluge.txt");
      let instance = await web3Instance;
      let cid = await instance.put([file]);

      console.log("File Uploaded to IPFS with ID: ", cid);

      const finalBCProd = {
        ...currentProductBC,
        name: currentProduct.name,
        pid: currentProduct.product_id,
        cid: cid,
        inventory: currentProductBC.inventory.toString(),
        // Since Precision of DLGT is 8 Decimals, Multiply it to the same.
        price: new BN(currentProductBC.price.toString())
          .mul(10 ** 8)
          .toFixed()
          .toString(),
      };

      console.log(finalBCProd);
      //@ts-ignore
      const res = await base_contract.update_product({
        args: {
          ...finalBCProd,
          pid: finalBCProd.pid,
          store_id: walletConnection?.getAccountId(),
        },
        amount: "0",
        meta: "update_product",
      });
      console.log(res);
      navigation(`/products/${cid}/update`, { replace: true });
      setLoading(false);
    } catch (e) {
      console.log(e);
      alert(e);
      setLoading(false);
      return;
    }
  };

  // I/P refereces
  const categoryIPRef = useRef<HTMLInputElement>(null);
  const imagesIPRef = useRef<HTMLInputElement>(null);
  const videosIPRef = useRef<HTMLInputElement>(null);
  const countriesIPRef = useRef<HTMLInputElement>(null);

  return (
    <Paper elevation={2} sx={{ margin: "10px 0px", padding: "10px" }}>
      <IconButton
        onClick={() => {
          navigation(-1);
        }}
      >
        <ArrowLeft />
      </IconButton>
      <Typography variant="h4" textAlign={"center"} gutterBottom>
        <InventoryIcon fontSize="large" />
        Update your product
      </Typography>
      <TextField
        name="name"
        value={currentProduct.name}
        onChange={handleChange}
        label="Name"
        required
        fullWidth
      />
      <Divider sx={{ margin: "20px 0px" }} />
      <TextField
        name="product_id"
        value={currentProduct.product_id}
        onChange={handleChange}
        disabled
        label="Product ID"
        fullWidth
        sx={{
          marginBottom: "10px",
        }}
      />
      <TextField
        name="description"
        value={currentProduct.description}
        onChange={handleChange}
        required
        label="Description"
        fullWidth
        sx={{
          marginBottom: "10px",
        }}
      />
      <TextField
        name="brand"
        value={currentProduct.brand}
        onChange={handleChange}
        required
        label="Brand"
        fullWidth
        sx={{
          marginBottom: "10px",
        }}
      />
      <Divider sx={{ margin: "20px 0px" }} />
      <Box>
        {currentProduct.category.map((item, index) => {
          return (
            <Chip
              key={item + index.toString()}
              label={item}
              onDelete={() => {
                handleCategoryDelete(item);
              }}
            />
          );
        })}
      </Box>
      <Box display={"flex"} alignItems="center">
        <TextField
          name="category"
          label="Add Category"
          helperText="Add Categoy to which this product belongs, e.g Apparel, etc. Min Length: 3 Chars"
          sx={{
            marginTop: "10px",
          }}
          inputRef={categoryIPRef}
          onKeyDown={(e: any) => {
            if (e.keyCode === 13) {
              if (null !== categoryIPRef.current) {
                handleCategoryAdd(categoryIPRef.current.value);
                categoryIPRef.current.value = "";
              }
            }
          }}
        />
        <Button
          onClick={() => {
            if (null !== categoryIPRef.current) {
              handleCategoryAdd(categoryIPRef.current.value);
              categoryIPRef.current.value = "";
            }
          }}
        >
          Add Category
        </Button>
      </Box>
      <Divider sx={{ margin: "20px 0px" }} />
      <Typography variant="h6">Physical Dimensions</Typography>
      <Box
        display={"flex"}
        alignItems="center"
        flexWrap={"wrap"}
        padding="10px 0px"
      >
        <TextField
          id="unit"
          select
          fullWidth
          value={currentProduct.physical_details.dimensions.unit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setCurrentProduct({
              ...currentProduct,
              physical_details: {
                ...currentProduct.physical_details,
                dimensions: {
                  ...currentProduct.physical_details.dimensions,
                  unit: e.target.value,
                },
              },
            });
          }}
          label="Select Unit of Measure"
          helperText="Please select a Unit"
        >
          {length_unit.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.symbol}
            </MenuItem>
          ))}
        </TextField>
        <Box>
          <TextField
            label="Length of Product"
            id="length"
            name="l"
            value={currentProduct.physical_details.dimensions.l}
            onChange={handleDimensionChange}
            type="number"
            sx={{ m: 1, width: "25ch" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">L</InputAdornment>
              ),
            }}
          />
          <TextField
            label="Width of Product"
            id="width"
            name="w"
            value={currentProduct.physical_details.dimensions.w}
            onChange={handleDimensionChange}
            type="number"
            sx={{ m: 1, width: "25ch" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">W</InputAdornment>
              ),
            }}
          />
          <TextField
            label="Height of Product"
            id="height"
            name="h"
            value={currentProduct.physical_details.dimensions.h}
            onChange={handleDimensionChange}
            type="number"
            sx={{ m: 1, width: "25ch" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">H</InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
      <Box>
        <TextField
          id="size"
          select
          fullWidth
          value={currentProduct.physical_details.size}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setCurrentProduct({
              ...currentProduct,
              physical_details: {
                ...currentProduct.physical_details,
                size: e.target.value,
              },
            });
          }}
          label="Select a Sizing Option"
          helperText="Please select a Size"
        >
          {size.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.symbol}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Box sx={{ margin: "20px 0px" }}>
        <TextField
          id="weight"
          select
          fullWidth
          value={currentProduct.physical_details.weight.unit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setCurrentProduct({
              ...currentProduct,
              physical_details: {
                ...currentProduct.physical_details,
                weight: {
                  ...currentProduct.physical_details.weight,
                  unit: e.target.value,
                },
              },
            });
          }}
          label="Select Unit of Weight"
          helperText="Please select a Unit"
        >
          {weight_unit.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.symbol}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Weight of Product"
          id="weight"
          value={currentProduct.physical_details.weight.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setCurrentProduct({
              ...currentProduct,
              physical_details: {
                ...currentProduct.physical_details,
                weight: {
                  ...currentProduct.physical_details.weight,
                  value: parseFloat(e.target.value),
                },
              },
            });
          }}
          type="number"
          sx={{ m: 1, width: "25ch" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {currentProduct.physical_details.weight.unit}
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Divider sx={{ margin: "20px 0px" }} />
      <TextField
        name="usecase"
        value={currentProduct.usecase}
        onChange={handleChange}
        multiline
        rows={3}
        required
        label="Product Usecase"
        helperText="Explain where user can best use this product for."
        fullWidth
        sx={{
          marginBottom: "10px",
        }}
      />
      <Divider sx={{ margin: "20px 0px" }} />
      <Box>
        {currentProduct.images.map((item, index) => {
          return (
            <Chip
              key={item + index.toString()}
              label={item}
              onDelete={() => {
                handleImageDelete(item);
              }}
            />
          );
        })}
      </Box>
      <Box display={"flex"} alignItems="center">
        <TextField
          name="image"
          label="Add Image"
          helperText="Add Image URLs Here. Starts with https://..."
          sx={{
            marginTop: "10px",
          }}
          inputRef={imagesIPRef}
          onKeyDown={(e: any) => {
            if (e.keyCode === 13) {
              if (null !== imagesIPRef.current) {
                handleImageAdd(imagesIPRef.current.value);
                imagesIPRef.current.value = "";
              }
            }
          }}
        />
        <Button
          onClick={() => {
            if (null !== imagesIPRef.current) {
              handleImageAdd(imagesIPRef.current.value);
              imagesIPRef.current.value = "";
            }
          }}
        >
          Add Image
        </Button>
      </Box>
      <Divider sx={{ margin: "20px 0px" }} />
      <Box>
        {currentProduct.videos.map((item, index) => {
          return (
            <Chip
              key={item + index.toString()}
              label={item}
              onDelete={() => {
                handleVideoDelete(item);
              }}
            />
          );
        })}
      </Box>
      <Box display={"flex"} alignItems="center">
        <TextField
          name="videos"
          label="Add Video"
          helperText="Add Video URLs Here. Starts with https://..."
          sx={{
            marginTop: "10px",
          }}
          inputRef={videosIPRef}
          onKeyDown={(e: any) => {
            if (e.keyCode === 13) {
              if (null !== videosIPRef.current) {
                handleVideoAdd(videosIPRef.current.value);
                videosIPRef.current.value = "";
              }
            }
          }}
        />
        <Button
          onClick={() => {
            if (null !== videosIPRef.current) {
              handleVideoAdd(videosIPRef.current.value);
              videosIPRef.current.value = "";
            }
          }}
        >
          Add Video
        </Button>
      </Box>
      <Divider sx={{ margin: "20px 0px" }} />

      <TextField
        name="expected_delivery"
        value={currentProduct.expected_delivery}
        onChange={handleChange}
        required
        label="Expected Delivery Time"
        fullWidth
        helperText={"It can be somethign like: In 15Days, etc."}
        sx={{
          marginBottom: "10px",
        }}
      />
      <Divider sx={{ margin: "20px 0px" }} />

      <Box>
        {currentProduct.available_in.map((item, index) => {
          return (
            <Chip
              key={item + index.toString()}
              label={item}
              onDelete={() => {
                handleCountryDelete(item);
              }}
            />
          );
        })}
      </Box>
      <Box display={"flex"} alignItems="center">
        <TextField
          name="country"
          label="Add Country"
          helperText="Add Countries to which you can ship this product too."
          sx={{
            marginTop: "10px",
          }}
          inputRef={countriesIPRef}
          onKeyDown={(e: any) => {
            if (e.keyCode === 13) {
              if (null !== countriesIPRef.current) {
                handleCountryAdd(countriesIPRef.current.value);
                countriesIPRef.current.value = "";
              }
            }
          }}
        />
        <Button
          onClick={() => {
            if (null !== countriesIPRef.current) {
              handleCountryAdd(countriesIPRef.current.value);
              countriesIPRef.current.value = "";
            }
          }}
        >
          Add Country
        </Button>
      </Box>
      <Divider sx={{ margin: "20px 0px" }} />
      <TextField
        name="inventory"
        value={currentProductBC.inventory}
        onChange={handleBCChange}
        required
        label="Inventory you have in stock currently."
        fullWidth
        type={"number"}
        helperText={"It can be a number like 100, 10, etc."}
        sx={{
          marginBottom: "10px",
        }}
      />
      <TextField
        name="price"
        value={currentProductBC.price}
        onChange={handleBCChange}
        required
        label="Price of one unit of Product. (In DLG Tokens)"
        fullWidth
        type={"number"}
        helperText={"It can be a number like 169.99, 9.99, etc."}
        sx={{
          marginBottom: "10px",
        }}
      />
      <Divider sx={{ margin: "20px 0px" }} />
      <Button variant="contained" onClick={handleUpdate} disabled={loading}>
        {!loading ? "Update Product" : <CircularProgress />}
      </Button>
    </Paper>
  );
};

export default UpdateProduct;

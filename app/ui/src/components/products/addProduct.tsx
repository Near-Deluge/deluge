import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";

import { Product_Storage, Product } from "../../utils/interface";

import {
  BaseContractContext,
  StorageContext,
  WalletConnectionContext,
  WebContext,
} from "../../index";
import { useContext } from "react";
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
  Link,
} from "@mui/material";
import { Box } from "@mui/system";
import BN from "big.js";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useSnackbar } from "notistack";
import { Filelike } from "web3.storage/dist/src/lib/interface";

export const length_unit = [
  { value: "metere", symbol: "M" },
  { value: "feet", symbol: "ft" },
  { value: "inch", symbol: "in" },
];

export const get_symbol_from_unit = (val: String) => {
  let res = length_unit.filter((v) => v.value === val);
  if (res.length > 0) {
    return res[0].symbol;
  } else {
    return "";
  }
};

export const weight_unit = [
  { value: "grams", symbol: "gm" },
  { value: "kilograms", symbol: "kg" },
  { value: "ounce", symbol: "ounce" },
  { value: "pound", symbol: "pound" },
];
export const size = [
  { value: "large", symbol: "L" },
  { value: "extra large", symbol: "XL" },
  { value: "small", symbol: "S" },
  { value: "medium", symbol: "M" },
  { value: "not_applicable", symbol: "N/A" },
];

export const initProductStorage: Product_Storage = {
  name: "",
  product_id: "",
  description: "",
  brand: "",
  category: [],
  usecase: "",
  physical_details: {
    dimensions: {
      h: 0,
      w: 0,
      l: 0,
      unit: "",
    },
    size: "",
    weight: {
      value: 0.0,
      unit: "",
    },
  },
  images: [],
  videos: [],
  expected_delivery: "",
  available_in: [],
};

const AddProduct = () => {
  // Add Product Flow
  // Add all details and push to the ipfs and get the cid.
  // One Cid is pulled, push the transaction to the base contract on blockchain

  // Since Add Product is required is context of adding a new Product will keep the state local to this component

  const web3Instance = useContext(WebContext);
  const storageContext = useContext(StorageContext);
  const base_contract = useContext(BaseContractContext);
  const wallet = useContext(WalletConnectionContext);

  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  //   console.log(web3Instance.then((res) => console.log(res)));

  // I/P refereces
  const categoryIPRef = useRef<HTMLInputElement>(null);
  const imagesIPRef = useRef<HTMLInputElement>(null);
  const videosIPRef = useRef<HTMLInputElement>(null);
  const countriesIPRef = useRef<HTMLInputElement>(null);

  const [storage_product, setStorageProduct] = React.useState<Product_Storage>({
    ...initProductStorage,
  });

  const [blockhain_product_storage, setBCProductStorage] =
    React.useState<Product>({
      cid: "",
      inventory: 0,
      pid: "",
      media: "",
      name: "",
      price: "",
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStorageProduct({
      ...storage_product,
      [e.target.name]: e.target.value,
    });
  };

  const handleBCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBCProductStorage({
      ...blockhain_product_storage,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryDelete = (item: String) => {
    const newList = storage_product.category.filter((val) => val !== item);
    setStorageProduct({
      ...storage_product,
      category: [...newList],
    });
  };

  const handleCategoryAdd = (item: String) => {
    if (item.length > 3) {
      setStorageProduct({
        ...storage_product,
        category: [item, ...storage_product.category],
      });
    }
  };

  const handleImageDelete = (item: String) => {
    const newList = storage_product.images.filter((val) => val !== item);
    setStorageProduct({
      ...storage_product,
      images: [...newList],
    });
  };

  const handleImageAdd = (item: String) => {
    if (item.length > 3) {
      setStorageProduct({
        ...storage_product,
        images: [item, ...storage_product.images],
      });
    }
  };

  const handleVideoDelete = (item: String) => {
    const newList = storage_product.videos.filter((val) => val !== item);
    setStorageProduct({
      ...storage_product,
      videos: [...newList],
    });
  };

  const handleVideoAdd = (item: String) => {
    if (item.length > 3) {
      setStorageProduct({
        ...storage_product,
        videos: [item, ...storage_product.videos],
      });
    }
  };

  const handleCountryDelete = (item: String) => {
    const newList = storage_product.available_in.filter((val) => val !== item);
    setStorageProduct({
      ...storage_product,
      available_in: [...newList],
    });
  };

  const handleCountryAdd = (item: String) => {
    if (item.length > 1) {
      setStorageProduct({
        ...storage_product,
        available_in: [item, ...storage_product.available_in],
      });
    }
  };

  const handleSubmit = async () => {
    // Send to IPFS to get CID
    console.log(storage_product);
    //  TODO: Form Validation
    setLoading(true);
    try {
      let file = new File([JSON.stringify(storage_product)], "deluge.txt");
      let instance = await web3Instance;
      let cid = await instance.put([file]);
      console.log(cid);

      const finalBCProd = {
        ...blockhain_product_storage,
        name: storage_product.name,
        pid: storage_product.product_id,
        cid,
        inventory: blockhain_product_storage.inventory.toString(),
        // Since Precision of DLGT is 8 Decimals, Multiply it to the same.
        price: new BN(blockhain_product_storage.price.toString())
          .mul(10 ** 8)
          .toFixed()
          .toString(),
      };

      console.log(finalBCProd);
      //@ts-ignore
      base_contract.create_product({
        args: {
          product: {
            ...finalBCProd,
          },
          store_id: wallet?.getAccountId(),
        },
        amount: "1",
        meta: "create_product",
      });
      setLoading(false);
    } catch (e) {
      console.log(e);
      enqueueSnackbar("Some Error Occured!!!", { variant: "error" });
      setLoading(false);

      return;
    }
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStorageProduct({
      ...storage_product,
      physical_details: {
        ...storage_product.physical_details,
        dimensions: {
          ...storage_product.physical_details.dimensions,
          [e.target.name]: parseFloat(e.target.value),
        },
      },
    });
  };

  const [flags, setFlags] = React.useState({
    imagesLoading: false,
    videosLoading: false,
    logoLoading: false,
  });

  const handleFileUploads = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.name === "images") {
        let files = e.target.files;
        setFlags({
          ...flags,
          imagesLoading: true,
        });
        console.log(files.length);
        for (let i = 0; i < files.length; ++i) {
          const cid = await storageContext.putFile(files[i]);
          if (cid && cid.length > 0) {
            handleImageAdd(cid);
          } else {
            enqueueSnackbar("Some Error Happened in Uploading Files!!!", {
              variant: "error",
            });
          }
        }

        setFlags({
          ...flags,
          imagesLoading: false,
        });
      }
      if (e.target.name === "videos") {
        let files = e.target.files;
        setFlags({
          ...flags,
          videosLoading: true,
        });

        for (let i = 0; i < files.length; ++i) {
          const cid = await storageContext.putFile(files[i]);
          if (cid && cid.length > 0) {
            handleVideoAdd(cid);
          } else {
            enqueueSnackbar("Some Error Happened in Uploading Files!!!", {
              variant: "error",
            });
          }
        }

        setFlags({
          ...flags,
          videosLoading: false,
        });
      }
      if (e.target.name === "product_media") {
        console.log(e.target.value);
        setFlags({
          ...flags,
          logoLoading: true,
        });
        let files = e.target.files;
        if (files.length === 1) {
          const cid = await storageContext.putFile(files[0]);
          console.log(files[0].name);
          if (cid && cid.length > 0) {
            setBCProductStorage({
              ...blockhain_product_storage,
              media: `https://ipfs.io/ipfs/${cid}/${files[0].name}`,
            });
          } else {
            enqueueSnackbar("Some Error Happened in Uploading Files!!!", {
              variant: "error",
            });
          }
        } else {
          enqueueSnackbar("You can only select one Image here!!!");
        }
        setFlags({
          ...flags,
          logoLoading: false,
        });
      }
    } else {
      enqueueSnackbar("Please Select Atleast one File...");
    }
  };

  return (
    <Paper elevation={2} sx={{ margin: "10px 0px", padding: "10px" }}>
      <Typography variant="h4" textAlign={"center"} gutterBottom>
        <InventoryIcon fontSize="large" />
        Add Product
      </Typography>
      <TextField
        name="name"
        value={storage_product.name}
        onChange={handleChange}
        label="Name"
        required
        fullWidth
      />
      <Divider sx={{ margin: "20px 0px" }} />
      <TextField
        name="product_id"
        value={storage_product.product_id}
        onChange={handleChange}
        required
        label="Product ID"
        fullWidth
        sx={{
          marginBottom: "10px",
        }}
      />
      <TextField
        name="description"
        value={storage_product.description}
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
        value={storage_product.brand}
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
        {storage_product.category.map((item, index) => {
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
          value={storage_product.physical_details.dimensions.unit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setStorageProduct({
              ...storage_product,
              physical_details: {
                ...storage_product.physical_details,
                dimensions: {
                  ...storage_product.physical_details.dimensions,
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
            value={storage_product.physical_details.dimensions.l}
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
            value={storage_product.physical_details.dimensions.w}
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
            value={storage_product.physical_details.dimensions.h}
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
          value={storage_product.physical_details.size}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setStorageProduct({
              ...storage_product,
              physical_details: {
                ...storage_product.physical_details,
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
          value={storage_product.physical_details.weight.unit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setStorageProduct({
              ...storage_product,
              physical_details: {
                ...storage_product.physical_details,
                weight: {
                  ...storage_product.physical_details.weight,
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
          value={storage_product.physical_details.weight.value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setStorageProduct({
              ...storage_product,
              physical_details: {
                ...storage_product.physical_details,
                weight: {
                  ...storage_product.physical_details.weight,
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
                {storage_product.physical_details.weight.unit}
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Divider sx={{ margin: "20px 0px" }} />
      <TextField
        name="usecase"
        value={storage_product.usecase}
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
        {storage_product.images.map((item, index) => {
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
      <Box display={"flex"} alignItems="flex-start" flexDirection={"column"}>
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
        <TextField
          variant="outlined"
          placeholder="Click to Add Files"
          type={"file"}
          onChange={handleFileUploads}
          name="images"
          helperText="Select Product Images"
          disabled={flags.imagesLoading}
        />
        <Button
          disabled={flags.imagesLoading}
          onClick={() => {
            if (null !== imagesIPRef.current) {
              handleImageAdd(imagesIPRef.current.value);
              imagesIPRef.current.value = "";
            }
          }}
        >
          {flags.imagesLoading ? <CircularProgress /> : "Add Image"}
        </Button>
      </Box>
      <Divider sx={{ margin: "20px 0px" }} />
      <Box>
        {storage_product.videos.map((item, index) => {
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
      <Box display={"flex"} alignItems="flex-start" flexDirection={"column"}>
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
        <TextField
          variant="outlined"
          placeholder="Click to Add Videos"
          type={"file"}
          onChange={handleFileUploads}
          name="videos"
          helperText="Select Product Videos"
          disabled={flags.videosLoading}
        />
        <Button
          disabled={flags.videosLoading}
          onClick={() => {
            if (null !== videosIPRef.current) {
              handleVideoAdd(videosIPRef.current.value);
              videosIPRef.current.value = "";
            }
          }}
        >
          {flags.videosLoading ? <CircularProgress /> : "Add Video"}
        </Button>
      </Box>
      <Divider sx={{ margin: "20px 0px" }} />

      <TextField
        name="expected_delivery"
        value={storage_product.expected_delivery}
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
        {storage_product.available_in.map((item, index) => {
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
        value={blockhain_product_storage.inventory}
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
      <Link
        href={blockhain_product_storage.media}
        target="_blank"
        rel="noopener"
        sx={{ width: "100%" }}
        display={flags.logoLoading ? "none" : "block"}
      >{`Media Link: ${blockhain_product_storage.media}`}</Link>
      <TextField
        variant="outlined"
        placeholder="Click to Add a Product Photo"
        type={"file"}
        onChange={handleFileUploads}
        name="product_media"
        helperText="This will be displayed in NFTs for this product purchases."
        disabled={flags.logoLoading}
        sx={{ marginBottom: "10px" }}
        InputProps={{ endAdornment: flags.logoLoading && <CircularProgress /> }}
      />
      <TextField
        name="price"
        value={blockhain_product_storage.price}
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
      <Button variant="contained" onClick={handleSubmit} disabled={loading}>
        {loading ? <CircularProgress /> : " Create Product"}
      </Button>
    </Paper>
  );
};

export default AddProduct;

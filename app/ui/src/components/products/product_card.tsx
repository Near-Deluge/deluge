import React, { useState } from "react";

import { Paper, Typography, Chip, Button, IconButton } from "@mui/material";

import {
  Star,
  StarHalfSharp,
  Favorite,
  Close,
  ShoppingBag,
} from "@mui/icons-material";

import "./product_card.css";
import { change_stable_to_human } from "../../utils/utils";
import { Product, Store } from "../../utils/interface";

import { Link, useNavigate } from "react-router-dom";
import { PaddedDividerSpacer } from "../../pages/product";
import { useDispatch, useSelector } from "react-redux";
import { addItem, removeItem } from "../../redux/slices/cart.slice";

type IProductCard = {
  img: string;
  seller: string;
  description: string;
  name: string;
  price: string;
  currency: string;
  rating?: number;
  ratings_count?: number;
  elevation?: number;
  itemId: string;
  orientation?: "vertical" | "horizontal";
  productBC: Product;
};

const ProductCard: React.FC<IProductCard> = ({
  img,
  seller,
  description,
  name,
  price,
  currency,
  rating,
  ratings_count,
  elevation,
  orientation,
  productBC,
}) => {
  const [fav, setFav] = useState(true);
  const dispatcher = useDispatch();

  const navigate = useNavigate();

  const [isItemInCart, setIsItemInCart] = React.useState(false);
  const cartItems = useSelector((state: any) => state.cartSlice.items);
  const allStore = useSelector((state: any) => state.storeSlice.allStore);

  React.useEffect(() => {
    let res = cartItems.filter((item: Product) => item.pid === productBC.pid);

    if (res.length > 0) {
      setIsItemInCart(true);
    } else {
      setIsItemInCart(false);
    }
  });

  const handleAddCartProduct = (item: Product) => {
    allStore.map((store: Store) => {
      let res = store.products.filter((ipid) => ipid === item.pid);
      if (res.length > 0) {
        dispatcher(addItem({ product: item, store: store, qty: 1 }));
      }
    });
  };

  const handleRemoveItem = (pid: string) => {
    dispatcher(removeItem(pid));
  };

  const return_stars = (rating?: number) => {
    const ret_c = [];
    if (typeof rating === "number") {
      for (let i = 0; i < rating / 2; ++i) {
        ret_c.push(<Star color="primary"></Star>);
      }
      if (rating % 2 !== 0) {
        ret_c.pop();
        ret_c.push(<StarHalfSharp color="primary" />);
      }
    }

    return ret_c;
  };

  return (
    <Paper
      elevation={elevation || 1}
      className={`main-container ${orientation || "vertical"}`}
      sx={{ minWidth: "300px" }}
    >
      <div className="image-wrapper" onClick={() => navigate(`/products/${productBC.cid}`)}>
        <img src={img} alt={name} />
      </div>
      <div className="content-details">
        <div className="product-head">
          <div>
            <Typography
              color={"primary"}
              className="offered_by"
              variant="body1"
            >
              offered by <span>{seller}</span>
            </Typography>
            <Typography className="product-name" gutterBottom variant="h5">
              {name}
            </Typography>
          </div>
          <IconButton onClick={() => setFav(!fav)}>
            <Favorite color={fav ? "error" : "disabled"} />
          </IconButton>
        </div>
        <Typography className="product-description" variant="body2">
          {description.slice(0, 150)}...
        </Typography>
        <Link to={`/products/${productBC.cid}`}>Read More</Link>
        <PaddedDividerSpacer v_m={10} />
        <div className="product-actions">
          <Chip
            label={`${change_stable_to_human(price)} ${currency}`}
            color="primary"
          />
          {isItemInCart ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<Close />}
              onClick={() => handleRemoveItem(productBC.pid)}
            >
              Remove from Cart
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingBag />}
              onClick={() => handleAddCartProduct(productBC)}
            >
              Add to Cart
            </Button>
          )}
        </div>
        {ratings_count !== undefined && ratings_count > 0 && (
          <Typography
            className="product-rating"
            color="primary"
            display={"flex"}
            justifyContent="flex-start"
            alignItems={"center"}
            paddingTop="20px"
          >
            {return_stars(rating)} ({ratings_count})
          </Typography>
        )}
      </div>
    </Paper>
  );
};

export default ProductCard;

import React, { useState } from "react";

import { Paper, Typography, Chip, Button, IconButton } from "@mui/material";

import { Star, StarHalfSharp, Favorite } from "@mui/icons-material";

import "./product_card.css";

type IProductCard = {
  img: string;
  seller: string;
  description: string;
  name: string;
  price: string;
  currency: string;
  rating: number;
  ratings_count: number;
  elevation?: number;
  itemId: string;
  orientation?: "vertical" | "horizontal"
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
  orientation
}) => {
  const [fav, setFav] = useState(true);

  const return_stars = (rating: number) => {
    const ret_c = [];
    for (let i = 0; i < rating / 2; ++i) {
      ret_c.push(<Star color="primary"></Star>);
    }
    if (rating % 2 !== 0) {
      ret_c.pop();
      ret_c.push(<StarHalfSharp color="primary" />);
    }
    return ret_c;
  };


  return (
    <Paper elevation={elevation || 1} className={`main-container ${orientation || "vertical"}`}  >
      <div className="image-wrapper">
        <img src={img} alt={name} />
      </div>
      <div className="content-details">
        <div className="product-head">
          <div>
            <Typography color={"primary"} className="offered_by" variant="body1">
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
        <Typography
          className="product-description"
          variant="body2"
          paddingBottom={"20px"}
        >
          {description.slice(0, 100)}...
        </Typography>
        <div className="product-actions">
          <Chip label={`${price} ${currency}`} color="primary" />
          <Button variant="contained">Add</Button>
        </div>
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
      </div>
    </Paper>
  );
};

export default ProductCard;

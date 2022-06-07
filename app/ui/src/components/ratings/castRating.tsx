import React, { useContext, useState } from "react";

import {
  Grid,
  Box,
  Card,
  Typography,
  Button,
  TextField,
  CardContent,
  CardActions,
  MenuItem,
} from "@mui/material";
import { Rating, Rating_Storage } from "../../utils/interface";
import { useSnackbar } from "notistack";
import { Star, StarHalfSharp } from "@mui/icons-material";
import { RatingContractContext, WalletConnectionContext, WebContext } from "../..";

export const numberToStar = (n: number) => {
  let finArr = [];
  for (let i = 0; i < n - 1; i += 2) {
    finArr.push(<Star color="primary" />);
  }
  if (n % 2 === 1) {
    finArr.push(<StarHalfSharp color="primary" />);
  }
  return finArr;
};

const CastRating: React.FC<{
  productId: string;
  shopId: string;
}> = ({ productId, shopId }) => {
  const [ratingStorage, setRatingStorage] = useState<Rating_Storage>({
    buyer_id: "",
    seller_id: shopId,
    product_id: productId,
    body: "",
    image: [],
    videos: [],
  });

  const instance = useContext(WebContext);
  const walletConnection = useContext(WalletConnectionContext);
  const rating_contract = useContext(RatingContractContext);

  const [rating, setRating] = useState<Rating>({
    buyer: "",
    cid: "",
    rate: 1,
    status: "RATED",
  });

  const { enqueueSnackbar } = useSnackbar();

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRatingStorage({
      ...ratingStorage,
      body: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (ratingStorage.body.length > 0) {
      console.log(rating);
      const currentUser: string = walletConnection?.getAccountId();
      // Upload to IPFS
      const ins = await instance;
      let finalRatingStorage = {
          ...ratingStorage,
          buyer_id: currentUser
      };
      const cid = await ins.put([
        new File([JSON.stringify(finalRatingStorage)], "rating.txt"),
      ]);
      console.log(cid);
      if(cid) {
        let finalRating: Rating = {
            ...rating,
            cid,
            buyer: currentUser
        };

        // @ts-ignore
        const res = await rating_contract?.rate({
            store_id: shopId,
            product_id: productId,
            rate_value: finalRating.rate,
            cid: cid
        });
        console.log(res);

      } else {
          enqueueSnackbar("Something Went wrong when uploading to IPFS..", {variant:"error"});
      }
    } else {
      enqueueSnackbar("Feedback can't be empty!!", { variant: "warning" });
    }
  };

  return (
    <Card variant="outlined" sx={{ padding: "10px" }}>
      <CardContent>
        <Typography gutterBottom color="primary">
          Product ID: {productId}
        </Typography>
        <Typography gutterBottom fontWeight={"bold"}>
          Shop ID: {shopId}
        </Typography>
        {numberToStar(rating.rate)}
        <TextField
          select
          fullWidth
          label="Rating"
          value={rating.rate}
          onChange={(e) => {
            setRating({
              ...rating,
              rate: parseInt(e.target.value),
            });
          }}
          sx={{ margin: "10px 0px" }}
        >
          {Array(10)
            .fill(0)
            .map((_, index) => {
              return (
                <MenuItem key={index + 1} value={index + 1}>
                  {index + 1}
                </MenuItem>
              );
            })}
        </TextField>
        <TextField
          multiline
          rows={5}
          placeholder="How was the product for you"
          label="Feedback"
          onChange={handleTextChange}
          fullWidth
        />
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={handleSubmit}>
          Add Your Rating
        </Button>
      </CardActions>
    </Card>
  );
};

export default CastRating;

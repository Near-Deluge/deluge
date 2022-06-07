import { Divider, Grid } from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RatingContractContext, WalletConnectionContext } from "../..";
import useGetAllStores from "../../hooks/useGetAllStores";
import { addRatings, StoreRating } from "../../redux/slices/ratings.slice";
import { Rating } from "../../utils/interface";
import CastRating from "./castRating";
import RatingView from "./ratingView";

type IRating = {
  productId: string;
  shopId: string;
};

const Ratings: React.FC<IRating> = ({ productId, shopId }) => {
  const ratingContract = useContext(RatingContractContext);

  // Get All Stores
  useGetAllStores();

  const allStore = useSelector((state: any) => state.storeSlice.allStore);
  const dispatcher = useDispatch();
  const walletConnection = useContext(WalletConnectionContext);

  const allRatings = useSelector((state: any) => state.ratingSlice.ratings);

  useEffect(() => {
    (async () => {
      if (productId && shopId) {
        // @ts-ignore
        const res = await ratingContract?.get_ratings({
          store_id: shopId,
          product_id: productId,
        });

        dispatcher(
          addRatings({
            productId: productId,
            shopId: shopId,
            ratings: res,
          })
        );
      }
    })();
  }, []);

  const [productRatings, setProductRatings] = useState<Array<Rating>>([]);
  const [userPendingRating, setUserPendingRating] = useState<Array<Rating>>([]);

  useEffect(() => {
    let pendingUserRatings: Array<Rating> = [];
    // Filtering Ratings from All Products Ratings
    const productRatings = allRatings.filter(
      (rating: StoreRating) => rating.productId === productId
    );
    let ratedRatings = productRatings.map((rating: StoreRating) => {
      let filteredPRatings = rating.ratings.filter(
        (pRating) => pRating.status === "RATED"
      );
      return {
        ...rating,
        ratings: [...filteredPRatings],
      };
    });
    if (productRatings.length > 0) {
      let userId = walletConnection?.getAccountId();

      pendingUserRatings = [
        ...productRatings[0].ratings.filter(
          (pRating: Rating) =>
            pRating.buyer === userId && pRating.status === "UNRATED"
        ),
      ];
    }

    if (ratedRatings.length > 0) {
      setProductRatings([...ratedRatings[0].ratings]);
    }
    if (pendingUserRatings.length > 0) {
      setUserPendingRating([...pendingUserRatings]);
    }
  }, [allRatings]);

  return (
    <Grid container>
      {productRatings.map((pRating) => {
        return (
          <RatingView
            key={pRating.cid}
            buyer={pRating.buyer}
            cid={pRating.cid}
            rate={pRating.rate}
            status={pRating.status}
          />
        );
      })}
      <Divider sx={{ margin: "20px 0px " }} />
      {userPendingRating.map((pRating, index) => {
        return <CastRating shopId={shopId} productId={productId} />;
      })}
    </Grid>
  );
};

export default Ratings;

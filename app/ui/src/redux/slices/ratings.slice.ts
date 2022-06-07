import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Rating } from "../../utils/interface";

export interface StoreRating {
  productId: string;
  shopId: string;
  ratings: Array<Rating>;
}

export interface RatingState {
  ratings: Array<StoreRating>;
}

export const blank_rating: Rating = {
  buyer: "",
  cid: "",
  rate: 0,
  status: "UNRATED",
};

const initialState = {
  ratings: [],
} as unknown as RatingState;

const ratingSlice = createSlice({
  name: "rating",
  initialState,
  reducers: {
    addRating(
      state,
      action: PayloadAction<{
        productId: string;
        shopId: string;
        rating: Rating;
      }>
    ) {
      return {
        ...state,
        ratings: state.ratings.map((rating) => {
          if (
            rating.productId === action.payload.productId &&
            rating.shopId === action.payload.shopId
          ) {
            return {
              ...rating,
              ratings: [...rating.ratings, action.payload.rating],
            };
          }
          return {
            productId: action.payload.productId,
            shopId: action.payload.shopId,
            ratings: [action.payload.rating],
          };
        }),
      };
    },
    addRatings(
      state,
      action: PayloadAction<{
        productId: string;
        shopId: string;
        ratings: Array<Rating>;
      }>
    ) {
      let pRatingExists = state.ratings.filter(
        (rating) =>
          rating.productId === action.payload.productId &&
          rating.shopId === action.payload.shopId
      );
      console.log(pRatingExists);
      let newState = {
        ...state,
        ratings: [
          ...state.ratings.filter(
            (rating) =>
              rating.productId !== action.payload.productId &&
              rating.shopId !== action.payload.shopId
          ),
          pRatingExists.length > 0
            ? {
                ...pRatingExists[0],
                ratings: [...action.payload.ratings],
              }
            : {
                shopId: action.payload.shopId,
                productId: action.payload.productId,
                ratings: [...action.payload.ratings],
              },
        ],
      };
      console.log(newState);
      return newState;
    },
    removeRating(
      state,
      action: PayloadAction<{
        productId: string;
        shopId: string;
        buyerId: string;
      }>
    ) {
      return {
        ...state,
        ratings: state.ratings.map((rating) => {
          if (
            rating.productId === action.payload.productId &&
            rating.shopId === action.payload.shopId
          ) {
            return {
              ...rating,
              ratings: rating.ratings.filter(
                (pRating) => pRating.buyer !== action.payload.buyerId
              ),
            };
          }
          return rating;
        }),
      };
    },
  },
});

export const { addRating, addRatings, removeRating } = ratingSlice.actions;

export default ratingSlice.reducer;

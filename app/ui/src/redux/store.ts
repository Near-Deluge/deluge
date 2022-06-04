import { configureStore, ThunkAction, Action, getDefaultMiddleware } from "@reduxjs/toolkit";

// Imports Reducers
import contractSlice from "./slices/contract.slice";
import storeSlice from "./slices/store.slice";
import productSlice from "./slices/products.slice";
import cartSlice from "./slices/cart.slice";
import ratingSlice from "./slices/ratings.slice";

export const store = configureStore({
  reducer: {
    contractSlice,
    storeSlice,
    productSlice,
    cartSlice,
    ratingSlice
  },

});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

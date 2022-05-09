import { configureStore, ThunkAction, Action, getDefaultMiddleware } from "@reduxjs/toolkit";

// Imports Reducers
import contractSlice from "./slices/contract.slice";
import storeSlice from "./slices/store.slice";
import productSlice from "./slices/products.slice";

export const store = configureStore({
  reducer: {
    contractSlice,
    storeSlice,
    productSlice
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

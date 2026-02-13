import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { paymentApi } from "../../../api/paymentAPI";

import type { CreatePaymentDto, UpdatePaymentDto } from "./paymentTypes";

interface PaymentState {
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  loading: false,
  error: null,
};

export const createPayment = createAsyncThunk("payment/create", async (dto: CreatePaymentDto) => {
  return await paymentApi.create(dto);
});

export const updatePayment = createAsyncThunk("payment/update", async ({ id, dto }: { id: string; dto: UpdatePaymentDto }) => {
  return await paymentApi.update(id, dto);
});

export const deletePayment = createAsyncThunk("payment/delete", async (id: string) => {
  await paymentApi.delete(id);
  return id;
});

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Errore payment";
      });
  },
});

export default paymentSlice.reducer;

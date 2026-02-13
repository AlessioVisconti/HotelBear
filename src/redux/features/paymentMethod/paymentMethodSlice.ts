import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { paymentMethodApi } from "../../../api/paymentMethodAPI";

import type { PaymentMethodDto, CreatePaymentMethodDto, UpdatePaymentMethodDto } from "./paymentMethodTypes";

interface PaymentMethodState {
  methods: PaymentMethodDto[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentMethodState = {
  methods: [],
  loading: false,
  error: null,
};

//GET ALL
export const fetchPaymentMethods = createAsyncThunk("paymentMethod/getAll", async () => {
  return await paymentMethodApi.getAll(true);
});

export const fetchActivePaymentMethods = createAsyncThunk("paymentMethod/getAll", async () => {
  return await paymentMethodApi.getAll(false);
});

//CREATE
export const createPaymentMethod = createAsyncThunk("paymentMethod/create", async (dto: CreatePaymentMethodDto) => {
  return await paymentMethodApi.create(dto);
});

//UPDATE
export const updatePaymentMethod = createAsyncThunk("paymentMethod/update", async ({ id, dto }: { id: string; dto: UpdatePaymentMethodDto }) => {
  return await paymentMethodApi.update(id, dto);
});

//DEACTIVATE
export const deactivatePaymentMethod = createAsyncThunk("paymentMethod/deactivate", async (id: string) => {
  await paymentMethodApi.deactivate(id);
  return id;
});

const paymentMethodSlice = createSlice({
  name: "paymentMethod",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.methods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Errore payment methods";
      });
  },
});

export default paymentMethodSlice.reducer;

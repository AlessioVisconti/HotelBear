import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { InvoiceDto, CreateInvoiceRequestDto } from "./invoiceTypes";
import { invoiceApi } from "../../../api/invoiceAPI";

interface InvoiceState {
  invoiceList: InvoiceDto[];
  currentInvoice: InvoiceDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoiceList: [],
  currentInvoice: null,
  loading: false,
  error: null,
};

// THUNKS
export const createInvoice = createAsyncThunk<InvoiceDto, CreateInvoiceRequestDto, { rejectValue: string }>(
  "invoice/create",
  async (dto, { rejectWithValue }) => {
    try {
      return await invoiceApi.create(dto);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Unknown error");
    }
  },
);

export const getInvoiceById = createAsyncThunk<InvoiceDto, string, { rejectValue: string }>("invoice/getById", async (invoiceId, { rejectWithValue }) => {
  try {
    return await invoiceApi.getById(invoiceId);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Unknown error");
  }
});

export const cancelInvoice = createAsyncThunk<string, string, { rejectValue: string }>("invoice/cancel", async (invoiceId, { rejectWithValue }) => {
  try {
    await invoiceApi.cancel(invoiceId);
    return invoiceId;
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : "Unknown error");
  }
});

// SLICE
const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    clearCurrentInvoice(state) {
      state.currentInvoice = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
        state.invoiceList.push(action.payload);
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // GET BY ID
      .addCase(getInvoiceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(getInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })

      // CANCEL
      .addCase(cancelInvoice.fulfilled, (state, action) => {
        state.invoiceList = state.invoiceList.filter((inv) => inv.id !== action.payload);
        if (state.currentInvoice?.id === action.payload) state.currentInvoice = null;
      });
  },
});

export const { clearCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;

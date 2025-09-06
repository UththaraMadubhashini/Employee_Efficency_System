import { configureStore } from "@reduxjs/toolkit";
import employeeFormReducer from "../redux/employeeFormSlice";

export const store = configureStore({
  reducer: {
    employeeForm: employeeFormReducer
  }
});

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: {
    employeeId: "",
    fullName: "",
    address: "",
    tel: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    joiningDate: ""
  }
};

const employeeFormSlice = createSlice({
  name: "employeeForm",
  initialState,
  reducers: {
    setEmployeeForm(state, action) {
      state.data = { ...state.data, ...action.payload };
    },
    resetEmployeeForm(state) {
      state.data = initialState.data;
    }
  }
});

export const { setEmployeeForm, resetEmployeeForm } = employeeFormSlice.actions;
export default employeeFormSlice.reducer;

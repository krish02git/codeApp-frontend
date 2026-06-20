import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axiosClient from './utils/axiosClient';

// API request - Register
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, {rejectWithValue})=>{ // userData is body data in object formate.
        try{
            const response = await axiosClient.post('/user/register', userData);
            return response.data.user;
             // Backend send the data -> data is what backend sent in object form & response have many other key-value eg: status_code:
        }catch(error){
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// API request - Login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, {rejectWithValue})=>{
        try{
            const response = await axiosClient.post('/user/login', credentials);
            return response.data.user;
        }catch(error){
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// API request - Check Authentication
export const checkAuth = createAsyncThunk(
    'auth/check',
    async (_, {rejectWithValue})=>{
        try{
            const response = await axiosClient.get('/user/check');
            return response.data.user;
        }catch(error){
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// API request - Logout
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, {rejectWithValue})=>{
        try{
            await axiosClient.post('/user/logout');
            return null;
        }catch(error){
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const authSlice = createSlice({
    name:'auth',
    initialState:{
        user:null, //payload.
        isAuthenticated:false,
        loading:false,
        error:null
    },
    reducers:{
    },
    extraReducers: (builder)=>{
        builder
        // Register cases
        .addCase(registerUser.pending, (state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(registerUser.fulfilled, (state, action)=>{
            state.loading=false;
            state.isAuthenticated=!!action.payload; // if user info exist then true else false. For empty {}.
            state.user=action.payload;
            state.error=null;
        })
        .addCase(registerUser.rejected, (state, action)=>{
            state.loading=false;
            state.error=action.payload?.message || 'Registration failed.';
            state.user=null;
            state.isAuthenticated=false;
        })
        
        // Login cases
        .addCase(loginUser.pending, (state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(loginUser.fulfilled, (state, action)=>{
            state.loading=false;
            state.isAuthenticated=!!action.payload;
            state.user=action.payload;
            state.error=null;
        })
        .addCase(loginUser.rejected, (state, action)=>{
            state.loading=false;
            state.error=action.payload?.message || 'Login failed.';
            state.user=null;
            state.isAuthenticated=false;
        })
        
        // Check Auth cases
        .addCase(checkAuth.pending, (state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(checkAuth.fulfilled, (state, action)=>{
            state.loading=false;
            state.isAuthenticated=!!action.payload;
            state.user=action.payload;
            state.error=null;
        })
        .addCase(checkAuth.rejected, (state, action)=>{
            state.loading=false;
            state.error=null; // Don't show error for failed auth check
            state.user=null;
            state.isAuthenticated=false;
        })
        
        // Logout cases
        .addCase(logoutUser.pending, (state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(logoutUser.fulfilled, (state)=>{
            state.loading=false;
            state.isAuthenticated=false;
            state.user=null;
            state.error=null;
        })
        .addCase(logoutUser.rejected, (state, action)=>{
            state.loading=false;
            state.error=action.payload?.message || 'Logout failed.';
        });
    }
});

export default authSlice.reducer;
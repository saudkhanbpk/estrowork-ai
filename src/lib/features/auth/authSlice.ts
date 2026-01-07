import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

interface User {
    _id?: string;
    name?: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean; // Managed by RTK Query hooks mostly, but good for global state
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(apiSlice.endpoints.login.matchFulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.token = action.payload.token;
                // Fallback if user object is not in payload, though it should ideally be
                state.user = action.payload.user || { email: '', role: 'client' };
            })
            .addMatcher(apiSlice.endpoints.register.matchFulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user || { email: '', role: 'client' };
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

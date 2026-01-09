import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:4000/api";

// Types for code generation
export interface GeneratedFile {
    path: string;
    content: string;
    type: 'component' | 'style' | 'config' | 'test' | 'util' | 'page' | 'api' | 'other';
    lines: number;
}

export interface GenerationProgress {
    currentStep: number;
    totalSteps: number;
    currentStepName: string;
    message: string;
    percentage: number;
}

export interface CodeGenerationResponse {
    id: string;
    status: 'pending' | 'analyzing' | 'planning' | 'generating' | 'assembling' | 'completed' | 'failed';
    progress: GenerationProgress;
    prompt: string;
    analysis?: {
        appName: string;
        appDescription: string;
        appType: string;
        complexity: string;
        features: Array<{ name: string; description: string; priority: string }>;
    };
    techStack?: {
        frontend: { framework: string; styling: string; stateManagement: string };
        backend?: { framework: string; database: string };
    };
    files: GeneratedFile[];
    setupInstructions?: Array<{ step: number; command: string; description: string }>;
    createdAt: string;
    updatedAt: string;
}

export interface CodeGenerationInput {
    prompt: string;
    preferences?: {
        framework?: string;
        styling?: string;
        includeTests?: boolean;
    };
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['CodeGeneration'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (userData) => ({
                url: '/auth/login',
                method: 'POST',
                body: userData,
            }),
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
        }),
        analyzeRequirement: builder.mutation({
            query: (data) => ({
                url: '/requirements/analyze',
                method: 'POST',
                body: data,
            }),
        }),
        // Code Generation endpoints
        generateCode: builder.mutation<{ success: boolean; data: CodeGenerationResponse }, CodeGenerationInput>({
            query: (data) => ({
                url: '/generate',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['CodeGeneration'],
        }),
        getCodeGeneration: builder.query<{ success: boolean; data: CodeGenerationResponse }, string>({
            query: (id) => `/generate/${id}`,
            providesTags: (result, error, id) => [{ type: 'CodeGeneration', id }],
        }),
        getGenerationStatus: builder.query<{ success: boolean; data: { id: string; status: string; progress: GenerationProgress; isActive: boolean; canResume: boolean } }, string>({
            query: (id) => `/generate/${id}/status`,
        }),
        getGeneratedFiles: builder.query<{ success: boolean; data: { files: GeneratedFile[]; count: number } }, string>({
            query: (id) => `/generate/${id}/files`,
        }),
        getGeneratedFile: builder.query<{ success: boolean; data: GeneratedFile }, { id: string; path: string }>({
            query: ({ id, path }) => `/generate/${id}/file?path=${encodeURIComponent(path)}`,
        }),
        listCodeGenerations: builder.query<{ success: boolean; data: CodeGenerationResponse[] }, { status?: string; limit?: number; offset?: number } | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.status) searchParams.set('status', params.status);
                if (params?.limit) searchParams.set('limit', params.limit.toString());
                if (params?.offset) searchParams.set('offset', params.offset.toString());
                const queryString = searchParams.toString();
                return `/generate${queryString ? `?${queryString}` : ''}`;
            },
            providesTags: ['CodeGeneration'],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useAnalyzeRequirementMutation,
    useGenerateCodeMutation,
    useGetCodeGenerationQuery,
    useGetGenerationStatusQuery,
    useGetGeneratedFilesQuery,
    useGetGeneratedFileQuery,
    useListCodeGenerationsQuery,
} = apiSlice;

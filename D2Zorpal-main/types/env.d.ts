// types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    BUNGIE_CLIENT_ID: string;
    BUNGIE_CLIENT_SECRET: string;
    NEXT_PUBLIC_BUNGIE_API_KEY: string;
    NEXT_PUBLIC_REDIRECT_URI: string;
  }
}
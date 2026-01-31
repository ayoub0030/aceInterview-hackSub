/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ELEVEN_API_KEY: string
  readonly VITE_ELEVEN_AGENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

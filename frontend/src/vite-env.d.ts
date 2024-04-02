/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODEL_ADDRESS: string,
  readonly VITE_DATABASE_ADDRESS: string,
  readonly VITE_DATABASE_USER: string,
  readonly VITE_DATABASE_USER_PASSWORD: string,
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
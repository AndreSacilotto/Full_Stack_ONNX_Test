/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODEL_ADDRESS: string,
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
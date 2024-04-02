import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as path from 'path';

const serveConfig = {
	strictPort: true,
	port: 8000,
	open: true,
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: serveConfig,
	preview: serveConfig,

	resolve:
	{
		alias:
		[
			{ find: "@", replacement: path.resolve(__dirname, "src") },
		]
	},
	
})

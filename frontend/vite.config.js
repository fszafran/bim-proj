import { defineConfig } from 'vite';

export default defineConfig({
	envDir: '../',
	server: {
		host: '0.0.0.0',
		port: parseInt(process.env.FRONTEND_PORT || '5173')
	}
});
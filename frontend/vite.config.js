import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path';
import serveStatic from 'serve-static';

const sharedDirectoryPath = path.resolve(__dirname, '../shared');

const cesiumSource = "node_modules/cesium/Build/Cesium";
const cesiumBaseUrl = "cesiumStatic";

export default defineConfig({
	envDir: '../',
	server: {
		host: '0.0.0.0',
		port: parseInt(process.env.FRONTEND_PORT || '5173'),
		fs: {
            strict: false,
            allow: ['..', sharedDirectoryPath]
        }
	},
	define: {
        CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
    },
	plugins: [
        viteStaticCopy({
            targets: [
                { src: `${cesiumSource}/ThirdParty`, dest: cesiumBaseUrl },
                { src: `${cesiumSource}/Workers`, dest: cesiumBaseUrl },
                { src: `${cesiumSource}/Assets`, dest: cesiumBaseUrl },
                { src: `${cesiumSource}/Widgets`, dest: cesiumBaseUrl },
            ]
        }),
		{
            name: 'serve-shared-directory-plugin',
            apply: 'serve',
            configureServer(server) {
                server.middlewares.use('/shared', serveStatic(sharedDirectoryPath, {

                }));
            }
        }
    ]

});
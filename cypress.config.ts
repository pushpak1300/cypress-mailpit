import { defineConfig } from "cypress";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
	video: false,
	e2e: {
		setupNodeEvents(_on, _config) {},
	},
	env: {
		BASE_URL: "http://localhost:8025",
		MAILPIT_URL: "http://localhost:8025",
		MAILPIT_USERNAME: "admin",
		MAILPIT_PASSWORD: "admin",
	},
});

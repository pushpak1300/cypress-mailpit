import { defineConfig } from "cypress";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
	projectId: "ko5dq3",
	video: false,
	e2e: {
		setupNodeEvents(_on, _config) {},
	},
	expose: {
		MAILPIT_URL: "http://localhost:8025",
	},
	env: {
		BASE_URL: "http://localhost:8025",
		MAILPIT_USERNAME: "admin",
		MAILPIT_PASSWORD: "admin",
	},
});

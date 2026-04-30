module.exports = {
  apps: [{
    name: "mab-api",
    script: "dist/index.mjs",
    node_args: "--enable-source-maps",
    env: {
      PORT: "8080",
      DATABASE_URL: "postgresql://mab:Lokasiku123@127.0.0.1:5432/mie_ayam_berteman",
      CORS_ORIGIN: "https://mie-api-server-xw4r.vercel.app,https://mie-api-server-xw4r-9u1je87qy-dudungs-projects-ad0f12da.vercel.app",
      NODE_ENV: "production"
    }
  }]
}

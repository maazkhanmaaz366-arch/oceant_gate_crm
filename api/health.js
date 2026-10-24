module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'OceanGate CRM Vercel API',
    node_env: process.env.NODE_ENV || 'unset',
    has_postgres_uri: Boolean(process.env.POSTGRES_URI),
    timestamp: new Date().toISOString()
  });
};

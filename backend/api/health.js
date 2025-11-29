// Health Check Endpoint
module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Agri Lending Platform API',
    version: '1.0.0',
    environment: 'Vercel Serverless'
  });
};

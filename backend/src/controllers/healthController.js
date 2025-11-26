const healthCheck = (req, res) => {
  res.status(200).json({
    ok: true,
    version: '1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

module.exports = {
  healthCheck
};
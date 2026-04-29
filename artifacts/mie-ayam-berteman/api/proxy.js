export default async function handler(req, res) {
  const path = req.url.replace('/api/proxy', '');
  const target = `http://113.29.232.135:8080${path}`;
  
  const response = await fetch(target, {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}

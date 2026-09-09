const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // This is just the static HTML, it won't have React rendered.
    console.log(data);
  });
});

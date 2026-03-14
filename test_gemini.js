const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Testing ' }] }],
  }),
})
  .then(res => res.json())
  .then(data => console.log('Response:', JSON.stringify(data, null, 2)))
  .catch(err => console.error('Error:', err));

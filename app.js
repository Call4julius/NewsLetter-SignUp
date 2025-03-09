import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

app.get('/no-thanks.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'no-thanks.html'));
});

app.get('/home.html', (req, res) => {
  res.redirect('/');
});

app.post('/', async (req, res) => {
  const { email, firstName, lastName } = req.body;
  const MAILING_LIST_URL =
    'https://us16.api.mailchimp.com/3.0/lists/079d48b22e/members';
  const MY_AUTH = `${process.env.MAILCHIMP_USERNAME}:${process.env.MAILCHIMP_API_KEY}`;
  const encodedAuth = Buffer.from(MY_AUTH).toString('base64');

  if (!email || !firstName || !lastName) {
    return res.status(400).send('All fields are required');
  } else if (!email.includes('@')) {
    return res.status(400).send('Invalid email');
  } else {
    const data = {
      members: [
        {
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
          },
        },
      ],
    };

    const JSONData = JSON.stringify(data);
    const options = {
      method: 'POST',
      body: JSONData,
      headers: {
        Authorization: `Basic ${encodedAuth}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(MAILING_LIST_URL, options);

      if (response.ok) {
        res.sendFile(path.join(__dirname, 'public', 'pages', 'success.html'));
      } else {
        res.sendFile(path.join(__dirname, 'public', 'pages', 'failed.html'));
      }
    } catch (error) {
      console.error('Error:', error);
      res.sendFile(path.join(__dirname, 'public', 'pages', 'failed.html'));
    }
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${PORT}`);
});

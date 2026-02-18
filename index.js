import express from 'express'
import axios from 'axios'

const app = express();
app.use(express.json());

const TOKEN = process.env.TOKEN;
const SECRET = process.env.SECRET

app.post('/trigger', auth, async (req,res) => {
  try {
    const event = req.headers['event']
    const options = JSON.parse(req.headers['options'])
    const payload = {
      "type": event,
      "options": options
    }
    const URL = `http://137.184.153.36:3001/jobs`
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    }
    console.log(`triggering ${event}`)
    console.log(`with payload ${JSON.stringify(payload, null, 4)}`)
    console.log(`url : ${URL}`)
    const response = await axios.post(URL, payload, {headers: headers})
    console.log(`got response from CI: ${JSON.stringify(response.data, null, 4)}`)
    res.status(200).send("GitHub workflow triggered.");
  }catch(err){
    console.error(err.response?.data || err.message);
    res.status(500).send(`Failed to trigger builder.
    ${JSON.stringify(err.response?.data || err.message)}`);
  }
})

function auth (req,res,next) {
  const token = req.headers['x-api-key']
  if (token !== SECRET || token === undefined || token === null){
    return res.status(403).json({error: 'forbidden'})
  }
  next()
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

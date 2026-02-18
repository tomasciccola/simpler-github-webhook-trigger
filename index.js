import express from 'express'
import axios from 'axios'

const app = express();
app.use(express.json());

// my api secret (x-api-secret)
const SECRET = process.env.SECRET
// own CI's token
const TOKEN = process.env.TOKEN;
// Github token
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const REPO = process.env.REPO;
const BRANCH = process.env.BRANCH

const sendToCI = async (req,res,event) => {
  console.log('sending job to own ci')
  try{
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
    res.status(200).send(JSON.stringify(response.data, null, 4));
  }catch(err){
    console.error(err.response?.data || err.message);
    res.status(500).send(`Failed to trigger builder.
      ${JSON.stringify(err.response?.data || err.message)}`);

  }
}

const sendToGithub = async (req,res,event) => {
  console.log('sending job to githubs ci')
  try {
    const event = req.headers['event']
    const payload = {
      "ref": BRANCH
    }
    const URL = `https://api.github.com/repos/${REPO}/actions/workflows/${event}/dispatches`
    const headers = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json'
    }
    console.log(`triggering ${event} on repo: ${REPO}/${BRANCH}`)
    console.log(`url : ${URL}`)
    await axios.post(URL, payload, {headers: headers})
    res.status(200).send("GitHub workflow triggered.");
  }catch(err){
    console.error(err.response?.data || err.message);
    res.status(500).send(`Failed to trigger GitHub.
      ${JSON.stringify(err.response?.data || err.message)}`);
  }
}

app.post('/trigger', auth, async (req,res) => {
  const event = req.headers['event']
  if(event === 'notion:fetch-all'){
    await sendToCI(req,res,event)
  }else{
    await sendToGithub(req,res,event)
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

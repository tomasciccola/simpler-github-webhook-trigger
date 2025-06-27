import express from 'express'
import axios from 'axios'

const app = express();
app.use(express.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.REPO;
const BRANCH = process.env.BRANCH
const SECRET = process.env.SECRET

app.post('/trigger', auth, async (req,res) => {
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
    console.log(`triggering ${EVENT_TYPE} on repo: ${REPO}/${BRANCH}`)
    console.log(`url : ${URL}`)
    await axios.post(URL, payload, {headers: headers})
    res.status(200).send("GitHub workflow triggered.");
  }catch(err){
    console.error(err.response?.data || err.message);
    res.status(500).send(`Failed to trigger GitHub.
    ${JSON.stringify(err.response?.data || err.message)}`);
  }
})

function auth (req,res,next) {
  const token = req.headers['x-api-key']
  if (token !== SECRET) return res.status(403).json({error: 'forbidden'})
  next()
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

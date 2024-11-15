import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { loremIpsum } from 'lorem-ipsum';
import bodyParser from 'body-parser';
import { randomUUID } from 'crypto';
import path from 'path';

const app = express();
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
};

app.use(bodyParser.json({ extended: false, limit: '50mb' }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

const dataFile = 'data/data.json';
const options = {
  log: false,
};

const validOpts = ['log', 'gen'];

const processOptions = () => {
  const inOpts = process.argv.slice(2);
  for (let i = 0; i < inOpts.length; i++) {
    const opt = inOpts[i].split('=');
    if (validOpts.includes(opt[0])) {
      options[opt[0]] = opt[1] ?? true;
    } else {
      console.log(`Invalid option '${opt[0]}'`);
    }
  }
  console.log(inOpts, options);
};

const logResult = (result) => {
  if (!options.log) {
    return;
  }

  if (Array.isArray(result)) {
    console.log(`result data length = ${result.length}`);
  } else {
    console.log(`result data = ${JSON.stringify(result)}`);
  }
};

const logRequest = (req) => {
  if (!options.log) {
    return;
  }

  const { url, params, query, body } = req;

  const [path, queryPart] = url.split('?');
  console.log(`API request = ${JSON.stringify({ path, params, query, body })}`);
};

// NOTE: task only includes type/value if not a primitive

const defaultItem = {
  title: '',
  description: '',
  done: false,
};

const defaultData = () => ({
  profile: {
    firstName: 'Bob',
    surname: 'Along',
    email: 'bob.along@flotsam.com',
  },
  tasks: [],
});
let liveData; // Should probably use a map, but only a sample app.

const genData = () => {
  // backup dataFile to data-date-time.json
  if (fs.existsSync(dataFile)) {
    fs.cpSync(dataFile, `data/data-${new Date().toISOString()}.json`);
  }
  const liveData = defaultData();
  const genSize = typeof options.gen === 'boolean' ? 25 : parseInt(options.gen);
  const dataLen = genSize > 0 ? genSize : 25;
  const donePortion = Math.max(dataLen - 10, dataLen * 0.8) / dataLen;
  const archivePortion = Math.max(dataLen - 20, dataLen * 0.6) / dataLen;
  const portfolioPortion = Math.max(dataLen - 30, dataLen * 0.3) / dataLen;

  const aYear = 31536000000;
  const now = Date.now();
  for (let i = 0; i < dataLen; i++) {
    const done = Math.random() < donePortion;
    const createdDate = now - Math.random() * aYear; // some time in the last year

    liveData.tasks.push({
      id: randomUUID(),
      title: `Task (${i + 1}) - ${loremIpsum({ count: 3, units: 'words' })}`,
      description: loremIpsum({ count: 5, units: 'sentences' }),
      due: { type: 'date', value: new Date().toISOString().substr(0, 10) },
      notes: loremIpsum({ count: 2, units: 'paragraphs' }),
      results: loremIpsum({ count: 1, units: 'paragraphs' }),
      done,
      doneDate: done
        ? { type: 'date', value: new Date().toISOString() }
        : undefined,
      archive: Math.random() < archivePortion,
      portfolio: Math.random() < portfolioPortion,
      created: { type: 'date', value: new Date(createdDate).toISOString() },
    });
  }

  fs.writeFileSync(dataFile, JSON.stringify(liveData, null, 2));
};

const initData = () => {
  // make sure folders exists
  const paths = ['data/images'];
  paths.forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  });

  // open file data.json and read contents
  if (options.gen) {
    genData();
    process.exit(0);
  }

  try {
    const fileContents = fs.readFileSync(dataFile, 'utf8');
    liveData = JSON.parse(fileContents);
  } catch {
    liveData = {
      profile: null,
      tasks: [],
    };
  }
};

const saveData = () => {
  // save liveData to file
  fs.writeFileSync(dataFile, JSON.stringify(liveData, null, 2));
};

app.put('/api/reset', (req, res) => {
  logRequest(req);
  liveData = defaultData();
  saveData();
  logResult(liveData);
  res.sendStatus(200);
});

app.get('/api/profile', (req, res) => {
  logRequest(req);

  if (liveData?.profile) {
    res.json(liveData?.profile);
    logResult(liveData?.profile);
  } else {
    res.sendStatus(404);
  }
});

app.post('/api/profile', (req, res) => {
  logRequest(req);
  liveData.profile = req.body;
  saveData();
  logResult(liveData.profile);
  res.sendStatus(200);
});

app.get('/api/theme', (req, res) => {
  logRequest(req);

  if (liveData?.theme) {
    res.json(liveData?.theme);
    logResult(liveData?.theme);
  } else {
    res.sendStatus(404);
  }
});

app.put('/api/theme', (req, res) => {
  logRequest(req);
  liveData.theme = req.body;
  saveData();
  logResult(liveData.theme);
  res.sendStatus(200);
});

app.get('/api/tasks', (req, res) => {
  logRequest(req);
  // retrieves all tasks unless query params supplied
  const result = liveData.tasks;
  res.json(result);

  logResult(result);
});

app.put('/api/tasks', (req, res) => {
  logRequest(req);
  liveData.tasks = req.body;
  saveData();
  logResult(liveData.data);
  res.sendStatus(200);
});

app.get('/api/tasks/task/:id', (req, res) => {
  logRequest(req);

  const result = liveData.tasks.filter((item) => item.id === req.params.id);
  res.json(result);

  logResult(result);
});

app.delete('/api/tasks', (req, res) => {
  logRequest(req);

  const ids = req.body;
  ids.forEach((id) => {
    // inefficient delete (only a small app)
    const taskIndex = liveData.tasks.findIndex((item) => ids.includes(item.id));
    liveData.tasks.splice(taskIndex, 1);
  });
  saveData();
  res.sendStatus(200);
});

app.post('/api/tasks/new', (req, res) => {
  logRequest(req);
  const task = req.body;
  task.id = randomUUID();
  task.created = { type: 'date', value: new Date().toISOString() };
  liveData.tasks.push(task);
  saveData();

  logResult(task);
  res.json(task);
});

const b64ImagesToFile = (id, image) => {
  const b64 = image.value;
  const [pre, data] = b64.split(';base64,');
  const ext = pre.split('/').pop();
  const filename = `data/images/${id}-image.${ext}`;

  fs.writeFileSync(filename, data, { encoding: 'base64' });

  return filename;
};

app.put('/api/tasks/task', (req, res) => {
  logRequest(req);

  const { image, ...updTask } = req.body;
  const task = liveData.tasks.find((item) => item.id === updTask.id);

  if (image && image?.value?.startsWith('data:image')) {
    // Save base64 image to file
    const value = b64ImagesToFile(updTask.id, image);

    updTask.image = { ...image, value };
  }

  Object.assign(task, updTask);
  saveData();

  logResult(task);
  res.json(task);
});

app.get('/api/data/images/:filename', (req, res) => {
  logRequest(req);

  const filename = path.resolve(`data/images/${req.params.filename}`);
  const exists = fs.existsSync(filename);
  if (exists) {
    res.sendFile(filename);
    logResult({ img: filename, result: 'served' });
  } else {
    res.send(404);
  }
});

app.listen(8080, () => {
  console.log('Server started on port 8080.');

  initData();
});

processOptions();

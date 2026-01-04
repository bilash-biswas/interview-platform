import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runInNewContext } from 'vm';

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.post('/execute', (req: Request, res: Response) => {
  const { code, language } = req.body;

  if (language !== 'javascript') {
    return res.status(400).json({ error: 'Only JavaScript is supported in this demo' });
  }

  try {
    const sandbox = { console: { log: (...args: any[]) => { logs.push(args.join(' ')); } } };
    const logs: string[] = [];
    
    // Simple timeout mechanism
    const timeout = 1000; // 1 second
    const start = Date.now();
    
    // WARNING: vm is not secure for production. Use Sandbox/Docker in real app.
    let result = runInNewContext(code, sandbox, { timeout });
    
    res.json({ result: result, logs: logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'code-execution-service' });
});

app.listen(port, () => {
  console.log(`Code Execution Service listening on port ${port}`);
});

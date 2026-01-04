import express, { Request, Response } from 'express';
import { User, UserRole } from '../models/user';
import { Password, JwtService } from '../utils/auth';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send({ message: 'Email in use' });
    }

    const hashedPassword = await Password.toHash(password);
    const user = new User({ email, password: hashedPassword, username, role: UserRole.USER });
    await user.save();

    const userJwt = JwtService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username
    });

    res.status(201).send({ user, token: userJwt });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});

router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Failed to fetch users' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, body: req.body });

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      console.log('Login failed: User not found', email);
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const passwordsMatch = await Password.compare(existingUser.password, password);
    if (!passwordsMatch) {
      console.log('Login failed: Password mismatch', email);
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const userJwt = JwtService.generateToken({
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      username: existingUser.username
    });

    res.status(200).send({ user: existingUser, token: userJwt });
  } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Something went wrong' });
  }
});

router.post('/logout', (req, res) => {
  res.send({});
});

router.get('/currentuser', (req, res) => {
  // TODO: Implement middleware to extract user from token
  // For now just checking if header exists as a mock
  if (!req.headers.authorization) {
      return res.send({ currentUser: null });
  }
  try {
      const payload = JwtService.verifyToken(req.headers.authorization.split(' ')[1]);
      res.send({ currentUser: payload });
  } catch (err) {
      res.send({ currentUser: null });
  }
});

export { router as authRouter };

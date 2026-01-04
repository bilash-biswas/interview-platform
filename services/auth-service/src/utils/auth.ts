import jwt from 'jsonwebtoken';

export class Password {
  static toHash(password: string): Promise<string> {
    // We will use bcryptjs in the actual implementation, for now mocking to avoid dep issues if not installed yet
    // But since I added it to package.json, I should use it.
    const bcrypt = require('bcryptjs');
    return bcrypt.hash(password, 8);
  }

  static async compare(stored: string, supplied: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(supplied, stored);
  }
}

export class JwtService {
    static generateToken(payload: any): string {
        if (!process.env.JWT_KEY) {
            throw new Error('JWT_KEY is not defined');
        }
        return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1h' });
    }

    static verifyToken(token: string): any {
         if (!process.env.JWT_KEY) {
            throw new Error('JWT_KEY is not defined');
        }
        return jwt.verify(token, process.env.JWT_KEY);
    }
}

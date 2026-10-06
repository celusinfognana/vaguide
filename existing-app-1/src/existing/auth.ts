import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = 'your_secret_key'; // Replace with your actual secret key

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token' });
        }

        req.userId = decoded.id; // Assuming the token contains the user ID
        next();
    });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Assuming user role is stored in the token or user object
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};
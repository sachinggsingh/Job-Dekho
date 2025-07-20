import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret'

if (!ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables');
}

export const generateAccessToken = (payload: object) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}

export const generateRefreshToken = (payload: object) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET)
}

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET)
}
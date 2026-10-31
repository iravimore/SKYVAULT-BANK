const userModel = require('../models/userModel');
const accountModel = require('../models/accountModel');
const auditService = require('../services/auditService');
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  isStrongPassword
} = require('../utils/authUtils');
const { AppError } = require('../middleware/errorHandler');

const MAX_FAILED_ATTEMPTS = 5;

async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      throw new AppError('Full name, email and password are required', 400);
    }
    if (!isStrongPassword(password)) {
      throw new AppError('Password must be at least 8 characters and include uppercase, lowercase, and a number', 400);
    }

    const existing = userModel.getUserByEmail(email);
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = userModel.createUser({ fullName, email, passwordHash });
    const account = accountModel.createAccount({ userId: user.id, accountType: 'SAVINGS', openingBalance: 0 });

    auditService.recordEvent({ userId: user.id, action: 'USER_REGISTER', status: 'SUCCESS', req, metadata: { email } });

    res.status(201).json({
      message: 'Registration successful',
      user: userModel.toPublicUser(user),
      account
    });
  } catch (err) {
    if (err.statusCode) {
      auditService.recordEvent({ action: 'USER_REGISTER', status: 'FAILED', req, metadata: { reason: err.message } });
    }
    next(err);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = userModel.getUserByEmail(email);

    if (!user) {
      auditService.recordEvent({ action: 'FAILED_LOGIN', status: 'FAILED', req, metadata: { email } });
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status === 'LOCKED') {
      auditService.recordEvent({ userId: user.id, action: 'FAILED_LOGIN', status: 'FAILED', req, metadata: { reason: 'account locked' } });
      throw new AppError('Account is locked due to multiple failed login attempts. Contact support.', 403);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is not active', 403);
    }

    const passwordMatches = await comparePassword(password, user.password_hash);

    if (!passwordMatches) {
      userModel.incrementFailedAttempts(user.id);
      const updated = userModel.getUserById(user.id);
      if (updated.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
        userModel.lockUser(user.id);
        auditService.recordEvent({ userId: user.id, action: 'ACCOUNT_LOCKED', status: 'SUCCESS', req, metadata: { reason: 'too many failed attempts' } });
      }
      auditService.recordEvent({ userId: user.id, action: 'FAILED_LOGIN', status: 'FAILED', req });
      throw new AppError('Invalid email or password', 401);
    }

    userModel.updateLastLogin(user.id);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    auditService.recordEvent({ userId: user.id, action: 'USER_LOGIN', status: 'SUCCESS', req });

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: userModel.toPublicUser(user)
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 400);

    const payload = verifyRefreshToken(refreshToken);
    const user = userModel.getUserById(payload.sub);
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Invalid session', 401);
    }

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    next(new AppError('Invalid or expired refresh token', 401));
  }
}

async function logout(req, res, next) {
  try {
    // Stateless JWT: client discards tokens. We still record the audit event.
    auditService.recordEvent({ userId: req.user?.id, action: 'USER_LOGOUT', status: 'SUCCESS', req });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new password are required', 400);
    }
    if (!isStrongPassword(newPassword)) {
      throw new AppError('New password must be at least 8 characters and include uppercase, lowercase, and a number', 400);
    }

    const user = userModel.getUserById(req.user.id);
    const matches = await comparePassword(currentPassword, user.password_hash);
    if (!matches) {
      auditService.recordEvent({ userId: user.id, action: 'PASSWORD_CHANGE', status: 'FAILED', req, metadata: { reason: 'wrong current password' } });
      throw new AppError('Current password is incorrect', 401);
    }

    const newHash = await hashPassword(newPassword);
    userModel.updatePassword(user.id, newHash);

    auditService.recordEvent({ userId: user.id, action: 'PASSWORD_CHANGE', status: 'SUCCESS', req });
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = userModel.getUserById(req.user.id);
    res.json({ user: userModel.toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, changePassword, me };

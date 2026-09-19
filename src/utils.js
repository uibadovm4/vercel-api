export function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function publicUser(user) {
  if (!user) return null;
  const { password_hash: ignored, ...safeUser } = user;
  return safeUser;
}
const SUPERADMIN_ROLE = 'superadmin'

function isSuperadmin(user) {
  return user?.role === SUPERADMIN_ROLE
}

function hasPremiumAccess(user) {
  return isSuperadmin(user) || Boolean(user?.isPremium)
}

function getAccessSource(user) {
  if (isSuperadmin(user)) return SUPERADMIN_ROLE
  return user?.isPremium ? 'premium' : 'none'
}

module.exports = { SUPERADMIN_ROLE, isSuperadmin, hasPremiumAccess, getAccessSource }

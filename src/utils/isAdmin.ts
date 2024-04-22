export function isAdmin() {
  const key = process.env.SECRET_ADMIN_KEY;
  if (!key) {
    throw new Error('ADMIN KEY KEY NOT SET???');
  }
  return localStorage.getItem('voxelverses-admin') === key;
}

export const getQueryUsername = () => {
  const username = new URLSearchParams(window.location.search).get('username');
  if (username) {
    localStorage.setItem('voxelverses-lastQueriedUsername', username);
    return username;
  }
  return localStorage.getItem('voxelverses-lastQueriedUsername');
};

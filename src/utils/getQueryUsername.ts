export const getQueryUsername = () => {
  const username = new URLSearchParams(window.location.search).get('username');
  if (username) {
    localStorage.setItem('voxelize-lastQueriedUsername', username);
    return username;
  }
  return localStorage.getItem('voxelize-lastQueriedUsername');
};

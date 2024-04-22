import ReactDOM from 'react-dom/client';

import { App } from '@/src/containers/App.tsx';

import '@/src/styles/index.scss';
import '@voxelverses/core/dist/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

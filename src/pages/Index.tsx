
import { AppProvider } from '../context/AppContext';
import Home from './Home';

const Index = () => {
  return (
    <AppProvider>
      <Home />
    </AppProvider>
  );
};

export default Index;

import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout     from './components/Layout';
import Feed       from './pages/Feed';
import Explore    from './pages/Explore';
import Profile    from './pages/Profile';
import PostDetail from './pages/PostDetail';
import Login      from './pages/Login';
import Register   from './pages/Register';


const Private = ({children}) => {
  const token = useSelector(s => s.auth.token);
  return token ? children : <Navigate to="/login" replace />;
};
const Public = ({children}) => {
  const token = useSelector(s => s.auth.token);
  return token ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Public><Login /></Public>} />
      <Route path="/register" element={<Public><Register /></Public>} />

      <Route path="/" element={<Private><Layout /></Private>}>
        <Route index               element={<Feed />} />
        <Route path="explore"      element={<Explore />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="post/:id"    element={<PostDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
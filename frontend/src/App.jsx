import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/HomePage/Home';
import LoginPage from './Pages/Login/LoginPage';
import SignupPage from './Pages/SignupPage/SignupPage';
import DonationPage from './Pages/DonationPage/DonationPage';
import FeedPage from './Pages/FeedPage/FeedPage';
import { ProfilePage } from './Pages/ProfilePage/ProfilePage';
import HistoryPage from './Pages/HistoryPage/HistoryPage';
import AdminPage from './Pages/AdminPage/AdminPage';
import './index.css';
import PrivateRoute from './Components/PrivateRoute/PrivateRoute';
import HeaderMegaMenu from './Components/NavBar/HeaderMegaMenu';

function App() {
  return (
    <Router>
        <HeaderMegaMenu/>
        <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/signup' element={<SignupPage/>}/>
            <Route path='/feed' element={<FeedPage/>}/>
            
            <Route element={<PrivateRoute/>}>
              <Route path='/profile' element={<ProfilePage/>}/>
              <Route path='/donate' element={<DonationPage/>}/>
              <Route path='/history' element={<HistoryPage/>}/>
              <Route path='/admin' element={<AdminPage/>}/>
            </Route>
        </Routes>
    </Router>
  )
}

export default App;


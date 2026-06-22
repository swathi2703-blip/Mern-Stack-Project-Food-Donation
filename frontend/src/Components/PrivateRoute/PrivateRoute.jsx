import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getToken, removeUser } from '../../redux/slices/User';

const PrivateRoute = () => {

    const dispatch = useDispatch();
    const token = useSelector(getToken);
    const location = useLocation();

    if(!token) {
        dispatch(removeUser())
        return <Navigate to="/signup" replace state={{ from: location }} />
    }
    return <Outlet/>
}

export default PrivateRoute

import {List, Folder, House, LogOut} from 'lucide-react'; 
import geoparkLogo from '../../Assets/GeoparkLogo.svg';
import './PolicyMakerNavbar.scss'; // Importa o CSS para estilizar a Navbar
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

    const navigate = useNavigate();

    const handleHomeClick = () => {
        navigate('/policy-maker/homepage');
    };
    const handleDashboardClick = () => {
        navigate('/policy-maker/dashboard');
    }
    const handleReportsClick = () => {
        navigate('/policy-maker/reports');
    }
    const handleLogoutClick = () => {
        localStorage.removeItem('user'); // Remove o usuário do localStorage
        navigate('/'); // Redireciona para a página de login
    };

    return (
        <>
            <nav className="navbar">
                <img src={geoparkLogo} alt="Geopark" className="navbar-logo" />
                <div className="navbar-links">
                    <div onClick={() => handleHomeClick()}>
                        <House size={24} className="menu-icon" />
                        <div><i className="fa fa-home" />Início</div>
                    </div>
                    <div onClick={() => handleDashboardClick()}>
                        <List size={24} className="menu-icon" />
                        <div><i className="fa fa-file-alt" /> Dados Gerais</div>
                    </div>
                    <div onClick={() => handleReportsClick()}>
                        <Folder size={24} className="menu-icon" />
                        <div><i className="fa fa-file-alt" /> Relatórios</div>
                    </div>
                    <div onClick={() => handleLogoutClick()}>
                        <LogOut size={24} className="menu-icon" />
                        <div><i className="fa fa-file-alt" /> Sair</div>
                    </div>
                </div>
            </nav>
        </>
    );
};
export default Navbar;
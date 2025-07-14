import {List, History, House, LogOut, Settings, NotebookPen} from 'lucide-react'; 
import geoparkLogo from '../../Assets/GeoparkLogo.svg';
import './CompanyNavbar.scss'; // Importa o CSS para estilizar a Navbar
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

    const navigate = useNavigate();

    const handleHomeClick = () => {
        navigate('/company/homepage');
    };
    const handleProcessesClick = () => {
        navigate('/company/active-processes');
    }
    const handleHistoryClick = () => {
        navigate('/company/history');
    }
    const handleSettingsClick = () => {
        navigate('/company/settings');
    }
    const handleLogoutClick = () => {
        localStorage.removeItem('user'); // Remove o usuário do localStorage
        navigate('/'); // Redireciona para a página de login
    };
    const handleRawMaterialsClick = () => {
        navigate('/company/raw-materials');
    }

    return (
        <>
            <nav className="company-navbar">
                <img src={geoparkLogo} alt="Geopark" className="navbar-logo" />
                <div className="company-navbar-links">
                    <div onClick={() => handleHomeClick()}>
                        <House size={24} className="menu-icon" />
                        <div><i className="fa fa-home" />Início</div>
                    </div>
                    <div onClick={() => handleProcessesClick()}>
                        <List size={24} className="menu-icon" />
                        <div><i className="fa fa-file-alt" /> Processos Ativos</div>
                    </div>
                    <div onClick={() => handleHistoryClick()}>
                        <History size={24} className="menu-icon" />
                        <div><i className="fa fa-file-alt" /> Histórico</div>
                    </div>
                    <div onClick={() => handleRawMaterialsClick()}>
                        <NotebookPen size={24} className="menu-icon" />
                        <div><i className="fa fa-file-alt" /> Matérias-Primas</div>
                    </div>
                    <div onClick={() => handleSettingsClick()}>
                        <Settings size={24} className="menu-icon" />
                        <div><i className="fa fa-file-alt" /> Definições</div>
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
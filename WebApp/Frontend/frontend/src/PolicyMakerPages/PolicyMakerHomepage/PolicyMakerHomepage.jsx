import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PolicyMakerHomepage.scss';
import axios from 'axios';

// Icons
import producerIconUrlCompliant from '../../Assets/triangulo-producer-green.png';
import producerIconUrlNoCompliant from '../../Assets/triangulo-producer-red.png';
import factoryIconUrlCompliant from '../../Assets/circulo-manufacturer-green.png';
import factoryIconUrlNoCompliant from '../../Assets/circulo-manufacturer-red.png';
import vendorIconUrlCompliant from '../../Assets/quadrado-seller-green.png';
import vendorIconUrlNoCompliant from '../../Assets/quadrado-seller-red.png';
import geoparkLogo from '../../Assets/GeoparkLogo.svg';

// Novo componente
import CompanyDetails from '../../Components/CompanyDetails/CompanyDetails';
import Navbar from '../../Components/PolicyMakerNavbar/PolicyMakerNavbar';

const PolicyMakerHomepage = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [companyDetails, setCompanyDetails] = useState(null);
    const [certifications, setCertifications] = useState([]);
    const [selectedCertification, setSelectedCertification] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);

    const [visibleTypes, setVisibleTypes] = useState({
        producer: true,
        manufacturer: true,
        seller: true,
    });

    const toggleType = (type) => {
        setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [certificationsResponse, companiesResponse] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/get-certifications/'),
                    axios.get('http://127.0.0.1:8000/api/list-companies'),
                ]);

                const certificationsData = certificationsResponse.data;
                setCertifications(certificationsData);
                if (certificationsData.length > 0) {
                    setSelectedCertification(certificationsData[0].name);
                }

                const companiesData = companiesResponse.data;
                const companiesWithCompliance = await Promise.all(
                    companiesData.map(async (company) => {
                        try {
                            const certResponse = await axios.get(
                                `http://127.0.0.1:8000/api/get-active-certifications/${company.id}`
                            );
                            const activeCertifications = certResponse.data;

                            const compliance = {};
                            certificationsData.forEach((cert) => {
                                compliance[cert.name] = activeCertifications.some(
                                    (activeCert) =>
                                        activeCert.name === cert.name || activeCert.id === cert.id
                                );
                            });

                            return {
                                ...company,
                                latitude: company.location?.latitude || company.latitude,
                                longitude: company.location?.longitude || company.longitude,
                                compliance,
                            };
                        } catch {
                            const compliance = {};
                            certificationsData.forEach((cert) => {
                                compliance[cert.name] = false;
                            });

                            return {
                                ...company,
                                latitude: company.location?.latitude || company.latitude,
                                longitude: company.location?.longitude || company.longitude,
                                compliance,
                            };
                        }
                    })
                );

                setCompanies(companiesWithCompliance);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };

        fetchAllData();
    }, []);

    const getCompanyIcon = (type, compliant) => {
        let iconUrl;
        switch (type) {
            case 'producer':
                iconUrl = compliant ? producerIconUrlCompliant : producerIconUrlNoCompliant;
                break;
            case 'manufacturer':
                iconUrl = compliant ? factoryIconUrlCompliant : factoryIconUrlNoCompliant;
                break;
            case 'seller':
            default:
                iconUrl = compliant ? vendorIconUrlCompliant : vendorIconUrlNoCompliant;
        }

        return new L.Icon({
            iconUrl,
            iconSize: [25, 25],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            className: compliant ? 'icon-compliant' : 'icon-noncompliant',
        });
    };

    const getCompanyDetails = (company) => {
        try {
            axios.get(`http://127.0.0.1:8000/api/get-company-details/${company.id}`)
                .then(response => {
                    setCompanyDetails(response.data);
                    setSelectedCompany(company);
                });
        } catch (error) {
            console.error('Erro ao buscar detalhes da empresa:', error);
        }
    };

    const seeMore = () => {
        if (selectedCompany) {
            navigate('/policy-maker/company-details', { state: { company: selectedCompany } });
            console.log("Ver mais detalhes da empresa:", selectedCompany);
        }
    };

    return (
        <div className="policy-page-wrapper">
            {/* NAVBAR */}
            <Navbar />
            <div className="content-wrapper">
                {/* SIDEBAR */}
                <aside className="sidebar">
                    <h4>Filtros:</h4>
                    <div className="filters">
                        <button className={visibleTypes.producer ? 'active' : ''} onClick={() => toggleType('producer')}>
                            <span className="icon producer" /> Produtores
                        </button>
                        <button className={visibleTypes.manufacturer ? 'active' : ''} onClick={() => toggleType('manufacturer')}>
                            <span className="icon manufacturer" /> Fabricantes
                        </button>
                        <button className={visibleTypes.seller ? 'active' : ''} onClick={() => toggleType('seller')}>
                            <span className="icon seller" /> Vendedores
                        </button>
                    </div>

                    <div className="certification-selector">
                        <label htmlFor="certification">Certificação:</label>
                        <select
                            id="certification"
                            value={selectedCertification}
                            onChange={(e) => setSelectedCertification(e.target.value)}
                        >
                            {certifications.map((cert) => (
                                <option key={cert.id} value={cert.name}>
                                    {cert.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Detalhes da empresa selecionada */}
                    {selectedCompany && (
                        <CompanyDetails company={companyDetails} onSeeMore={seeMore} />
                    )}
                </aside>

                {/* MAPA */}
                <div className="map-wrapper" style={{ position: 'relative' }}>
                    <MapContainer center={[40.4, -7.6]} zoom={10} className="map-container">
                        <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {companies
                            ?.filter((company) => visibleTypes[company.type])
                            ?.map((company) => (
                                <Marker
                                    key={company.id}
                                    position={[company.latitude, company.longitude]}
                                    icon={getCompanyIcon(company.type, company?.compliance[selectedCertification])}
                                >
                                    <Popup>
                                        <strong>{company.name}</strong><br />
                                        Compliance: {company?.compliance[selectedCertification] ? 'Sim' : 'Não'}<br />
                                        Localização: {company.location.street}, {company.location.city}<br />
                                        <button className="details-button" onClick={() => getCompanyDetails(company)}>
                                            Ver Detalhes
                                        </button>
                                    </Popup>
                                </Marker>
                            ))}
                    </MapContainer>

                    {/* LEGENDA */}
                    {/* LEGENDA */}
                    <div className="map-legend" style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        background: 'white',
                        padding: '8px',
                        borderRadius: '5px',
                        boxShadow: '0 0 5px rgba(0,0,0,0.3)',
                        fontSize: '14px',
                        zIndex: 1000
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{
                                width: 20,
                                height: 12,
                                backgroundColor: 'green',
                                marginRight: 5
                            }}></div>
                            Possui certificação
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                                width: 20,
                                height: 12,
                                backgroundColor: 'red',
                                marginRight: 5
                            }}></div>
                            Não possui certificação
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyMakerHomepage;

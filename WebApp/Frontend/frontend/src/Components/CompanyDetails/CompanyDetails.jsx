import React from 'react';
import './CompanyDetails.scss';

// Ícones podem ser SVGs ou classes de ícones dependendo do que usas no projeto.
import { MapPin, Footprints, Waves, Zap } from 'lucide-react'; // Exemplo com lucide-react

const CompanyDetails = ({ company, onSeeMore }) => {
  if (!company) return null;

  console.log("Company Details:", company);

  return (
    <div className="company-details">
      <h3>{company.company_details.name}</h3>

      <div className="detail-row">
        <MapPin size={18} />
        <div>
          <strong>Localização</strong>
          <p>{company.company_details.location?.street}, {company.company_details.location?.city}</p>
        </div>
      </div>

      <div className="detail-row">
        <Footprints size={18} />
        <div>
          <strong>Pegada Ecológica</strong>
          <p>{company.ecological_footprint ?? '—'} gha</p>
        </div>
      </div>

      <div className="detail-row">
        <Waves size={18} />
        <div>
          <strong>Consumo total de água</strong>
          <p>{company.total_water_consumption ?? '—'} litros</p>
        </div>
      </div>

      <div className="detail-row">
        <Zap size={18} />
        <div>
          <strong>Consumo total de energia</strong>
          <p>{company.total_energy_consumption ?? '—'} kW</p>
        </div>
      </div>

      <button className="see-more" onClick={onSeeMore}>Ver mais</button>
    </div>
  );
};

export default CompanyDetails;

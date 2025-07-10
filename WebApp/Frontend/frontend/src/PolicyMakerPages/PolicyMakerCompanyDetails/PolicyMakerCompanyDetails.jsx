import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './PolicyMakerCompanyDetails.scss';
import axios from 'axios';
import Navbar from '../../Components/PolicyMakerNavbar/PolicyMakerNavbar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const filterByTime = (timeline, time) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  if (time === 'lastQuarter') {
    const last3 = [2, 1, 0].map(i => (currentMonth - i + 12) % 12);
    const last3Months = last3.map(i => months[i]);

    const yearData = timeline.find(y => y.year === currentYear);
    if (!yearData) return [];

    return yearData.data.filter(item => last3Months.includes(item.month));
  }

  if (time === 'lastYear') {
    const yearData = timeline.find(y => y.year === currentYear - 1);
    return yearData ? yearData.data : [];
  }

  if (time === 'total') {
    return timeline.flatMap(yearItem =>
      (yearItem.data || []).map(monthItem => ({
        ...monthItem,
        month: `${monthItem.month} ${yearItem.year}`
      }))
    );
  }

  return [];
};

export default function PolicyMakerCompanyDetails() {
  const { state } = useLocation();
  const { company } = state;

  const [companyDetails, setCompanyDetails] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [revenueTime, setRevenueTime] = useState('total');
  const [ecoTime, setEcoTime] = useState('total');
  const [resourceTime, setResourceTime] = useState('total');

    useEffect(() => {
    // busca detalhes básicos da empresa
    axios.get(`http://127.0.0.1:8000/api/company-details/${company.id}`)
        .then(response => {
        setCompanyDetails(response.data);
        console.log(response.data);
        })
        .catch(error => {
        console.error('Erro ao buscar detalhes da empresa:', error);
        });
    }, [company.id]);

    useEffect(() => {
    // busca dados dos gráficos e adiciona no companyDetails
    axios.get(`http://127.0.0.1:8000/api/company-charts-data/${company.id}`)
        .then(response => {
        setChartsData(response.data);
        console.log(response.data);
        })
        .catch(error => {
        console.error('Erro ao buscar dados dos gráficos:', error);
        });
    }, [company.id]);

  const revenueFiltered = useMemo(() => {
    return chartsData?.revenue_timeline ? filterByTime(chartsData.revenue_timeline, revenueTime) : [];
  }, [chartsData, revenueTime]);

  const ecoFootprintFiltered = useMemo(() => {
    return chartsData?.eco_footprint_timeline ? filterByTime(chartsData.eco_footprint_timeline, ecoTime) : [];
  }, [chartsData, ecoTime]);

  const resourceUsageFiltered = useMemo(() => {
    return chartsData?.resource_consumption_timeline ? filterByTime(chartsData.resource_consumption_timeline, resourceTime) : [];
  }, [chartsData, resourceTime]);

  return (
    <div className="company-details-page">
      <Navbar />
      <div className="page-content">
        <aside className="sidebar">
          <h2>{company.name}</h2>
          <p><strong>Endereço:</strong> {company.location.street}, {company.location.city}, {company.location.county}</p>
          <p><strong>Certificações:</strong></p>
          {companyDetails?.certifications?.length > 0 ? (
            <ul>
              {companyDetails.certifications.map((cert, idx) => (
                <li key={idx}>{cert.name}</li>
              ))}
            </ul>
          ) : (
            <p>A carregar certificações ou nenhuma encontrada.</p>
          )}
        </aside>

        {companyDetails && (
          <section className="company-details">
            <h1>Informações de Produção</h1>
            <p><strong>Quantidade Anual Produzida:</strong> {companyDetails.annual_production_quantity} unidades</p>
            <p><strong>Funcionários:</strong> {companyDetails?.employee_stats?.total} (Homens: {companyDetails?.employee_stats?.male}, Mulheres: {companyDetails?.employee_stats?.female})</p>

            <h2>Tipos de Produtos</h2>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Quantidade Produzida</th>
                </tr>
              </thead>
              <tbody>
                {companyDetails.production_by_type &&
                  Object.entries(companyDetails.production_by_type).map(([type, quantity], idx) => (
                    <tr key={idx}>
                      <td>{type}</td>
                      <td>{quantity}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <h2>Matérias-Primas Usadas</h2>
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Fornecedor</th>
                  <th>Localização</th>
                  <th>Quantidade Usada</th>
                  <th>Data de Compra</th>
                </tr>
              </thead>
              <tbody>
                {companyDetails.raw_products?.map((raw, idx) => (
                  <tr key={idx}>
                    <td>{raw.raw_product.name}</td>
                    <td>{raw.raw_product.producer.name}</td>
                    <td>{raw.raw_product.production_location.city}</td>
                    <td>{raw.quantity_used}</td>
                    <td>{raw.raw_product.buy_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <section className="chart-section">
              <div className="chart-header">
                <h2>Receita ao Longo do Tempo</h2>
                <select value={revenueTime} onChange={e => setRevenueTime(e.target.value)}>
                  <option value="total">Dados Totais</option>
                  <option value="lastYear">Último Ano</option>
                  <option value="lastQuarter">Último Trimestre</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueFiltered}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Receita (€)" stroke="#2563eb" />
                </LineChart>
              </ResponsiveContainer>
            </section>

            <section className="chart-section">
              <div className="chart-header">
                <h2>Resíduos Gerados</h2>
                <select value={ecoTime} onChange={e => setEcoTime(e.target.value)}>
                  <option value="total">Dados Totais</option>
                  <option value="lastYear">Último Ano</option>
                  <option value="lastQuarter">Último Trimestre</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ecoFootprintFiltered}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Resíduos Gerados (Kg)" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </section>

            <section className="chart-section">
              <div className="chart-header">
                <h2>Consumo de Recursos</h2>
                <select value={resourceTime} onChange={e => setResourceTime(e.target.value)}>
                  <option value="total">Dados Totais</option>
                  <option value="lastYear">Último Ano</option>
                  <option value="lastQuarter">Último Trimestre</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={resourceUsageFiltered}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="water" stroke="#0ea5e9" name="Água (L)" />
                  <Line type="monotone" dataKey="energy" stroke="#f97316" name="Energia (kWh)" />
                </LineChart>
              </ResponsiveContainer>
            </section>
          </section>
        )}
      </div>
    </div>
  );
}

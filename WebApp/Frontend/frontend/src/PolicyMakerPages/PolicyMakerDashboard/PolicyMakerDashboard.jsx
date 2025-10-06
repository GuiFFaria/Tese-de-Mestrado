import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie,
  XAxis, YAxis,
  Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { useState, useEffect } from 'react';
import './PolicyMakerDashboard.scss';
import Navbar from '../../Components/PolicyMakerNavbar/PolicyMakerNavbar';
// import axios from 'axios';

// Função para achatar os dados por ano
const flattenTimeline = (data) =>
  data.flatMap(yearObj => yearObj.data.map((entry, idx) => ({
    ...entry,
    year: yearObj.year,
    index: idx,
    label: `${entry.month} ${yearObj.year}`,
  })));

const filterByTime = (data, time) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based

  const flattened = flattenTimeline(data);

  if (time === 'total') return flattened;

  if (time === 'lastYear') {
    return flattened.filter(d => d.year === currentYear - 1);
  }

  if (time === 'lastQuarter') {
    const last3Months = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last3Months.push({ year: date.getFullYear(), month: date.getMonth() });
    }

    return flattened.filter(d =>
      last3Months.some(m => m.year === d.year && m.month === d.index)
    );
  }

  return flattened;
};

// MOCK DATA GENERATORS
const generateMockTimelineData = () => {
  const now = new Date();
  const startYear = now.getFullYear() - 2;
  const data = [];

  for (let year = startYear; year <= now.getFullYear(); year++) {
    const months = [];
    const maxMonth = year === now.getFullYear() ? now.getMonth() : 11;

    for (let i = 0; i <= maxMonth; i++) {
      months.push({
        month: new Date(0, i).toLocaleString('pt-PT', { month: 'short' }),
        revenue: Math.floor(50000 + Math.random() * 10000),
        jobs: Math.floor(300 + Math.random() * 100),
        female: Math.floor(120 + Math.random() * 50),
        male: Math.floor(180 + Math.random() * 50),
      });
    }

    data.push({ year, data: months });
  }

  return data;
};

const generateMockResourceConsumption = () => {
  const now = new Date();
  const startYear = now.getFullYear() - 2;
  const data = [];

  for (let year = startYear; year <= now.getFullYear(); year++) {
    const months = [];
    const maxMonth = year === now.getFullYear() ? now.getMonth() : 11;

    for (let i = 0; i <= maxMonth; i++) {
      months.push({
        month: new Date(0, i).toLocaleString('pt-PT', { month: 'short' }),
        water: Math.floor(10000 + Math.random() * 20000),
        energy: Math.floor(20000 + Math.random() * 30000),
      });
    }

    data.push({ year, data: months });
  }

  return data;
};

const generateMockEcoFootprint = () => {
  const now = new Date();
  const startYear = now.getFullYear() - 2;
  const data = [];

  for (let year = startYear; year <= now.getFullYear(); year++) {
    const months = [];
    const maxMonth = year === now.getFullYear() ? now.getMonth() : 11;

    for (let i = 0; i <= maxMonth; i++) {
      months.push({
        month: new Date(0, i).toLocaleString('pt-PT', { month: 'short' }),
        footprint: Math.floor(1000 + Math.random() * 5000),
      });
    }

    data.push({ year, data: months });
  }

  return data;
};

// Dados simulados
const mockSummary = {
  "receita gerada": 550000,
  "água consumida": 1500000,
  "energia consumida": 2200000,
  "Resíduos gerados": 180000,
  "male Employees": 1200,
  "female Employees": 950
};

const mockCompanyDistribution = [
  { name: 'Produtores', value: 12 },
  { name: 'Queijarias', value: 45 },
  { name: 'Vendedores', value: 20 }
];

const mockEcoByCompany = [
  { name: 'Produtores', value: 80000 },
  { name: 'Queijarias', value: 60000 },
  { name: 'Vendedores', value: 40000 }
];

export default function PolicyMakerDashboard() {
  const [economicTime, setEconomicTime] = useState('total');
  const [employmentTime, setEmploymentTime] = useState('total');
  const [environmentTime, setEnvironmentTime] = useState('total');

  const [economicData, setEconomicData] = useState([]);
  const [employmentData, setEmploymentData] = useState([]);
  const [environmentData, setEnvironmentData] = useState([]);
  const [ecoFootprintData, setEcoFootprintData] = useState([]);

  const [data, setData] = useState({
    summary: mockSummary,
    timeline: generateMockTimelineData(),
    resourceConsumption: generateMockResourceConsumption(),
    companyDistribution: mockCompanyDistribution,
    ecoFootprintTimeline: generateMockEcoFootprint(),
    ecoByCompany: mockEcoByCompany
  });

  // ⚠️ Quando quiser reativar a API, descomente este bloco
  /*
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/dashboard/summary/')
      .then(response => {
        const newData = response.data;
        setData(newData);

        setEconomicData(filterByTime(newData.timeline, economicTime));
        setEmploymentData(filterByTime(newData.timeline, employmentTime));
        setEnvironmentData(filterByTime(newData.resourceConsumption, environmentTime));
        setEcoFootprintData(filterByTime(newData.ecoFootprintTimeline, environmentTime));
      })
      .catch(error => {
        console.error('Erro ao buscar dados do dashboard:', error);
      });
  }, []);
  */

  useEffect(() => {
    setEconomicData(filterByTime(data.timeline, economicTime));
  }, [economicTime, data.timeline]);

  useEffect(() => {
    setEmploymentData(filterByTime(data.timeline, employmentTime));
  }, [employmentTime, data.timeline]);

  useEffect(() => {
    setEnvironmentData(filterByTime(data.resourceConsumption, environmentTime));
    setEcoFootprintData(filterByTime(data.ecoFootprintTimeline, environmentTime));
  }, [environmentTime, data.resourceConsumption, data.ecoFootprintTimeline]);

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-content">
        <h2>Dashboard da Cadeia de Distribuição</h2>

        {/* Secção Geral */}
        <div className="section">
          <h3>Dados Gerais</h3>
          <div className="kpi-cards">
            {Object.entries(data.summary)
              .filter(([label]) => label !== 'male Employees' && label !== 'female Employees')
              .map(([label, value]) => (
                <div className="kpi-card" key={label}>
                  <h4>{label.toUpperCase()}</h4>
                  <p>
                    {label === 'receita gerada' ? `${value} €` :
                      label === 'água consumida' ? `${value} L` :
                        label === 'energia consumida' ? `${value} kW` :
                          label === 'Resíduos gerados' ? `${value} Kg` :
                            value}
                  </p>
                </div>
              ))}
          </div>

          <div className="small-charts-grid">
            <div className="chart-box">
              <h4>Distribuição de Empresas</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.companyDistribution} dataKey="value" nameKey="name" fill="#009fe3" label={false}>
                    <Cell fill="#009fe3" />
                    <Cell fill="#00c2f3" />
                    <Cell fill="#ff7300" />
                  </Pie>
                  <Tooltip />
                  <Legend align='right' verticalAlign='bottom' height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h4>Distribuição de Empregados</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Feminino', value: data.summary['female Employees'] },
                      { name: 'Masculino', value: data.summary['male Employees'] }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    fill="#00c2f3"
                    label={false}>
                    <Cell fill="#ff007f" />
                    <Cell fill="#00c2f3" />
                  </Pie>
                  <Tooltip />
                  <Legend align='right' verticalAlign='bottom' height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Económico */}
        <div className="section">
          <div className="section-header">
            <h3>Dados Económicos</h3>
            <select className="time-filter" value={economicTime} onChange={e => setEconomicTime(e.target.value)}>
              <option value="total">Dados Totais</option>
              <option value="lastYear">Último Ano</option>
              <option value="lastQuarter">Último Trimestre</option>
            </select>
          </div>

          <div className="wide-chart">
            <h4>Receita Gerada</h4>
            <ResponsiveContainer width="100%" height={275}>
              <BarChart data={economicData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#00c2f3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Empregabilidade */}
        <div className="section">
          <div className="section-header">
            <h3>Empregabilidade</h3>
            <select className="time-filter" value={employmentTime} onChange={e => setEmploymentTime(e.target.value)}>
              <option value="total">Dados Totais</option>
              <option value="lastYear">Último Ano</option>
              <option value="lastQuarter">Último Trimestre</option>
            </select>
          </div>

          <div className="wide-chart">
            <h4>Comparação de Postos de Trabalho</h4>
            <ResponsiveContainer width="100%" height={275}>
              <LineChart data={employmentData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="jobs" stroke="#008000" name="Total" />
                <Line type="monotone" dataKey="female" stroke="#ff69b4" name="Feminino" />
                <Line type="monotone" dataKey="male" stroke="#0074D9" name="Masculino" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ambiental */}
        <div className="section">
          <div className="section-header">
            <h3>Indicadores Ambientais</h3>
            <select className="time-filter" value={environmentTime} onChange={e => setEnvironmentTime(e.target.value)}>
              <option value="total">Dados Totais</option>
              <option value="lastYear">Último Ano</option>
              <option value="lastQuarter">Último Trimestre</option>
            </select>
          </div>

          <div className="wide-chart">
            <h4>Consumo de Água e Energia</h4>
            <ResponsiveContainer width="100%" height={275}>
              <LineChart data={environmentData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="water" stroke="#009fe3" />
                <Line type="monotone" dataKey="energy" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="wide-chart">
            <h4>Resíduos Gerados</h4>
            <ResponsiveContainer width="100%" height={275}>
              <LineChart data={ecoFootprintData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="footprint" stroke="#00c2f3" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h4>Resíduos gerados por tipo de empresa</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.ecoByCompany}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                >
                  <Cell fill="#009fe3" />
                  <Cell fill="#00c2f3" />
                  <Cell fill="#ff7300" />
                </Pie>
                <Tooltip />
                <Legend align='right' verticalAlign='bottom' height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// File: ReportByRegion.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PolicyMakerReports.scss';
import Navbar from '../../Components/PolicyMakerNavbar/PolicyMakerNavbar';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Import Chart.js stuff
import { Chart, registerables } from 'chart.js';
import { Line as ChartLine } from 'react-chartjs-2';
Chart.register(...registerables);

const filterByTime = (timeline, time) => {
  if (!timeline) {
    return [];
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  if (time === 'lastQuarter') {
    // Pega últimos 3 meses incluindo o atual
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const last3 = [2, 1, 0].map(i => (currentMonth - i + 12) % 12);
    const last3Months = last3.map(i => months[i]);

    // Encontra ano atual no timeline
    const yearData = timeline.find(y => y.year === currentYear);
    if (!yearData) return [];

    return yearData.data.filter(item => last3Months.includes(item.month));
  }

  if (time === 'lastYear') {
    const yearData = timeline.find(y => y.year === currentYear - 1);
    return yearData ? yearData.data : [];
  }

  if (time === 'total') {
    // Flatten todos os dados e adiciona referência ao ano
    return timeline.flatMap(yearItem =>
      (yearItem.data || []).map(monthItem => ({
        ...monthItem,
        month: `${monthItem.month} ${yearItem.year}`,
        year: yearItem.year
      }))
    );
  }

  return [];
};

export default function PolicyMakerReports() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedZone, setSelectedZone] = useState('Geopark'); // Inicializar com 'Geopark'
  const [availableZones, setAvailableZones] = useState([]);
  const [ecoTime, setEcoTime] = useState('total');
  const [envTime, setEnvTime] = useState('total');
  const [revenueTime, setRevenueTime] = useState('total');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processRevenueData = (companies, time) => {
    if (!companies || companies.length === 0) return [];

    // Coletar todos os meses únicos
    const allMonthsSet = new Set();
    const companyDataMap = {};

    companies.forEach(company => {
      const filteredTimeline = filterByTime(company.timeline || [], time);
      companyDataMap[company.name] = {};
      
      filteredTimeline.forEach(item => {
        const monthKey = item.month;
        allMonthsSet.add(monthKey);
        companyDataMap[company.name][monthKey] = item.value || item.revenue || 0;
      });
    });

    // Ordenar meses
    const sortedMonths = Array.from(allMonthsSet).sort((a, b) => {
      const parseMonth = (str) => {
        const parts = str.split(' ');
        const month = parts[0];
        const year = parts[1] ? parseInt(parts[1]) : new Date().getFullYear();
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return new Date(year, months.indexOf(month));
      };
      return parseMonth(a) - parseMonth(b);
    });

    // Construir dados para o gráfico
    return sortedMonths.map(month => {
      const dataPoint = { month };
      companies.forEach(company => {
        dataPoint[company.name] = companyDataMap[company.name][month] || 0;
      });
      return dataPoint;
    });
  };

  // useMemo corrigidos para os dados filtrados
  const ecoFootprintFiltered = useMemo(() => {
    if (!data || selectedZone === 'Geopark') return [];
    const filtered = filterByTime(data.ecoFootprintTimeline, ecoTime);
    
    // Garantir que os dados têm a estrutura correta
    return filtered.map(item => ({
      month: item.month,
      value: item.value || item.waste || 0,
      ...item
    }));
  }, [data, ecoTime, selectedZone]);

  const resourceConsumptionFiltered = useMemo(() => {
    if (!data || selectedZone === 'Geopark') return [];
    const filtered = filterByTime(data.resourceConsumption, envTime);
    
    // Os dados de recursos podem ter água e energia
    return filtered.map(item => ({
      month: item.month,
      water: item.water || 0,
      energy: item.energy || 0,
      // Para compatibilidade com gráfico único, usar soma ou valor principal
      value: (item.water || 0) + (item.energy || 0) || item.value || 0,
      ...item
    }));
  }, [data, envTime, selectedZone]);

  const revenueByCompanyFiltered = useMemo(() => {
    if (!data || !data.revenueByCompanyTimeline || selectedZone === 'Geopark') return [];
    
    return processRevenueData(data.revenueByCompanyTimeline, revenueTime);
  }, [data, revenueTime, selectedZone]);

  // Função para gerar cores dinâmicas para empresas
  const generateCompanyColors = (companies) => {
    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#f43f5e', '#6366f1', '#8b5cf6', '#06b6d4', '#84cc16'];
    return companies.map((_, index) => COLORS[index % COLORS.length]);
  };

  const companyColors = data?.revenueByCompanyTimeline ? 
    generateCompanyColors(data.revenueByCompanyTimeline) : [];

  // Função para construir dados do gráfico
  const buildChartData = (kpi) => {
    if (!data || data.type !== 'global') return null;

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'];

    if (kpi === 'resourceConsumption') {
      // Para recursos naturais, vamos processar água e energia separadamente
      const allMonthsSet = new Set();
      const waterDatasets = [];
      const energyDatasets = [];
      
      data.allZones.forEach((zoneData, idx) => {
        const timeline = zoneData[kpi] || [];
        
        // Flatten dos dados para obter todos os meses
        const flatTimeline = timeline.flatMap(year => {
          if (!Array.isArray(year?.data)) {
            console.warn("Ano inválido ou sem dados:", year);
            return [];
          }
          return year.data.map(m => ({
            ...m,
            month: `${m.month} ${year.year}`
          }));
        });

        // Adicionar todos os meses ao Set
        flatTimeline.forEach(item => allMonthsSet.add(item.month));

        // Criar mapas para água e energia desta zona
        const waterMonthMap = {};
        const energyMonthMap = {};

        flatTimeline.forEach(item => {
          const key = item.month;
          waterMonthMap[key] = (waterMonthMap[key] || 0) + (item.water || 0);
          energyMonthMap[key] = (energyMonthMap[key] || 0) + (item.energy || 0);
        });

        // Adicionar datasets para esta zona
        waterDatasets.push({
          label: zoneData.zone,
          data: [], // Será preenchido depois
          borderColor: COLORS[idx % COLORS.length],
          backgroundColor: COLORS[idx % COLORS.length] + '88',
          fill: false,
          tension: 0.3,
          monthMap: waterMonthMap
        });

        energyDatasets.push({
          label: zoneData.zone,
          data: [], // Será preenchido depois
          borderColor: COLORS[idx % COLORS.length],
          backgroundColor: COLORS[idx % COLORS.length] + '88',
          fill: false,
          tension: 0.3,
          monthMap: energyMonthMap
        });
      });

      // Ordenar meses cronologicamente
      const allMonths = Array.from(allMonthsSet);
      allMonths.sort((a, b) => {
        const parse = str => {
          const [m, y] = str.split(' ');
          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          return new Date(+y, months.indexOf(m));
        };
        return parse(a) - parse(b);
      });

      // Preencher os dados ordenados para cada dataset
      waterDatasets.forEach(dataset => {
        dataset.data = allMonths.map(month => dataset.monthMap[month] || 0);
        delete dataset.monthMap; // Limpar referência temporária
      });

      energyDatasets.forEach(dataset => {
        dataset.data = allMonths.map(month => dataset.monthMap[month] || 0);
        delete dataset.monthMap; // Limpar referência temporária
      });

      // Retornar dados estruturados para água e energia
      return {
        water: {
          label: 'Consumo de Água',
          chartData: {
            labels: allMonths,
            datasets: waterDatasets
          }
        },
        energy: {
          label: 'Consumo de Energia',
          chartData: {
            labels: allMonths,
            datasets: energyDatasets
          }
        }
      };
    } else {
      // Processar outros KPIs (código existente mantido)
      const allMonthsSet = new Set();
      const allDatasets = [];

      data.allZones.forEach((zoneData, idx) => {
        const timeline = zoneData[kpi] || [];
        
        const flatTimeline = kpi === 'revenueByCompanyTimeline'
          ? timeline.flatMap(c => (c.timeline || []))
          : timeline.flatMap(year => {
              if (!Array.isArray(year?.data)) {
                console.warn("Ano inválido ou sem dados:", year);
                return [];
              }
              return year.data.map(m => ({
                ...m,
                month: `${m.month} ${year.year}`
              }));
            });

        flatTimeline.forEach(item => allMonthsSet.add(item.month));

        const monthMap = {};
        flatTimeline.forEach(item => {
          const key = item.month;
          const value = kpi === 'revenueByCompanyTimeline' ? (item.revenue || 0) : (item.waste || item.value || 0);
          monthMap[key] = (monthMap[key] || 0) + value;
        });

        allDatasets.push({
          label: zoneData.zone,
          data: [],
          borderColor: COLORS[idx % COLORS.length],
          backgroundColor: COLORS[idx % COLORS.length] + '88',
          fill: false,
          tension: 0.3,
          monthMap,
        });
      });

      // Ordenar meses e preencher os dados
      const allMonths = Array.from(allMonthsSet);
      allMonths.sort((a, b) => {
        const parse = str => {
          const [m, y] = str.split(' ');
          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          return new Date(+y, months.indexOf(m));
        };
        return parse(a) - parse(b);
      });

      allDatasets.forEach(dataset => {
        dataset.data = allMonths.map(month => dataset.monthMap[month] || 0);
        delete dataset.monthMap; // Limpar referência temporária
      });

      const KPI_LABELS = {
        ecoFootprintTimeline: 'Resíduos Gerados',
        resourceConsumption: 'Consumo de Recursos Naturais',
        revenueByCompanyTimeline: 'Receita Total',
      };

      return {
        label: KPI_LABELS[kpi],
        chartData: {
          labels: allMonths,
          datasets: allDatasets
        }
      };
    }
  };

  // Configuração corrigida do useMemo para gráficos comparativos
  const comparativeCharts = useMemo(() => {
    if (!data || data.type !== 'global') return null;

    const results = [];
    const KPIs = ['ecoFootprintTimeline', 'resourceConsumption', 'revenueByCompanyTimeline'];

    KPIs.forEach(kpi => {
      const chartData = buildChartData(kpi);
      
      if (kpi === 'resourceConsumption' && chartData) {
        // Para recursos naturais, adicionar ambos os gráficos
        results.push(chartData.water);
        results.push(chartData.energy);
      } else if (chartData) {
        // Para outros KPIs, adicionar normalmente
        results.push(chartData);
      }
    });

    return results;
  }, [data]);

  // Carregar zonas disponíveis
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/report/zones/');
        setAvailableZones(response.data);
      } catch (error) {
        console.error('Erro ao buscar zonas disponíveis:', error);
        setError('Erro ao carregar zonas disponíveis');
      }
    };

    fetchZones();
  }, []);

  // Carregar dados baseado na zona selecionada
  useEffect(() => {
    const fetchData = async () => {
      if (availableZones.length === 0) return; // Esperar até as zonas serem carregadas

      setLoading(true);
      setError(null);
      
      try {
        if (selectedZone === 'Geopark') {
          // Carregar dados de todos os concelhos para comparação
          const requests = availableZones.map(zone =>
            axios.get(`http://127.0.0.1:8000/api/report/by-region/?concelho=${zone}`)
              .then(res => ({ zone, ...res.data }))
          );

          const allData = await Promise.all(requests);
          setData({ type: 'global', allZones: allData });
        } else {
          // Carregar dados do concelho específico
          const response = await axios.get(`http://127.0.0.1:8000/api/report/by-region/?concelho=${selectedZone}`);
          setData(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedZone, availableZones]);

  const handleZoneChange = (e) => {
    const newZone = e.target.value;
    console.log('Alterando zona para:', newZone);
    setSelectedZone(newZone);
    setData(null); // Limpar dados anteriores
  };

  const handleVisitCompany = (company) => {
    navigate('/policy-maker/company-details', { state: { company } });
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'];


  return (
    <div className="report-container">
      <Navbar />
      <div className="report-content-box">
        <div className="report-header">
          <h2>Relatório por Concelho</h2>
          <select 
            value={selectedZone} 
            onChange={handleZoneChange} 
            className="zone-select"
            disabled={loading}
          >
            <option value="Geopark">Geopark</option>
            {availableZones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message" style={{ color: 'red', padding: '10px' }}>
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            Carregando dados...
          </div>
        )}

        {/* Renderizar gráfico comparação Geopark */}
        {selectedZone === 'Geopark' && data && data.type === 'global' && comparativeCharts && (
          <div className="report-section">
            <h3>Comparação entre Concelhos (Geopark)</h3>
            {comparativeCharts.map((chart, idx) => (
              <div key={idx} style={{ marginBottom: '50px' }}>
                <h4>{chart.label}</h4>
                <div style={{ width: '100%', height: 400 }}>
                  <ChartLine
                    data={chart.chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: 'top',
                          labels: {
                            usePointStyle: true,
                            padding: 20
                          }
                        },
                        tooltip: { 
                          mode: 'index', 
                          intersect: false,
                          callbacks: {
                            title: function(context) {
                              return `Mês: ${context[0].label}`;
                            },
                            label: function(context) {
                              return `${context.dataset.label}: ${context.parsed.y}`;
                            }
                          }
                        },
                      },
                      interaction: { mode: 'nearest', axis: 'x', intersect: false },
                      scales: {
                        x: { 
                          display: true, 
                          title: { display: true, text: 'Mês' },
                          grid: { display: false }
                        },
                        y: { 
                          display: true, 
                          title: { display: true, text: 'Valor' }, 
                          beginAtZero: true,
                          grid: { color: 'rgba(0,0,0,0.1)' }
                        },
                      },
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Renderizar dados do concelho selecionado */}
        {selectedZone !== 'Geopark' && data && data.summary && (
          <>
            <div className="report-summary-grid">
              {Object.entries(data.summary).map(([key, value]) => (
                <div key={key} className="summary-card">
                  <div className="summary-title">{key}</div>
                  <div className="summary-value">{value}</div>
                </div>
              ))}
            </div>

            <div className="report-section">
              <h3>Empresas no Concelho</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.companyList && data.companyList.map(company => (
                    <tr key={company.id}>
                      <td>{company.name}</td>
                      <td>{company.type}</td>
                      <td>
                        <button className="visit-button" onClick={() => handleVisitCompany(company)}>
                          Ver detalhes da Empresa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="report-section">
              <h3>Distribuição de Empresas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.companyDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={false}>
                    {data.companyDistribution && data.companyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend align='right' verticalAlign='bottom' height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="report-section">
              <div className="section-header">
                <h3>Resíduos Gerados</h3>
                <select 
                  className="time-filter" 
                  value={ecoTime} 
                  onChange={e => setEcoTime(e.target.value)}
                >
                  <option value="lastQuarter">Últimos 3 meses</option>
                  <option value="lastYear">Último ano</option>
                  <option value="total">Total</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={ecoFootprintFiltered}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    name="Resíduos Gerados"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Consumo de Recursos */}
            <div className="report-section">
              <div className="section-header">
                <h3>Consumo de Recursos Naturais (Mensal)</h3>
                <select 
                  className="time-filter" 
                  value={envTime} 
                  onChange={e => setEnvTime(e.target.value)}
                >
                  <option value="lastQuarter">Últimos 3 meses</option>
                  <option value="lastYear">Último ano</option>
                  <option value="total">Total</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={resourceConsumptionFiltered}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="water" 
                    stroke="#2563eb" 
                    name="Água"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#10b981" 
                    name="Energia"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Receita por Empresa */}
            <div className="report-section">
              <div className="section-header">
                <h3>Receita por Empresa (Mensal)</h3>
                <select 
                  className="time-filter" 
                  value={revenueTime} 
                  onChange={e => setRevenueTime(e.target.value)}
                >
                  <option value="lastQuarter">Últimos 3 meses</option>
                  <option value="lastYear">Último ano</option>
                  <option value="total">Total</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueByCompanyFiltered}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {data.revenueByCompanyTimeline && data.revenueByCompanyTimeline.map((company, idx) => (
                    <Line 
                      key={company.companyId || company.name} 
                      type="monotone" 
                      dataKey={company.name} 
                      stroke={companyColors[idx]} 
                      name={company.name}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
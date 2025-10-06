import React, { useState, useEffect } from 'react';
import './CompanyHistory.scss';
import CompanyNavbar from '../../Components/CompanyNavbar/CompanyNavbar';
// import axios from 'axios';

export default function CompanyHistory() {
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // const user = JSON.parse(localStorage.getItem('user'));

  // Preços de referência
  const precoPorUnidade = 25; // €
  const precoAgua = 0.002;     // €/L
  const precoEnergia = 0.2;    // €/kWh
  const precoHora = 7.5;       // €/hora

  // Dummy data com valores realistas
  const dummyData = [
    {
      batch_number: 'L001',
      start_date: '2025-05-01T08:00:00',
      unidades_produzidas: 100,
      unidades_fase1: 50,
      unidades_fase2: 30,
      unidades_fase3: 15,
      unidades_descartadas: 5,
      agua_utilizada: 25000, // litros
      energia_utilizada: 800, // kWh
      residuos_gerados: 120, // kg
      horas_trabalhador: 130,
    },
    {
      batch_number: 'L002',
      start_date: '2025-05-15T09:30:00',
      unidades_produzidas: 80,
      unidades_fase1: 40,
      unidades_fase2: 20,
      unidades_fase3: 10,
      unidades_descartadas: 10,
      agua_utilizada: 18000,
      energia_utilizada: 620,
      residuos_gerados: 90,
      horas_trabalhador: 100,
    },
  ];

  useEffect(() => {
    // Exemplo de integração futura
    /*
    axios.get(`http://127.0.0.1:8000/api/get-company-batch-data/${user.user_id}`)
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error("Erro ao obter dados dos lotes:", error);
      });
    */
    setData(dummyData);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setRowsPerPage(5);
      } else if (window.innerWidth < 1800) {
        setRowsPerPage(7);
      } else {
        setRowsPerPage(10);
      }
      setCurrentPage(1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let totalPages = Math.ceil(data.length / rowsPerPage);
  if (totalPages === 0) totalPages = 1;

  const currentRows = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calcularReceita = (lote) => {
    const vendidas = lote.unidades_produzidas - lote.unidades_descartadas;
    return (vendidas * precoPorUnidade).toFixed(2);
  };

  const calcularDespesa = (lote) => {
    const custoAgua = lote.agua_utilizada * precoAgua;
    const custoEnergia = lote.energia_utilizada * precoEnergia;
    const custoHoras = lote.horas_trabalhador * precoHora;
    return (custoAgua + custoEnergia + custoHoras).toFixed(2);
  };

  return (
    <div className="company-processes">
      <CompanyNavbar />
      <div className="company-processes-content">
        <div className="company-processes-header">
          <h1>Gestão de Lotes</h1>
        </div>
        <div className="company-processes-processes">
          <div className="company-processes-table-wrapper no-scroll">
            <table className="company-processes-table">
              <thead>
                <tr>
                  <th>Nº de Lote</th>
                  <th>Data de Início</th>
                  <th>Unidades Produzidas</th>
                  <th>Fabricação</th>
                  <th>Cura</th>
                  <th>Maturação</th>
                  <th>Descartadas</th>
                  <th>Água (L)</th>
                  <th>Energia (kWh)</th>
                  <th>Resíduos (Kg)</th>
                  <th>Horas Trab.</th>
                  <th>Receitas (€)</th>
                  <th>Despesas (€)</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="no-processes-row">
                      Não existem lotes disponíveis.
                    </td>
                  </tr>
                ) : (
                  currentRows.map((lote, index) => (
                    <tr key={index}>
                      <td>{lote.batch_number}</td>
                      <td>{formatDate(lote.start_date)}</td>
                      <td>{lote.unidades_produzidas}</td>
                      <td>{lote.unidades_fase1}</td>
                      <td>{lote.unidades_fase2}</td>
                      <td>{lote.unidades_fase3}</td>
                      <td>{lote.unidades_descartadas}</td>
                      <td>{lote.agua_utilizada}</td>
                      <td>{lote.energia_utilizada}</td>
                      <td>{lote.residuos_gerados}</td>
                      <td>{lote.horas_trabalhador}</td>
                      <td>{calcularReceita(lote)} €</td>
                      <td>{calcularDespesa(lote)} €</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="table-pagination">
            <button onClick={handlePrevious} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

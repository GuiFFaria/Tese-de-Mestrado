import React, { useState } from 'react';
import './CompanyProcesses.scss';
import CompanyNavbar from '../../Components/CompanyNavbar/CompanyNavbar';

const data = Array.from({ length: 35 }, (_, i) => ({
  lote: 'Lote 1',
  nome: `Processo de Exemplo ${i + 1}`,
  data: '01/01/2023',
  status: 'Ativo'
}));

let rowsPerPage = 10; // Default number of rows per page

//  verify the size of the screen and cgange the number of rows per page
if (window.innerWidth < 768) {
    rowsPerPage = 5;
} else if (window.innerWidth < 1800) {
    rowsPerPage = 7;
} else {
    rowsPerPage = 10;
}

export default function CompanyProcesses() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const currentRows = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  


  return (
    <div className="company-processes">
      <CompanyNavbar />
      <div className="company-processes-content">
        <div className="company-processes-header">
          <h1>Processos Ativos</h1>
          <button className="company-processes-button">Iniciar Processo</button>
        </div>
        <div className="company-processes-processes">
          <div className="company-processes-table-wrapper no-scroll">
            <table className="company-processes-table">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Nome do Processo</th>
                  <th>Data de Início</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((item, index) => (
                  <tr key={index}>
                    <td>{item.lote}</td>
                    <td>{item.nome}</td>
                    <td>{item.data}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
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

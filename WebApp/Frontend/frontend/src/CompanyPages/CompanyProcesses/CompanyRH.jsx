import React, { useState, useEffect } from 'react';
import './CompanyRH.scss';
import CompanyNavbar from '../../Components/CompanyNavbar/CompanyNavbar';

const nomes = [
  "Ana Silva", "Bruno Costa", "Carla Martins", "Diogo Santos", "Eduarda Rocha",
  "Fábio Nunes", "Gabriela Lima"
];

const funcoes = ["Operador Cura", "Operador Prensagem", "Operador Fabricação", "Operador Maturação"];

const funcionarios = nomes.map((nome, i) => ({
  nome,
  genero: i % 2 === 0 ? "Feminino" : "Masculino",
  role: funcoes[i % funcoes.length],
}));

const processos = Array.from({ length: 40 }, (_, i) => ({
  processo: `Processo ${i + 1}`,
  funcionario: nomes[i % nomes.length],
  data: `2023-${(i % 12 + 1).toString().padStart(2, '0')}-15`,
  descricao: `${funcoes[i % funcoes.length]} no processo ${i + 1}`,
}));

let rowsPerPage = 10;
if (window.innerWidth < 768) {
  rowsPerPage = 5;
} else if (window.innerWidth < 1800) {
  rowsPerPage = 7;
}

export default function CompanyRH() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [processPage, setProcessPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    gender: "",
    role: "",
    price_per_hour: "",
  });

  const totalPages = Math.ceil(funcionarios.length / rowsPerPage);
  const currentRows = funcionarios.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const processosFiltrados = searchTerm
    ? processos.filter((p) =>
        p.funcionario.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const totalProcessPages = Math.ceil(processosFiltrados.length / rowsPerPage);
  const currentProcessRows = processosFiltrados.slice(
    (processPage - 1) * rowsPerPage,
    processPage * rowsPerPage
  );

  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleProcessPrevious = () =>
    setProcessPage((prev) => Math.max(prev - 1, 1));
  const handleProcessNext = () =>
    setProcessPage((prev) => Math.min(prev + 1, totalProcessPages));

  useEffect(() => {
    setProcessPage(1);
  }, [searchTerm]);

  const handleAddEmployee = () => {
    if (newEmployee.nome && newEmployee.role) {
      funcionarios.push({ ...newEmployee });
      setShowModal(false);
      setNewEmployee({ nome: "", genero: "Feminino", role: "" });
      setCurrentPage(1);
    }
  };

  return (
    <>
    <div className="rh-dashboard">
      <CompanyNavbar />
      <div className="rh-dashboard-content">
        <div className="rh-dashboard-header">
          <h1>Recursos Humanos</h1>
          <button className="rh-add-employee-btn" onClick={() => setShowModal(true)}>Adicionar Funcionário</button>
        </div>

        {/* Tabela de Funcionários */}
        <div className="rh-employees-section">
          <div className="rh-table-wrapper">
            <table className="rh-employees-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Género</th>
                  <th>Função</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nome}</td>
                    <td>{item.genero}</td>
                    <td>{item.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rh-table-pagination">
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

        {/* Tabela de Processos por Funcionário */}
        <div className="rh-processes-section">
          <div className="rh-processes-header">
            <h2>Processos por Funcionário</h2>
            <input
              type="text"
              placeholder="Pesquisar por nome do funcionário"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rh-search-bar"
            />
          </div>

          <div className="rh-table-wrapper">
            <table className="rh-processes-table">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Processo</th>
                  <th>Data</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                {searchTerm === "" ? (
                  <tr>
                    <td colSpan="4">Insira um nome para ver os processos.</td>
                  </tr>
                ) : currentProcessRows.length === 0 ? (
                  <tr>
                    <td colSpan="4">Nenhum processo encontrado para esse funcionário.</td>
                  </tr>
                ) : (
                  currentProcessRows.map((item, index) => (
                    <tr key={index}>
                      <td>{item.funcionario}</td>
                      <td>{item.processo}</td>
                      <td>{item.data}</td>
                      <td>{item.descricao}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {searchTerm !== "" && processosFiltrados.length > 0 && (
            <div className="rh-table-pagination">
              <button
                onClick={handleProcessPrevious}
                disabled={processPage === 1}
              >
                Anterior
              </button>
              <span>
                Página {processPage} de {totalProcessPages}
              </span>
              <button
                onClick={handleProcessNext}
                disabled={processPage === totalProcessPages}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    {showModal && (
      <div className="rh-modal">
        <div className="rh-modal-content">
          <h3>Adicionar Funcionário</h3>
          <label>
            Nome:
            <input
              type="text"
              value={newEmployee.nome}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, nome: e.target.value })
              }
            />
          </label>
          <label>
            Género:
            <select
              value={newEmployee.genero}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, genero: e.target.value })
              }
            >
              <option value="Female">Feminino</option>
              <option value="Male">Masculino</option>
            </select>
          </label>
          <label>
            Função:
            <input
              type="text"
              value={newEmployee.role}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, role: e.target.value })
              }
            />
          </label>
          <label>
            Preço por hora:
            <input
              type="text"
              value={newEmployee.price_per_hour}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, price_per_hour: e.target.value })
              }
            />
          </label>
          <div className="rh-modal-actions">
            <button className="cancel" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button className="confirm" onClick={handleAddEmployee}>
              Adicionar
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
}
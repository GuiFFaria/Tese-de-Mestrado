import React, { useState, useEffect } from "react";
import Navbar from "../../Components/CompanyNavbar/CompanyNavbar";
import "./CompanyRawMaterials.scss";

const materiasPrimasIniciais = [
  {
    id: 1,
    nomeProduto: "Leite de Ovelha",
    referencia: "MP-001",
    nomeProdutor: "Quinta dos Pastores",
    localizacao: {
      rua: "Rua da Leitaria",
      cidade: "Gouveia",
      concelho: "Seia",
      latitude: 40.5165,
      longitude: -7.5922,
    },
    dataValidade: "2025-10-01",
    dataProducao: "2025-07-10",
    dataCompra: "2025-07-12",
    quantidadeComprada: 500,
    quantidadeUtilizada: 150,
    preco: 0.85,
  },
  {
    id: 2,
    nomeProduto: "Sal Marinho",
    referencia: "MP-002",
    nomeProdutor: "Salinas do Mondego",
    localizacao: {
      rua: "Estrada das Salinas",
      cidade: "Figueira da Foz",
      concelho: "Coimbra",
      latitude: 40.1538,
      longitude: -8.8613,
    },
    dataValidade: "2027-01-01",
    dataProducao: "2025-06-01",
    dataCompra: "2025-07-05",
    quantidadeComprada: 100,
    quantidadeUtilizada: 30,
    preco: 0.20,
  },
  {
    id: 3,
    nomeProduto: "Flor de Cardo",
    referencia: "MP-003",
    nomeProdutor: "Herbanário da Serra",
    localizacao: {
      rua: "Rua das Ervas",
      cidade: "Manteigas",
      concelho: "Guarda",
      latitude: 40.3937,
      longitude: -7.5396,
    },
    dataValidade: "2026-12-31",
    dataProducao: "2025-05-20",
    dataCompra: "2025-06-15",
    quantidadeComprada: 25,
    quantidadeUtilizada: 5,
    preco: 2.50,
  },
];

export default function CompanyRawMaterials() {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [producaoPropria, setProducaoPropria] = useState(false);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setMateriasPrimas(materiasPrimasIniciais);
    setData(materiasPrimasIniciais);
  }, []);

  const [formData, setFormData] = useState({
    nomeProduto: "",
    rua: "",
    cidade: "",
    concelho: "",
    latitude: "",
    longitude: "",
    dataValidade: "",
    dataProducao: "",
    dataCompra: "",
    quantidadeComprada: "",
    nomeProdutor: "",
    preco: "",
    quantidadeUtilizada: 0,
  });

  const calcularQuantidadeAtual = (mp) =>
    mp.quantidadeComprada - (mp.quantidadeUtilizada || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (["quantidadeComprada"].includes(name)) {
      val = parseInt(value) || "";
    }
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.nomeProduto ||
      !formData.dataValidade ||
      !formData.dataProducao ||
      !formData.dataCompra ||
      !formData.quantidadeComprada ||
      !formData.preco ||
      (!producaoPropria &&
        (!formData.nomeProdutor ||
          !formData.rua ||
          !formData.cidade ||
          !formData.concelho ||
          !formData.latitude ||
          !formData.longitude))
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    let novaMateriaPrima;

    if (producaoPropria) {
      novaMateriaPrima = {
        id: Date.now(),
        nomeProduto: formData.nomeProduto,
        nomeProdutor: "Produção Própria",
        localizacao: {
          rua: "Instalações da Empresa",
          cidade: "Cidade da Empresa",
          concelho: "Concelho da Empresa",
          latitude: 0,
          longitude: 0,
        },
        dataValidade: formData.dataValidade,
        dataProducao: formData.dataProducao,
        dataCompra: formData.dataCompra,
        quantidadeComprada: parseInt(formData.quantidadeComprada),
        quantidadeUtilizada: 0,
        preco: parseFloat(formData.preco),
      };
    } else {
      novaMateriaPrima = {
        id: Date.now(),
        nomeProduto: formData.nomeProduto,
        nomeProdutor: formData.nomeProdutor,
        localizacao: {
          rua: formData.rua,
          cidade: formData.cidade,
          concelho: formData.concelho,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        dataValidade: formData.dataValidade,
        dataProducao: formData.dataProducao,
        dataCompra: formData.dataCompra,
        quantidadeComprada: parseInt(formData.quantidadeComprada),
        quantidadeUtilizada: 0,
        preco: parseFloat(formData.preco),
      };
    }

    setMateriasPrimas([...materiasPrimas, novaMateriaPrima]);
    setFormData({
      nomeProduto: "",
      rua: "",
      cidade: "",
      concelho: "",
      latitude: "",
      longitude: "",
      dataValidade: "",
      dataProducao: "",
      dataCompra: "",
      quantidadeComprada: "",
      nomeProdutor: "",
      preco: "",
      quantidadeUtilizada: 0,
    });
    setProducaoPropria(false);
    setShowModal(false);
  };

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const currentRows = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="gestao-stocks-container">
      <Navbar />
      <div className="gestao-stocks-content">
        <div className="gestao-stocks-header">
          <h2 className="gestao-stocks-title">
            Gestão de Stocks - Matérias-Primas
          </h2>
          <button
            className="company-processes-button"
            onClick={() => setShowModal(true)}
          >
            Adicionar Matéria-Prima
          </button>
        </div>

        <div className="company-processes-processes">
          <div className="company-processes-table-wrapper no-scroll">
            <table className="materias-primas-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Referência</th>
                  <th>Fornecedor</th>
                  <th>Localização de Produção</th>
                  <th>Data de Validade</th>
                  <th>Quantidade Inicial</th>
                  <th>Quantidade Atual</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="no-data">
                      Nenhuma matéria-prima registada.
                    </td>
                  </tr>
                ) : (
                  currentRows.map((mp) => (
                    <tr key={mp.id}>
                      <td>{mp.nomeProduto}</td>
                      <td>{mp.referencia}</td>
                      <td>{mp.nomeProdutor}</td>
                      <td>{`${mp.localizacao.rua}, ${mp.localizacao.cidade}, ${mp.localizacao.concelho}`}</td>
                      <td>{mp.dataValidade}</td>
                      <td>{mp.quantidadeComprada}</td>
                      <td>{calcularQuantidadeAtual(mp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="table-pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
              Próxima
            </button>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Adicionar Nova Matéria-Prima</h3>
              <form className="materias-primas-form" onSubmit={handleSubmit}>
                <div className="left-column">
                  <div className="form-group">
                    <label>Nome do Produto:</label>
                    <input
                      type="text"
                      name="nomeProduto"
                      value={formData.nomeProduto}
                      onChange={handleChange}
                    />
                  </div>
                  <fieldset className="localizacao-fieldset">
                    <legend>Localização de Produção do Produto</legend>
                    <div className="form-group">
                      <label>Rua:</label>
                      <input
                        type="text"
                        name="rua"
                        value={formData.rua}
                        onChange={handleChange}
                        disabled={producaoPropria}
                        placeholder={producaoPropria ? "Produção Própria" : ""}
                      />
                    </div>
                    <div className="form-group">
                      <label>Cidade:</label>
                      <input
                        type="text"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        disabled={producaoPropria}
                        placeholder={producaoPropria ? "Produção Própria" : ""}
                      />
                    </div>
                    <div className="form-group">
                      <label>Concelho:</label>
                      <input
                        type="text"
                        name="concelho"
                        value={formData.concelho}
                        onChange={handleChange}
                        disabled={producaoPropria}
                        placeholder={producaoPropria ? "Produção Própria" : ""}
                      />
                    </div>
                    <div className="form-group">
                      <label>Latitude:</label>
                      <input
                        type="number"
                        name="latitude"
                        step="any"
                        value={formData.latitude}
                        onChange={handleChange}
                        disabled={producaoPropria}
                        placeholder={producaoPropria ? "Produção Própria" : ""}
                      />
                    </div>
                    <div className="form-group">
                      <label>Longitude:</label>
                      <input
                        type="number"
                        name="longitude"
                        step="any"
                        value={formData.longitude}
                        onChange={handleChange}
                        disabled={producaoPropria}
                        placeholder={producaoPropria ? "Produção Própria" : ""}
                      />
                    </div>
                    <div className="checkbox-group">
                        <label>
                            <input
                            type="checkbox"
                            checked={producaoPropria}
                            onChange={(e) => setProducaoPropria(e.target.checked)}
                            />
                            Produção Própria
                        </label>
                    </div>
                  </fieldset>
                  
                </div>
                <div className="right-column">
                  <div className="form-group">
                    <label>Data de Término da Validade:</label>
                    <input
                      type="date"
                      name="dataValidade"
                      value={formData.dataValidade}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Data de Produção:</label>
                    <input
                      type="date"
                      name="dataProducao"
                      value={formData.dataProducao}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Data de Compra:</label>
                    <input
                      type="date"
                      name="dataCompra"
                      value={formData.dataCompra}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantidade Comprada:</label>
                    <input
                      type="number"
                      name="quantidadeComprada"
                      min="0"
                      value={formData.quantidadeComprada}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nome do Fornecedor:</label>
                    <input
                      type="text"
                      name="nomeProdutor"
                      value={formData.nomeProdutor}
                      onChange={handleChange}
                      disabled={producaoPropria}
                      placeholder={producaoPropria ? "Produção Própria" : ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Preço:</label>
                    <input
                      type="number"
                      step="0.01"
                      name="preco"
                      min="0"
                      value={formData.preco}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="button-group">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setShowModal(false);
                        setProducaoPropria(false);
                      }}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn-submit">
                      Adicionar Matéria-Prima
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Navbar from "../../Components/CompanyNavbar/CompanyNavbar"; // Importa a Navbar do teu componente já implementado
import "./CompanyRawMaterials.scss"; // Importa o SCSS

export default function CompanyRawMaterials() {
  const [materiasPrimas, setMateriasPrimas] = useState([]);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);

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
            setCurrentPage(1); // Reset to first page on resizes
        };

        handleResize(); // Initialize rowsPerPage based on current size
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
    quantidadeUtilizada: 0, // para calcular quantidade atual
  });

  // Calcula quantidade atual (quantidade comprada - quantidade utilizada)
  const calcularQuantidadeAtual = (mp) =>
    mp.quantidadeComprada - (mp.quantidadeUtilizada || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let val = value;
    if (["latitude", "longitude", "preco"].includes(name)) {
      val = value;
    }
    if (["quantidadeComprada"].includes(name)) {
      val = parseInt(value) || "";
    }

    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.nomeProduto ||
      !formData.rua ||
      !formData.cidade ||
      !formData.concelho ||
      !formData.latitude ||
      !formData.longitude ||
      !formData.dataValidade ||
      !formData.dataProducao ||
      !formData.dataCompra ||
      !formData.quantidadeComprada ||
      !formData.nomeProdutor ||
      !formData.preco
    ) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const novaMateriaPrima = {
      id: Date.now(),
      nomeProduto: formData.nomeProduto,
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
      nomeProdutor: formData.nomeProdutor,
      preco: parseFloat(formData.preco),
    };

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
  };

  let totalPages = Math.ceil(data.length / rowsPerPage);

    if (totalPages === 0) {
        totalPages = 1;
    }
    
  const currentRows = data.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePrevious = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

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
                onClick={() => {
                setShowModal(true);
                }}
            >
                Adicionar Matéria-Prima
            </button>
        </div>
        <div className="company-processes-processes">
            <div className="company-processes-table-wrapper no-scroll">
                  
                <table className="materias-primas-table">
                    <thead>
                    <tr>
                        <th>Nome do Produto</th>
                        <th>Nome do Produtor</th>
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
                            />
                        </div>
                        <div className="form-group">
                            <label>Cidade:</label>
                            <input
                            type="text"
                            name="cidade"
                            value={formData.cidade}
                            onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Concelho:</label>
                            <input
                            type="text"
                            name="concelho"
                            value={formData.concelho}
                            onChange={handleChange}
                            />
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
                        <label>Nome do Produtor:</label>
                        <input
                            type="text"
                            name="nomeProdutor"
                            value={formData.nomeProdutor}
                            onChange={handleChange}
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
                        <button type="submit" className="btn-submit">Adicionar Matéria-Prima</button>
                        <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
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

{/* <form className="materias-primas-form" onSubmit={handleSubmit}>
            <h3>Adicionar Nova Matéria-Prima</h3>

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
                />
            </div>
            <div className="form-group">
                <label>Cidade:</label>
                <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Concelho:</label>
                <input
                type="text"
                name="concelho"
                value={formData.concelho}
                onChange={handleChange}
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
                />
            </div>
            </fieldset>

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
            <label>Nome do Produtor:</label>
            <input
                type="text"
                name="nomeProdutor"
                value={formData.nomeProdutor}
                onChange={handleChange}
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

            <button type="submit" className="btn-submit">
            Adicionar Matéria-Prima
            </button>
        </form> */}
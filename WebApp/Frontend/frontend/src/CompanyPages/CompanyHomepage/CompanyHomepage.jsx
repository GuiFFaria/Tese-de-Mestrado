import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanyHomepage.scss';
import CompanyNavbar from '../../Components/CompanyNavbar/CompanyNavbar';

export default function CompanyHomepage() {
  const [company, setCompany] = useState(null);
  const [boardData, setBoardData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState('');
  const [rawMaterials, setRawMaterials] = useState([]);
  const [materialsUsed, setMaterialsUsed] = useState([
    { material_id: '', quantity: '' },
  ]);
  const [productsNumber, setProductsNumber] = useState('');

  const navigate = useNavigate();


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      fetch(`http://localhost:8000/api/get-company-by-userid/${user.user_id}`)
        .then((response) => response.json())
        .then((data) => {
          setCompany(data);
        })
        .catch((error) => {
          console.error('Erro ao buscar dados da empresa:', error);
        });

      fetch(`http://localhost:8000/api/get-company-homepage/${user.user_id}`)
        .then((response) => response.json())
        .then((data) => {
          setBoardData(data);
        })
        .catch((error) => {
          console.error('Erro ao buscar dados do quadro:', error);
        });

      fetch('http://localhost:8000/api/raw-materials')
        .then((response) => response.json())
        .then((data) => {
          setRawMaterials(data);
        })
        .catch((error) => {
          console.error('Erro ao buscar matérias-primas:', error);
        });
    }
  }, []);

  const handleProcessClick = (process) => {
    navigate(`/company/process/${process.reference}`, { state: { process } });
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materialsUsed];
    updated[index][field] = value;
    setMaterialsUsed(updated);
  };

  const handleAddMaterial = () => {
    setMaterialsUsed([...materialsUsed, { material_id: '', quantity: '' }]);
  };

  const handleRemoveMaterial = (index) => {
    const updated = materialsUsed.filter((_, i) => i !== index);
    setMaterialsUsed(updated);
  };

  const handleStartProcess = () => {
    const payload = {
      product_type: selectedProductType,
      materials_used: materialsUsed,
      products_number: productsNumber,
    };
    console.log('Enviar para API:', payload);
    // fetch('http://localhost:8000/api/start-process', { method: 'POST', ... })
    setShowModal(false);
  };

  return (
    <div className="company-homepage">
      <CompanyNavbar />
      <div className="company-homepage-content">
        <div className="company-homepage-header">
          <h1>Bem-vindo {company?.name}</h1>
        </div>

        <div className="company-homepage-metrics">
          <div className="metric-card">
            <span>FUNCIONÁRIOS</span>
            <strong>{boardData?.metrics?.jobs ?? 0}</strong>
          </div>
          <div className="metric-card">
            <span>ÁGUA (último ano)</span>
            <strong>{boardData?.metrics?.water_last_year ?? 0} L</strong>
          </div>
          <div className="metric-card">
            <span>ENERGIA (último ano)</span>
            <strong>{boardData?.metrics?.energy_last_year ?? 0} kWh</strong>
          </div>
          <div className="metric-card">
            <span>RESÍDUOS (último ano)</span>
            <strong>{boardData?.metrics?.waste_last_year ?? 0} kg</strong>
          </div>
        </div>

        <div className="company-homepage-boards">
          {boardData?.boards?.product_types?.map((product, index) => (
            <div key={index} className="product-board">
              <div className="product-board-header">
                <h2 className="product-title">Processos Ativos - {product.type}</h2>
                <button
                  className="company-processes-button"
                  onClick={() => {
                    setSelectedProductType(product.type);
                    setShowModal(true);
                  }}
                >
                  Iniciar Processo
                </button>
              </div>
              <div
                className={`board-columns ${
                  product.process_types.length <= 3 ? 'centered' : ''
                }`}
              >
                {product.process_types.map((processType, idx) => (
                  <div key={idx} className="board-column">
                    <div className="column-header">{processType.process_type}</div>
                    <div className="column-cards">
                      {processType.processes.map((process, id) => (
                        <div
                          key={id}
                          className="process-card"
                          onClick={() => handleProcessClick(process)}
                        >
                          <p className="process-name">
                            {processType.process_type} - Lote {process.batch}
                          </p>
                          <p className="process-product-quantity">
                            {process.products_number} unidades
                          </p>
                          <p className="process-date">
                            Início: {new Date(process.start_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      {processType.processes.length === 0 && (
                        <div className="empty-message">Nenhum processo ativo</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Iniciar Novo Processo: {selectedProductType}</h3>

            <div className="material-section">
              <h4>Matérias-Primas</h4>
              {materialsUsed.map((item, index) => (
                <div key={index} className="material-line">
                  <select
                    value={item.material_id}
                    onChange={(e) =>
                      handleMaterialChange(index, 'material_id', e.target.value)
                    }
                  >
                    <option value="">Selecionar matéria-prima</option>
                    {rawMaterials.map((mat) => (
                      <option key={mat.id} value={mat.name}>
                        {mat.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Quantidade"
                    value={item.quantity}
                    onChange={(e) =>
                      handleMaterialChange(index, 'quantity', e.target.value)
                    }
                  />

                  {materialsUsed.length > 1 && (
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveMaterial(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button className="add-btn" onClick={handleAddMaterial}>
                + Adicionar matéria-prima
              </button>
            </div>

            <label>
              Quantidade de Produtos no Lote:
              <input
                type="number"
                className="product-count-input"
                value={productsNumber}
                onChange={(e) => setProductsNumber(e.target.value)}
              />
            </label>

            <div className="modal-buttons">
              <button className="cancel" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="confirm" onClick={handleStartProcess}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

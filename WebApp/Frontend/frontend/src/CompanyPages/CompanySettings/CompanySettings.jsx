import { useState } from "react";
import Navbar from "../../Components/CompanyNavbar/CompanyNavbar";
import "./CompanySettings.scss";
import { Plus, LayoutTemplate, X, Wrench } from "lucide-react";

export default function CompanySettings() {
  const [processTypes, setProcessTypes] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showScratchModal, setShowScratchModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMachineModal, setShowMachineModal] = useState(false);

  const [newProcessName, setNewProcessName] = useState("");
  const [newProcessPosition, setNewProcessPosition] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(null);

  const [machines, setMachines] = useState([]);
  const [machineType, setMachineType] = useState("");
  const [machineManufacturer, setMachineManufacturer] = useState("");
  const [parameterName, setParameterName] = useState("");
  const [parameterUnit, setParameterUnit] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [selectedProcessType, setSelectedProcessType] = useState("");

  // NOVOS ESTADOS PARA SENSORES
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [selectedMachineIndex, setSelectedMachineIndex] = useState(null);
  const [sensorName, setSensorName] = useState("");
  // const [sensorParameter, setSensorParameter] = useState("");
  // const [sensorUnit, setSensorUnit] = useState("");
  // const [sensorMin, setSensorMin] = useState("");
  // const [sensorMax, setSensorMax] = useState("");

  const [sensorParameters, setSensorParameters] = useState([]);
  const [currentParamName, setCurrentParamName] = useState("");
  const [currentParamUnit, setCurrentParamUnit] = useState("");
  const [currentParamMin, setCurrentParamMin] = useState("");
  const [currentParamMax, setCurrentParamMax] = useState("");

  const templates = [
    { name: "Produção", position: 1 },
    { name: "Fabricação", position: 2 },
    { name: "Entrega", position: 3 },
  ];

  const handleAddProductType = () => setShowProductModal(true);

  const confirmAddProductType = () => {
    if (newProductCategory.trim() && newProductName.trim()) {
      setProductTypes([...productTypes, `${newProductCategory} - ${newProductName}`]);
      setNewProductCategory("");
      setNewProductName("");
      setShowProductModal(false);
    } else {
      alert("Selecione a categoria e insira o nome do produto.");
    }
  };

  const handleCreateFromScratch = () => setShowScratchModal(true);
  const handleCreateFromTemplate = () => setShowTemplateModal(true);

  const confirmScratch = () => {
    if (
      newProcessName.trim() &&
      newProcessPosition &&
      selectedProductType.trim()
    ) {
      setProcessTypes([
        ...processTypes,
        {
          name: newProcessName.trim(),
          position: parseInt(newProcessPosition),
          productType: selectedProductType,
        },
      ]);
      setNewProcessName("");
      setNewProcessPosition("");
      setSelectedProductType("");
      setShowScratchModal(false);
    } else {
      alert("Preencha todos os campos corretamente.");
    }
  };

  const confirmTemplate = () => {
    if (selectedProductType.trim()) {
      for (const template of templates) {
        setProcessTypes([
          ...processTypes,
          {
            name: template.name,
            position: template.position,
            productType: selectedProductType,
          },
        ]);
        setSelectedTemplateIndex(null);
        setSelectedProductType("");
        setShowTemplateModal(false);
      }
    } else {
      alert("Escolha um template e um tipo de produto.");
    }
  };

  const handleAddMachine = () => {
    if (machineType.trim() && machineManufacturer.trim() && selectedProcessType) {
      const newMachine = {
        type: machineType,
        manufacturer: machineManufacturer,
        processType: selectedProcessType, // 👈 associação ao processo
        alerts: parameterName
          ? [
              {
                name: parameterName,
                unit: parameterUnit,
                min: parseFloat(minValue),
                max: parseFloat(maxValue),
              },
            ]
          : [],
      };

      setMachines([...machines, newMachine]);
      setMachineType("");
      setMachineManufacturer("");
      setParameterName("");
      setParameterUnit("");
      setMinValue("");
      setMaxValue("");
      setSelectedProcessType(""); // resetar seleção
    } else {
      alert("Preencha os campos obrigatórios da máquina e associe a um tipo de processo.");
    }
  };
  // NOVA FUNÇÃO PARA ADICIONAR SENSOR A UMA MÁQUINA EXISTENTE
  const handleAddSensor = () => {
    if (
      selectedMachineIndex !== null &&
      sensorName.trim() &&
      sensorParameters.length > 0
    ) {
      const updatedMachines = [...machines];
      const machine = updatedMachines[selectedMachineIndex];

      if (!machine.iot_nodes) machine.iot_nodes = [];

      machine.iot_nodes.push({
        name: sensorName.trim(),
        parameters: sensorParameters,
      });

      setMachines(updatedMachines);

      // Reset
      setSelectedMachineIndex(null);
      setSensorName("");
      setSensorParameters([]);
      setShowSensorModal(false);
    } else {
      alert("Preencha o nome do sensor e adicione pelo menos um parâmetro.");
    }
  };


  const handleAddParameterToSensor = () => {
    if (
      currentParamName.trim() &&
      currentParamUnit.trim() &&
      currentParamMin !== "" &&
      currentParamMax !== ""
    ) {
      setSensorParameters([
        ...sensorParameters,
        {
          name: currentParamName.trim(),
          unit: currentParamUnit.trim(),
          min: parseFloat(currentParamMin),
          max: parseFloat(currentParamMax),
        },
      ]);
      // Limpar inputs
      setCurrentParamName("");
      setCurrentParamUnit("");
      setCurrentParamMin("");
      setCurrentParamMax("");
    } else {
      alert("Preencha todos os campos do parâmetro.");
    }
  };

  const handleDeleteProductType = (index) => {
    const updated = [...productTypes];
    updated.splice(index, 1);
    setProductTypes(updated);
  };

  const handleDeleteProcessType = (index) => {
    const updated = [...processTypes];
    updated.splice(index, 1);
    setProcessTypes(updated);
  };

  const handleDeleteMachine = (index) => {
    const updated = [...machines];
    updated.splice(index, 1);
    setMachines(updated);
  };


  return (
    <>
      <div className="wrapper">
        <Navbar />
        <div className="company-settings">
          <h1 className="title">Definições da Empresa</h1>

          {/* Tipos de Produto */}
          <div className="card">
            <h2>Tipos de Produto</h2>
            {productTypes.length === 0 ? (
              <p className="empty-text">Nenhum tipo de produto adicionado.</p>
            ) : (
              <ul className="product-list">
                {productTypes.map((type, index) => (
                  <li key={index}>
                    {type}
                    <button
                      className="delete-btn"
                      onClick={() => {
                        const updated = [...productTypes];
                        updated.splice(index, 1);
                        setProductTypes(updated);
                      }}
                      title="Eliminar tipo de produto"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button className="custom-button outline" onClick={handleAddProductType}>
              <Plus size={16} /> Adicionar Tipo de Produto
            </button>
          </div>

          {/* Tipos de Processo */}
          <div className="card">
            <h2>Tipos de Processo</h2>
            {processTypes.length === 0 ? (
              <p className="empty-text">Nenhum tipo de processo adicionado.</p>
            ) : (
              <ul className="process-list">
              {processTypes.map((type, index) => (
                <li key={index}>
                  <strong>{type.name}</strong> – Posição: {type.position} – Produto: {type.productType}
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteProcessType(index)}
                    title="Eliminar processo"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
            )}
            <div className="button-group">
              <button className="custom-button outline" onClick={handleCreateFromScratch}>
                <Plus size={16} /> Criar do zero
              </button>
              <button className="custom-button outline" onClick={handleCreateFromTemplate}>
                <LayoutTemplate size={16} /> Usar template
              </button>
            </div>
          </div>

          {/* Máquinas */}
          <div className="card">
            <h2>Máquinas</h2>
            {machines.length === 0 ? (
              <p className="empty-text">Nenhuma máquina adicionada.</p>
            ) : (
              <ul className="machine-list">
              {machines.map((machine, index) => (
                <li key={index}>
                  <strong>{machine.type}</strong> de {machine.manufacturer}
                  {machine.processType && (
                    <div className="process-association">
                      🔄 Associado ao processo: <em>{machine.processType}</em>
                    </div>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteMachine(index)}
                    title="Eliminar máquina"
                  >
                    <X size={14} />
                  </button>
                  {machine.alerts.length > 0 && (
                    <ul className="alert-list">
                      {machine.alerts.map((alert, i) => (
                        <li key={i}>
                          ⚠️ {alert.name} ({alert.unit}) entre {alert.min} e {alert.max}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            )}
            <div className="button-group">
              <button
                className="custom-button outline"
                onClick={() => setShowMachineModal(true)}
              >
                <Wrench size={16} /> Adicionar Máquina
              </button>
              <button
                className="custom-button outline"
                onClick={() => setShowSensorModal(true)}
                
              >
                <Plus size={16} /> Adicionar Sensor
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal - Adicionar Produto */}
       {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowProductModal(false)}>
              <X size={20} />
            </button>
            <h2>Adicionar Tipo de Produto</h2>
            <select
              value={newProductCategory}
              onChange={(e) => setNewProductCategory(e.target.value)}
            >
              <option value="">Selecionar categoria</option>
              <option value="carne">Carne</option>
              <option value="laticínio">Laticínio</option>
              <option value="peixe">Peixe</option>
              <option value="mel & compotas">Mel & Compotas</option>
              <option value="frutas & vegetais">Frutas & Vegetais</option>
              <option value="massas & outros">Massas & Outros</option>
              <option value="azeite">Azeite</option>
              <option value="bebidas">Bebidas</option>
              <option value="ovos">Ovos</option>
              <option value="sal & ervas">Sal & Ervas</option>
              <option value="tofu">Tofu</option>
            </select>
            <input
              type="text"
              placeholder="Nome do produto"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={confirmAddProductType}>Confirmar</button>
              <button onClick={() => setShowProductModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal - Criar do zero */}
      {showScratchModal && (
        <div className="modal-overlay" onClick={() => setShowScratchModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowScratchModal(false)}>
              <X size={20} />
            </button>
            <h2>Criar Novo Tipo de Processo</h2>
            <input
              type="text"
              placeholder="Nome do tipo de processo"
              value={newProcessName}
              onChange={(e) => setNewProcessName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Etapa na cadeia"
              value={newProcessPosition}
              onChange={(e) => setNewProcessPosition(e.target.value)}
            />
            <select
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
            >
              <option value="">Selecione o tipo de produto</option>
              {productTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={confirmScratch}>Confirmar</button>
              <button onClick={() => setShowScratchModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Usar Template */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowTemplateModal(false)}>
              <X size={20} />
            </button>
            <h2>Template</h2>
            <ul className="template-list">
              {templates.map((t, index) => (
                <li
                  key={index}
                  className={selectedTemplateIndex === index ? "selected" : ""}
                >
                  {t.name} – Posição: {t.position}
                </li>
              ))}
            </ul>
            <select
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
            >
              <option value="">Selecione o tipo de produto</option>
              {productTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={confirmTemplate}>Confirmar</button>
              <button onClick={() => setShowTemplateModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Adicionar Máquina */}
      {showMachineModal && (
        <div className="modal-overlay" onClick={() => setShowMachineModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowMachineModal(false)}>
              <X size={20} />
            </button>
            <h2>Adicionar Máquina</h2>
            <input
              type="text"
              placeholder="Tipo de máquina"
              value={machineType}
              onChange={(e) => setMachineType(e.target.value)}
            />
            <input
              type="text"
              placeholder="Fabricante"
              value={machineManufacturer}
              onChange={(e) => setMachineManufacturer(e.target.value)}
            />
            <select
              value={selectedProcessType}
              onChange={(e) => setSelectedProcessType(e.target.value)}
            >
              <option value="">Selecionar tipo de processo</option>
              {processTypes.map((process, index) => (
                <option key={index} value={process.name}>
                  {process.name} (Produto: {process.productType})
                </option>
              ))}
            </select>
            <div className="modal-actions">
              <button
                onClick={() => {
                  handleAddMachine();
                  setShowMachineModal(false);
                }}
              >
                Confirmar
              </button>
              <button onClick={() => setShowMachineModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Adicionar Sensor */}
      {showSensorModal && (
      <div className="modal-overlay" onClick={() => setShowSensorModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setShowSensorModal(false)}>
            <X size={20} />
          </button>
          <h2>Adicionar Sensor à Máquina</h2>
          <select
            value={selectedMachineIndex !== null ? selectedMachineIndex : ""}
            onChange={(e) => setSelectedMachineIndex(parseInt(e.target.value))}
          >
            <option value="">Selecione a máquina</option>
            {machines.map((machine, index) => (
              <option key={index} value={index}>
                {machine.type} - {machine.manufacturer}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nome do sensor"
            value={sensorName}
            onChange={(e) => setSensorName(e.target.value)}
          />

          <h3>Adicionar Parâmetros</h3>
          <input
            type="text"
            placeholder="Nome do parâmetro"
            value={currentParamName}
            onChange={(e) => setCurrentParamName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Unidade (ex: ºC)"
            value={currentParamUnit}
            onChange={(e) => setCurrentParamUnit(e.target.value)}
          />
          <input
            type="number"
            placeholder="Valor mínimo"
            value={currentParamMin}
            onChange={(e) => setCurrentParamMin(e.target.value)}
          />
          <input
            type="number"
            placeholder="Valor máximo"
            value={currentParamMax}
            onChange={(e) => setCurrentParamMax(e.target.value)}
          />
          <button className="add-parameter-btn" onClick={handleAddParameterToSensor}>Adicionar Parâmetro</button>

          {sensorParameters.length > 0 && (
            <ul className="parameter-preview">
              {sensorParameters.map((param, index) => (
                <li key={index}>
                  ✅ {param.name} ({param.unit}) – entre {param.min} e {param.max}
                </li>
              ))}
            </ul>
          )}

          <div className="modal-actions">
            <button onClick={handleAddSensor}>Confirmar</button>
            <button onClick={() => setShowSensorModal(false)}>Cancelar</button>
          </div>
        </div>
      </div>
    )}

    </>
  );
}

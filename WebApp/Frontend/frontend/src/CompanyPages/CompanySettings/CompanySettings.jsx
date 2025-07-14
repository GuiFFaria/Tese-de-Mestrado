import { useState } from "react";
import Navbar from "../../Components/CompanyNavbar/CompanyNavbar";
import "./CompanySettings.scss";
import { Plus, LayoutTemplate, X, Wrench } from "lucide-react";

export default function CompanySettings() {
  const [processTypes, setProcessTypes] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [newProductName, setNewProductName] = useState("");
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

  // NOVOS ESTADOS PARA SENSORES
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [selectedMachineIndex, setSelectedMachineIndex] = useState(null);
  const [sensorName, setSensorName] = useState("");
  const [sensorParameter, setSensorParameter] = useState("");
  const [sensorUnit, setSensorUnit] = useState("");
  const [sensorMin, setSensorMin] = useState("");
  const [sensorMax, setSensorMax] = useState("");

  const templates = [
    { name: "Produção de Queijo", position: 1 },
    { name: "Engarrafamento de Água", position: 2 },
    { name: "Tratamento de Lã", position: 3 },
  ];

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
    if (selectedTemplateIndex !== null && selectedProductType.trim()) {
      const selectedTemplate = templates[selectedTemplateIndex];
      setProcessTypes([
        ...processTypes,
        {
          name: selectedTemplate.name,
          position: selectedTemplate.position,
          productType: selectedProductType,
        },
      ]);
      setSelectedTemplateIndex(null);
      setSelectedProductType("");
      setShowTemplateModal(false);
    } else {
      alert("Escolha um template e um tipo de produto.");
    }
  };

  const handleAddProductType = () => {
    if (newProductName.trim()) {
      setProductTypes([...productTypes, newProductName.trim()]);
      setNewProductName("");
    }
  };

  const handleAddMachine = () => {
    if (machineType.trim() && machineManufacturer.trim()) {
      const newMachine = {
        type: machineType,
        manufacturer: machineManufacturer,
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
    } else {
      alert("Preencha os campos obrigatórios da máquina.");
    }
  };

  // NOVA FUNÇÃO PARA ADICIONAR SENSOR A UMA MÁQUINA EXISTENTE
  const handleAddSensor = () => {
    if (
      selectedMachineIndex !== null &&
      sensorName.trim() &&
      sensorParameter.trim() &&
      sensorUnit.trim() &&
      sensorMin !== "" &&
      sensorMax !== ""
    ) {
      const updatedMachines = [...machines];
      const machine = updatedMachines[selectedMachineIndex];

      if (!machine.alerts) machine.alerts = [];

      machine.alerts.push({
        name: sensorName.trim(),
        parameter: sensorParameter.trim(),
        unit: sensorUnit.trim(),
        min: parseFloat(sensorMin),
        max: parseFloat(sensorMax),
      });

      setMachines(updatedMachines);

      // Reset inputs e fechar modal
      setSelectedMachineIndex(null);
      setSensorName("");
      setSensorParameter("");
      setSensorUnit("");
      setSensorMin("");
      setSensorMax("");
      setShowSensorModal(false);
    } else {
      alert("Preencha todos os campos corretamente.");
    }
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
                  <li key={index}>{type}</li>
                ))}
              </ul>
            )}
            <div className="add-product-form">
              <input
                type="text"
                placeholder="Novo tipo de produto"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
              <button onClick={handleAddProductType}>Adicionar</button>
            </div>
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
                    <strong>{type.name}</strong> – Posição: {type.position} – Produto:{" "}
                    {type.productType}
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
                    <strong>{machine.type}</strong> – {machine.manufacturer}
                    {machine.alerts.length > 0 && (
                      <ul className="alert-list">
                        {machine.alerts.map((alert, i) => (
                          <li key={i}>
                            ⚠️ {alert.name} ({alert.unit}) entre {alert.min} e {alert.max}
                            {alert.parameter ? ` – Parâmetro: ${alert.parameter}` : ""}
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
                disabled={machines.length === 0}
              >
                <Plus size={16} /> Adicionar Sensor
              </button>
            </div>
          </div>
        </div>
      </div>

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
              placeholder="Posição na cadeia"
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
            <h2>Escolha um Template</h2>
            <ul className="template-list">
              {templates.map((t, index) => (
                <li
                  key={index}
                  className={selectedTemplateIndex === index ? "selected" : ""}
                  onClick={() => setSelectedTemplateIndex(index)}
                >
                  {t.name} – Posição sugerida: {t.position}
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
            <input
              type="text"
              placeholder="Parâmetro medido (ex: Temperatura)"
              value={sensorParameter}
              onChange={(e) => setSensorParameter(e.target.value)}
            />
            <input
              type="text"
              placeholder="Unidade (ex: ºC)"
              value={sensorUnit}
              onChange={(e) => setSensorUnit(e.target.value)}
            />
            <input
              type="number"
              placeholder="Valor mínimo"
              value={sensorMin}
              onChange={(e) => setSensorMin(e.target.value)}
            />
            <input
              type="number"
              placeholder="Valor máximo"
              value={sensorMax}
              onChange={(e) => setSensorMax(e.target.value)}
            />
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

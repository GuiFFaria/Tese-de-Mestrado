// ... importações mantidas
import React, { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Components/CompanyNavbar/CompanyNavbar";
import "./ProcessInstance.scss";

export default function ProcessInstance() {
  const { state } = useLocation();
  const [processData, setProcessData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [water, setWater] = useState("");
  const [energy, setEnergy] = useState("");
  const [waste, setWaste] = useState("");

  const [showActionModal, setShowActionModal] = useState(false);
  const [actionDescription, setActionDescription] = useState("");
  const [actionDuration, setActionDuration] = useState("");
  const [actionProducts, setActionProducts] = useState([]);
  const [actionsLog, setActionsLog] = useState([]);

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [discardedProducts, setDiscardedProducts] = useState([]);

  const handleCheckboxChange = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!state?.process?.reference) return;
    axios
      .get(`http://127.0.0.1:8000/api/get-process-by-reference/${state.process.reference}`)
      .then((response) => {
        setProcessData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching process data:", error);
      });
  }, [state]);

  const confirmFinish = () => {
    if (!water || !energy || !waste) {
      alert("Preencha todos os dados ambientais.");
      return;
    }

    const finishData = {
      process_reference: state.process.reference,
      selected_products: selectedProducts,
      water_used: water,
      energy_used: energy,
      waste_generated: waste,
    };

    axios.post("http://127.0.0.1:8000/api/advance-process", finishData)
      .then(() => {
        alert("Processo finalizado com sucesso!");
        window.history.back();
      })
      .catch((error) => {
        console.error("Error finishing process:", error);
        alert("Erro ao finalizar o processo.");
      });

    setShowModal(false);
    setSelectedProducts([]);
  };

  const getColor = (param) => {
    const value = param.last_value;
    if (!param.alerts || param.alerts.length === 0) return "#00c853";
    const min = param.alerts[0].min;
    const max = param.alerts[0].max;
    if (value < min) return "#2196f3";
    if (value > max) return "#d50000";
    return "#00c853";
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="process-instance">
      <Navbar />
      <div className="container">
        <div className="top-bar">
          <button className="back-button" onClick={() => window.history.back()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>

          <div className="header-buttons">
            <button className="action-btn" onClick={() => setShowActionModal(true)}>Adicionar Ações</button>
            <button className="discard-btn" onClick={() => setShowDiscardModal(true)}>Descartar Unidades</button>
            <button className="finish-btn" onClick={() => setShowModal(true)}>Avançar Processo</button>
          </div>
        </div>

        <div className="columns">
          <div className="left-column">
            <div className="header">
              <h2>{processData?.type} - Lote {state.process.batch}</h2>
              <p>Iniciado em: {formatDate(processData.start_date)}</p>
              {processData.chain_position === 1 && (
                <p><strong>Quantidade de Leite:</strong> {processData.raw_materials[0].quantity_used} L</p>
              )}
            </div>

            {processData.machines?.length > 0 ? (
              processData.machines.map((machine, index) => (
                <div className="machine-table" key={index}>
                  <div className="machine-header">{machine.type || machine.name}</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Sensor</th>
                        <th>Tipo</th>
                        <th>Valor Atual</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {machine.iot_nodes?.some((sensor) => sensor.parameters?.length > 0) ? (
                        machine.iot_nodes.flatMap((sensor, pid) =>
                          sensor.parameters.map((param, paramIdx) => (
                            <tr key={`${pid}-${paramIdx}`}>
                              <td>{sensor.name}</td>
                              <td>{param.name}</td>
                              <td>{param.last_value}{param.unit}</td>
                              <td>
                                {param.alerts?.length > 0 ? (
                                  <span className="alert-icon alert">
                                    {param.alerts[0].type === "critical" ? "🔴" : "⚠️"}
                                  </span>
                                ) : (
                                  <span className="alert-icon ok">🟢</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )
                      ) : (
                        <tr>
                          <td colSpan="4" className="no-sensors-msg">Esta máquina não possui sensores associados.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <div className="no-machines-msg">Não existem máquinas associadas a este processo.</div>
            )}
          </div>

          <div className="right-column">
            {processData.machines?.some((m) =>
              m.iot_nodes?.some((node) => node.parameters?.length > 0)
            ) ? (
              <div className="gauges">
                {processData.machines.flatMap((machine) =>
                  machine.iot_nodes.flatMap((node) =>
                    node.parameters.map((param, idx) => (
                      <div className="gauge-card" key={`${node.name}-${param.name}-${idx}`}>
                        <h4>{`${node.name} - ${param.name}`}</h4>
                        <RadialBarChart
                          width={200}
                          height={200}
                          cx="50%"
                          cy="100%"
                          innerRadius="60%"
                          outerRadius="100%"
                          startAngle={180}
                          endAngle={0}
                          barSize={20}
                          data={[{
                            name: `${param.name}`,
                            value: Math.min(
                              (param.last_value / (param.alerts?.[0]?.max || 1)) * 100,
                              100
                            ),
                            fill: getColor(param),
                          }]}
                        >
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={5} />
                          <text x={100} y={180} textAnchor="middle" style={{ fontSize: "2rem", fill: "#333" }}>
                            {`${param.last_value} ${param.unit}`}
                          </text>
                        </RadialBarChart>
                      </div>
                    ))
                  )
                )}
              </div>
            ) : (
              <div className="no-gauges-msg">Sem dados de sensores.</div>
            )}
          </div>
        </div>

        <div className="sensor-history-data">
          <h2>Histórico dos Sensores</h2>
          {processData?.machines?.length === 0 ? (
            <p>Sem máquinas associadas.</p>
          ) : (
            processData?.machines?.map((machine, machineIdx) => (
              <div className="machine-section" key={`machine-${machineIdx}`}>
                <h3>{`Máquina - ${machine.type}`}</h3>
                {machine.iot_nodes?.some((node) => node.parameters?.length > 0) ? (
                  machine.iot_nodes.flatMap((node, nodeIdx) =>
                    node.parameters.map((param, paramIdx) => {
                      const history = param.history || [];
                      const formatted = history.map((entry) => {
                        const d = new Date(entry.timestamp);
                        return {
                          value: entry.value,
                          time: d.toLocaleTimeString("pt-PT"),
                          fullDateTime: d.toLocaleString("pt-PT"),
                        };
                      });
                      return (
                        <div className="history-chart" key={`${nodeIdx}-${paramIdx}`}>
                          <h4>{`${node.name} - ${param.name}`}</h4>
                          {formatted.length === 0 ? (
                            <p>Sem dados históricos.</p>
                          ) : (
                            <ResponsiveContainer width="100%" height={250}>
                              <LineChart data={formatted}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="fullDateTime" />
                                <YAxis unit={param.unit} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke={getColor(param)} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      );
                    })
                  )
                ) : (
                  <p>Sem sensores nesta máquina.</p>
                )}
              </div>
            ))
          )}
        </div>

        {actionsLog.length > 0 && (
          <div className="actions-log">
            <h2>Ações Realizadas</h2>
            <table>
              <thead>
                <tr>
                  <th>Ação</th>
                  <th>Produtos Afetados</th>
                  <th>Duração (min)</th>
                </tr>
              </thead>
              <tbody>
                {actionsLog.map((action, idx) => (
                  <tr key={idx}>
                    <td>{action.description}</td>
                    <td>{action.products.join(", ")}</td>
                    <td>{action.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Avançar Processo */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Avançar Processo</h3>
            <p>Seleciona os produtos que permanecem:</p>
            <div className="product-grid">
              {processData.products?.map((product) =>
                discardedProducts.includes(product.id) ? null : (
                  <div key={product.id} className="product-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleCheckboxChange(product.id)}
                      />
                      {product.name}
                    </label>
                  </div>
                )
              )}
            </div>

            <div className="inputs">
              <label>Água (L): <input type="number" value={water} onChange={(e) => setWater(e.target.value)} /></label>
              <label>Energia (kWh): <input type="number" value={energy} onChange={(e) => setEnergy(e.target.value)} /></label>
              <label>Resíduos (kg): <input type="number" value={waste} onChange={(e) => setWaste(e.target.value)} /></label>
            </div>

            <div className="modal-buttons">
              <button className="confirm" onClick={confirmFinish}>Confirmar</button>
              <button className="cancel" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Ação */}
      {showActionModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Adicionar Ação</h3>
            <textarea
              placeholder="Descreva a ação efetuada..."
              value={actionDescription}
              onChange={(e) => setActionDescription(e.target.value)}
            />
            <label>Duração (minutos):</label>
            <input
              type="number"
              value={actionDuration}
              onChange={(e) => setActionDuration(e.target.value)}
            />
            <p>Seleciona os produtos afetados:</p>
            <div className="product-grid">
              {processData.products?.map((product) =>
                discardedProducts.includes(product.id) ? null : (
                  <div key={product.id} className="product-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={actionProducts.includes(product.id)}
                        onChange={() =>
                          setActionProducts((prev) =>
                            prev.includes(product.id)
                              ? prev.filter((id) => id !== product.id)
                              : [...prev, product.id]
                          )
                        }
                      />
                      {product.name}
                    </label>
                  </div>
                )
              )}
            </div>

            <div className="modal-buttons">
              <button
                className="confirm"
                onClick={() => {
                  if (!actionDescription || !actionDuration || actionProducts.length === 0) {
                    alert("Preencha todos os campos.");
                    return;
                  }

                  setActionsLog([
                    ...actionsLog,
                    {
                      description: actionDescription,
                      duration: actionDuration,
                      products: actionProducts.map((id) =>
                        processData.products.find((p) => p.id === id)?.name
                      ),
                    },
                  ]);
                  setActionDescription("");
                  setActionDuration("");
                  setActionProducts([]);
                  setShowActionModal(false);
                }}
              >
                Confirmar
              </button>
              <button className="cancel" onClick={() => setShowActionModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Descartar Unidades */}
      {showDiscardModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Descartar Unidades</h3>
            <p>Seleciona os produtos a descartar:</p>
            <div className="product-grid">
              {processData.products?.map((product) =>
                discardedProducts.includes(product.id) ? null : (
                  <div key={product.id} className="product-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={discardedProducts.includes(product.id)}
                        onChange={() =>
                          setDiscardedProducts((prev) =>
                            prev.includes(product.id)
                              ? prev.filter((id) => id !== product.id)
                              : [...prev, product.id]
                          )
                        }
                      />
                      {product.name}
                    </label>
                  </div>
                )
              )}
            </div>
            <div className="modal-buttons">
              <button className="confirm" onClick={() => setShowDiscardModal(false)}>Confirmar</button>
              <button className="cancel" onClick={() => setShowDiscardModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

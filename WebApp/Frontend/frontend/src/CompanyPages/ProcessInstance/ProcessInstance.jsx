import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Navbar from "../../Components/CompanyNavbar/CompanyNavbar";
import "./ProcessInstance.scss";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";



export default function ProcessInstance() {
  const { state } = useLocation();
  const [processData, setProcessData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [water, setWater] = useState("");
  const [energy, setEnergy] = useState("");
  const [waste, setWaste] = useState("");

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
        console.log("Process data:", response.data);
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

    // atualizar dados do backend
    axios.post("http://127.0.0.1:8000/api/advance-process", finishData)
      .then((response) => {
        console.log("Process finished successfully:", response.data);

        // Aqui você pode redirecionar ou atualizar a página
        alert("Processo finalizado com sucesso!");
        })
        .catch((error) => {
        console.error("Error finishing process:", error);
        alert("Erro ao finalizar o processo. Tente novamente.");
    });

    setShowModal(false);
    setSelectedProducts([]);
    //navigate back
    window.history.back();
  };

  // 👇 Verifica se os dados já foram carregados
  if (!processData) return <div>Carregando dados do processo...</div>;

  const getColor = (param) => {
    const value = param.last_value;
    const min = param.alerts[0].min;
    const max = param.alerts[0].max;

    if (value < min) return "#2196f3"; // azul
    if (value > max) return "#d50000"; // vermelho
    return "#00c853"; // verde
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
            <button className="finish-btn" onClick={() => setShowModal(true)}>
                Terminar Processo
              </button>
        </div>
        <div className="columns">
          {/* Coluna Esquerda */}
          <div className="left-column">
            <div className="header">
              <h2>{processData?.type} - Lote {state.process.batch}</h2>
              <p>Iniciado em: {formatDate(processData.start_date)}</p>
              {processData.chain_position === 1 && (
                <p><strong>Quantidade de Leite:</strong> {processData.raw_materials[0].quantity_used} L</p>
              )}
            </div>

            {/* Tabela de Máquinas */}
            {processData.machines?.map((machine, index) => (
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
                    {machine.iot_nodes?.map((sensor, pid) => (
                      <tr key={pid}>
                        <td>{sensor.name}</td>
                        <td>{sensor.parameters[0].name}</td>
                        <td>{sensor.parameters[0].last_value}{sensor.parameters[0].unit}</td>
                        <td>
                          {sensor.parameters?.[0]?.alerts?.length > 0 ? (
                            <span className="alert-icon alert">
                                {sensor.parameters[0].alerts[0].type === "critical" ? "🔴" : "⚠️"}
                            </span>
                            ) : (
                            <span className="alert-icon ok">🟢</span>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Coluna Direita */}
          <div className="right-column">
            <div className="gauges">
                {processData?.machines?.flatMap((machine) =>
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
                            data={[
                            {
                                name: `${param.name}`,
                                value: Math.min((param.last_value / param.alerts[0].max) * 100, 100),
                                fill: getColor(param),
                            },
                            ]}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar
                                minAngle={15}
                                background
                                clockWise
                                dataKey="value"
                                cornerRadius={5}
                            />
                            <text
                            x={100}
                            y={180}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontSize: "2rem", fill: "#333" }}
                            >
                            {`${param.last_value} ${param.unit}`}
                            </text>
                        </RadialBarChart>
                        </div>
                    ))
                )
                )}
            </div>
          </div>
        </div>
        <div className="sensor-history-data">
          <h2>Histórico dos Sensores</h2>
          {processData?.machines?.flatMap((machine) =>
            machine.iot_nodes.flatMap((node) =>
              node.parameters.map((param, idx) => {
                const history = param.history || []; // ou busca de API
                
                const formattedData = history.map((entry) => {
                   const date = new Date(entry.timestamp);

                  return {
                    value: entry.value,
                    time: date.toLocaleTimeString("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }),
                    day: date.getDate(),
                    month: date.getMonth() + 1,
                    year: date.getFullYear(),
                    fullDateTime: date.toLocaleString("pt-PT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }),
                  };
                });

                return (
                  <div className="history-chart" key={`${node.name}-${param.name}-history-${idx}`}>
                    <h3>{`Máquina - ${machine.type}`}</h3>
                    <h4>{`${node.name} - ${param.name}`}</h4>
                    {formattedData.length === 0 ? (
                      <p>Sem dados históricos disponíveis.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={formattedData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="fullDateTime" />
                          <YAxis domain={['auto', 'auto']} unit={param.unit} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={getColor(param)}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Finalizar Processo</h3>
            <p>Seleciona os produtos que permanecem neste processo:</p>
            <div className="product-grid">
              {processData.products?.map((product) => (
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
              ))}
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
    </div>
  );
}

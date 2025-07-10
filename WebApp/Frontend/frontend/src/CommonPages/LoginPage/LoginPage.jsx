import "./LoginPage.scss";
//importar logo do Estrela Geopark
import React from "react";
import { useState } from "react";
import logo from "../../Assets/GeoparkLogo.svg";
import axios from "axios"; 
//import navigation do react-router-dom
import { useNavigate } from "react-router-dom";

export default function LoginPage() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Função para lidar com o envio do formulário
    const handleSubmit = (event) => {
        event.preventDefault(); // Previne o comportamento padrão do formulário

        console.log("Email:", email);
        console.log("Password:", password);

        // Redirecionar ou exibir mensagem de sucesso/erro
        axios.post('http://127.0.0.1:8000/api/login/', { email, password })
        .then(response => {
            // guardar o objeto da resposta no localStorage
            localStorage.setItem('user', JSON.stringify(response.data));
            console.log("Login successful:", response.data);
            
            if(response.data.user_type === 'PolicyMaker') {
                console.log("User type is Policy Maker");
                navigate('/policy-maker/homepage'); // Redirecionar para o dashboard do Policy Maker
            }else if(response.data.user_type === 'Regulator') {
                navigate('/regulator/homepage'); 
            }
            else if(response.data.user_type === 'Company') {
                navigate('/company/homepage'); 
            }
        })
    }


  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <img src={logo} alt="Estrela Geopark Logo" />
        </div>
        <h2 className="title">Iniciar Sessão</h2>
        <form className="login-form">
          <label htmlFor="email">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Introduza o seu email" required />

          <label htmlFor="password">Palavra-passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Introduza a sua palavra-passe" required />

          <button type="submit" onClick={handleSubmit}>Entrar</button>
        </form>
      </div>
    </div>
  );
}
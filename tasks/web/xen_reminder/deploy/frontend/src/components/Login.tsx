import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onToggleForm: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggleForm }) => {
  const { login, loading, error, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.username, formData.password);
      // useEffect handles redirect
    } catch (err) {
      // Error is handled in the AuthContext dawg
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Войти</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">Имя пользователя</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Введите имя пользователя"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Введите пароль"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Войти'}
        </button>
      </form>
      <p className="auth-toggle">
        Нет аккаунта?{' '}
        <button className="link-button" onClick={onToggleForm}>
          Зарегистрироваться
        </button>
      </p>
    </div>
  );
};

export default Login;

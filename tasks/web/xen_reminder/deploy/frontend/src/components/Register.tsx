import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterProps {
  onToggleForm: () => void;
}

const Register: React.FC<RegisterProps> = ({ onToggleForm }) => {
  const { register, loading, error, isAuthenticated } = useAuth();
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
      await register(formData.username, formData.password);
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Зарегистрироваться</h2>
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
            placeholder="Выберите имя пользователя"
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
            placeholder="Выберите пароль"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </form>
      <p className="auth-toggle">
        Уже есть аккаунт?{' '}
        <button className="link-button" onClick={onToggleForm}>
          Войти
        </button>
      </p>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { Buffer } from 'buffer/';

interface Reminder {
  id: number;
  title: string;
  content: string;
  remind_at: string;
  created_at: string;
}

interface RemindersListProps {
  token: string;
}

const fetcher = (url: string, token: string) => 
  axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.data || []);

const RemindersList: React.FC<RemindersListProps> = ({ token }) => {
  const [error, setError] = useState<string | null>(null);
  
  const { data: reminders = [], mutate, isValidating } = useSWR(
    token ? ['/api/reminders', token] : null,
    ([url, token]) => fetcher(url, token),
    {
      refreshInterval: 10000, // 10s
      onError: (err) => {
        setError('Не удалось загрузить напоминания. Попробуйте позже.');
        console.error(err);
      }
    }
  );
  
  const loading = isValidating;

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это напоминание?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/reminders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      mutate();
    } catch (err) {
      setError('Не удалось удалить напоминание. Попробуйте позже.');
      console.error(err);
    }
  };

  return (
    <section className="reminders-list-section">
      <h2>Ваши напоминания</h2>
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}
      
      {reminders.length === 0 && !loading ? (
        <div className="no-reminders">Нет напоминаний. Создайте новое!</div>
      ) : (
        <ul className="reminders-list">
          {reminders.map((reminder: Reminder) => (
            <li key={reminder.id} className="reminder-item">
              <div className="reminder-header">
                <h3>{reminder.title}</h3>
                <button 
                  className="delete-button"
                  onClick={() => handleDelete(reminder.id)}
                >
                  Удалить
                </button>
              </div>
              <p className="reminder-content">
                {reminder.content ? 
                  (() => {
                    try {
                      return Buffer.from(reminder.content, "base64").toString("utf-8");
                    } catch (e) {
                      return reminder.content; // fallback for when backend has schizophrenia
                    }
                  })()
                  : ''}
              </p>
              <div className="reminder-meta">
                <span className="reminder-time">
                   Напоминание: {new Date(reminder.remind_at).toLocaleString()}
                </span>
                <span className="reminder-created">
                  Создано: {new Date(reminder.created_at).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default RemindersList;

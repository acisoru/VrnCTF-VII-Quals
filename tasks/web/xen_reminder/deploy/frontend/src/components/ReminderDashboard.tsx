import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import RemindersList from './RemindersList';
import { Buffer } from 'buffer/';



interface ReminderFormData {
  title: string;
  content: string;
  remind_at: string;
}



const ReminderDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    content: '',
    remind_at: format(new Date(Date.now() + 5 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"), // +5 mins because ifykyk
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Base64 encode the content
      const base64Content = Buffer.from(formData.content).toString('base64');
      
      const reminderToSubmit = {
        title: formData.title,
        content: base64Content,
        remind_at: new Date(formData.remind_at).toISOString(),
      };
      
      await axios.post('/api/reminders', reminderToSubmit, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        remind_at: format(new Date(Date.now() + 5 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      });
      
      setSuccessMessage('Напоминание создано!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Trigger refresh of the reminders list
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось создать напоминание. Попробуйте позже.');
      console.error(err);
    }
  };



  return (
    <main className="app-main">
      <section className="reminder-form-section">
        <h2>Создать новое напоминание</h2>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className="reminder-form">
          <div className="form-group">
            <label htmlFor="title">Заголовок</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Введите заголовок напоминания"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Содержимое</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              placeholder="О чем вам напомнить?"
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="remind_at">Время напоминания</label>
            <input
              type="datetime-local"
              id="remind_at"
              name="remind_at"
              value={formData.remind_at}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit">Создать напоминание</button>
        </form>
      </section>

      {token && <RemindersList token={token} key={refreshTrigger} />}
    </main>
  );
};

export default ReminderDashboard;

import { useEffect, useState } from 'react';
import { api } from './api/client';

interface Slot {
  id: number;
  doctor_name: string;
  specialization: string;
  start_time: string;
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
}

function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchSlots = async () => {
    try {
      const response = await api.get('/slots');
      setSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setMsg("❌ Error connecting to backend.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleBook = async (slotId: number) => {
    setMsg("⏳ Booking...");
    try {
      await api.post('/book', { userId: 1, slotId });
      setMsg("✅ Booking Confirmed!");
      fetchSlots();
    } catch (error: any) {
      setMsg(`❌ ${error.response?.data?.error || "Booking Failed"}`);
      fetchSlots();
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🏥 Modex Doctor Appointments</h1>
      {msg && <div style={{ padding: '10px', margin: '20px 0', borderRadius: '5px', textAlign: 'center', backgroundColor: msg.includes('✅') ? '#d4edda' : '#f8d7da', color: msg.includes('✅') ? '#155724' : '#721c24' }}>{msg}</div>}
      {loading ? <p style={{ textAlign: 'center' }}>Loading doctors...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {slots.map((slot) => (
            <div key={slot.id} style={{ border: '1px solid #e0e0e0', borderRadius: '10px', padding: '20px', backgroundColor: slot.status === 'AVAILABLE' ? '#fff' : '#f9f9f9', opacity: slot.status === 'AVAILABLE' ? 1 : 0.7 }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{slot.doctor_name}</h3>
              <span style={{ backgroundColor: '#e3f2fd', color: '#1565c0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{slot.specialization}</span>
              <p>📅 {new Date(slot.start_time).toLocaleString()}</p>
              <button onClick={() => handleBook(slot.id)} disabled={slot.status !== 'AVAILABLE'} style={{ width: '100%', padding: '12px', marginTop: '10px', backgroundColor: slot.status === 'AVAILABLE' ? '#28a745' : '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'not-allowed' }}>{slot.status === 'AVAILABLE' ? 'BOOK APPOINTMENT' : slot.status}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default App;
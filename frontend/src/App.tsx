import { useEffect, useState } from 'react';
import { api } from './api/client';

// 1. Define the shape of our data
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

  // 2. Fetch Slots from Backend on load
  const fetchSlots = async () => {
    try {
      const response = await api.get('/slots');
      setSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setMsg("❌ Error connecting to backend. Is it running?");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // 3. Handle Booking (The Transaction)
  const handleBook = async (slotId: number) => {
    // Optimistic update: show it as booked immediately
    setMsg("⏳ Booking...");
    
    try {
      // Hardcoded user ID for now (Phase 1)
      await api.post('/book', { userId: 1, slotId });
      setMsg("✅ Booking Confirmed!");
      fetchSlots(); // Refresh the list to show new status
    } catch (error: any) {
      // If error, show message
      const errorMsg = error.response?.data?.error || "Booking Failed";
      setMsg(`❌ ${errorMsg}`);
      fetchSlots(); // Refresh to show true status
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🏥 Modex Doctor Appointments</h1>
      
      {msg && <div style={{ 
        padding: '10px', margin: '20px 0', borderRadius: '5px', textAlign: 'center',
        backgroundColor: msg.includes('✅') ? '#d4edda' : '#f8d7da',
        color: msg.includes('✅') ? '#155724' : '#721c24'
      }}>
        {msg}
      </div>}

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading doctors...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {slots.map((slot) => (
            <div key={slot.id} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '20px',
              backgroundColor: slot.status === 'AVAILABLE' ? '#fff' : '#f9f9f9',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              opacity: slot.status === 'AVAILABLE' ? 1 : 0.7
            }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{slot.doctor_name}</h3>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ 
                  backgroundColor: '#e3f2fd', color: '#1565c0', 
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold'
                }}>
                  {slot.specialization}
                </span>
              </div>
              
              <p style={{ color: '#555', fontSize: '0.95rem' }}>
                📅 {new Date(slot.start_time).toLocaleString()}
              </p>

              <button 
                onClick={() => handleBook(slot.id)}
                disabled={slot.status !== 'AVAILABLE'}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '10px',
                  backgroundColor: slot.status === 'AVAILABLE' ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s'
                }}
              >
                {slot.status === 'AVAILABLE' ? 'BOOK APPOINTMENT' : slot.status}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
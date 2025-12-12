import React, { useEffect, useState } from 'react';
import { api } from './api/client';

// --- Types ---
interface Slot {
  id: number;
  doctor_name: string;
  specialization: string;
  start_time: string;
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
}

// --- Helpers ---
const getDoctorImage = (name: string) => {
  if (name.includes('Sathish')) return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1470&auto=format&fit=crop';
  if (name.includes('Michael')) return 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1470&auto=format&fit=crop';
  if (name.includes('Anjali')) return 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1470&auto=format&fit=crop';
  if (name.includes('Emily')) return 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1374&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop';
};

const triageSymptom = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('heart') || lower.includes('chest')) return 'Cardiology';
  if (lower.includes('skin') || lower.includes('rash')) return 'Dermatology';
  if (lower.includes('head')) return 'Neurology';
  return '';
};

// --- Loader Component ---
const Loader = () => (
  <div style={{ 
    position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', 
    justifyContent: 'center', alignItems: 'center', zIndex: 9999,
    backgroundImage: 'url("https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop")',
    backgroundSize: 'cover'
  }}>
    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(44, 62, 80, 0.9)' }}></div>
    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
      <div className="heartbeat" style={{ fontSize: '80px' }}>❤️</div>
      <h2 style={{ color: 'white', marginTop: '20px', fontWeight: 300 }}>AI Health Core Initializing...</h2>
      <div className="spinner" style={{
        width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.3)',
        borderTop: '4px solid #3498db', borderRadius: '50%', margin: '20px auto'
      }}></div>
    </div>
  </div>
);

function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [symptom, setSymptom] = useState('');
  const [insuranceVerified, setInsuranceVerified] = useState(false);

  const fetchSlots = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Fake animation delay
      const response = await api.get('/slots');
      setSlots(response.data);
      setFilteredSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setMsg("❌ Error connecting to backend.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  useEffect(() => {
    if (!symptom) { setFilteredSlots(slots); return; }
    const specialty = triageSymptom(symptom);
    if (specialty) {
      setFilteredSlots(slots.filter(s => s.specialization.includes(specialty)));
    } else {
      setFilteredSlots(slots.filter(s => s.doctor_name.toLowerCase().includes(symptom.toLowerCase())));
    }
  }, [symptom, slots]);

  const handleBook = async (slotId: number) => {
    setMsg("⏳ AI Guardian is securing your slot...");
    try {
      await api.post('/book', { userId: 1, slotId });
      setMsg("✅ Appointment Confirmed!");
      fetchSlots();
    } catch (error: any) {
      setMsg(`❌ ${error.response?.data?.error || "Booking Failed"}`);
      fetchSlots();
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ 
      minHeight: '100vh', paddingBottom: '50px', position: 'relative',
      backgroundImage: 'url("https://images.unsplash.com/photo-1586773860418-d37222d8f621?q=80&w=2070&auto=format&fit=crop")',
      backgroundSize: 'cover', backgroundAttachment: 'fixed'
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(240, 244, 248, 0.92)' }}></div>
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', color: 'white', padding: '50px 20px', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 800 }}>🏥 Modex AI Health</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>Your Intelligent Path to Wellness</p>
          
          <div style={{ position: 'relative', maxWidth: '600px', margin: '30px auto 0' }}>
            <input 
              type="text" placeholder="Describe symptoms (e.g., 'chest pain')..." 
              value={symptom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSymptom(e.target.value)}
              style={{ width: '100%', padding: '15px 25px', borderRadius: '50px', border: 'none', fontSize: '1.1rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px', textAlign: 'right' }}>
          <button onClick={() => setInsuranceVerified(!insuranceVerified)} style={{ background: insuranceVerified ? '#2ecc71' : 'rgba(0,0,0,0.5)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
            {insuranceVerified ? '🛡️ Insurance Verified' : '🛡️ Check Eligibility'}
          </button>
        </div>

        {msg && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, padding: '15px 30px', borderRadius: '50px', fontWeight: 'bold', color: 'white', backgroundColor: msg.includes('✅') ? '#2ecc71' : '#e74c3c' }}>{msg}</div>}

        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '35px', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          {filteredSlots.map((slot) => (
            <div key={slot.id} style={{ 
              backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(0,0,0,0.08)', 
              opacity: slot.status === 'AVAILABLE' ? 1 : 0.7, 
              filter: slot.status === 'AVAILABLE' ? 'none' : 'grayscale(80%)'
            }}>
              <div style={{ position: 'relative', height: '220px' }}>
                <img src={getDoctorImage(slot.doctor_name)} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px', paddingTop: '60px' }}>
                  <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{slot.doctor_name}</h2>
                  <span style={{ background: '#3498db', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>{slot.specialization}</span>
                </div>
              </div>
              <div style={{ padding: '25px' }}>
                <button 
                  onClick={() => handleBook(slot.id)}
                  disabled={slot.status !== 'AVAILABLE'}
                  className={slot.status === 'AVAILABLE' ? 'pulse-button' : ''}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
                    background: slot.status === 'AVAILABLE' ? 'linear-gradient(to right, #11998e, #38ef7d)' : '#bdc3c7',
                    color: 'white', fontWeight: 800, fontSize: '1rem', cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'not-allowed'
                  }}
                >
                  {slot.status === 'AVAILABLE' ? '⚡ BOOK INSTANTLY' : '⛔ SLOT TAKEN'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
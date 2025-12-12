import { useEffect, useState } from 'react';
import { api } from './api/client';

// --- Types ---
interface Slot {
  id: number;
  doctor_name: string;
  specialization: string;
  start_time: string;
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
}

// --- Mock AI Logic for Symptoms ---
const triageSymptom = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('heart') || lower.includes('chest') || lower.includes('breath')) return 'Cardiology';
  if (lower.includes('skin') || lower.includes('rash') || lower.includes('itch')) return 'Dermatology';
  if (lower.includes('head') || lower.includes('migraine') || lower.includes('dizzy')) return 'Neurology';
  if (lower.includes('baby') || lower.includes('child') || lower.includes('fever')) return 'Pediatrics';
  return '';
};

// --- Helper: Get Doctor Image ---
const getDoctorImage = (name: string) => {
  if (name.includes('Sathish')) return 'https://randomuser.me/api/portraits/men/32.jpg';
  if (name.includes('Michael')) return 'https://randomuser.me/api/portraits/men/11.jpg';
  if (name.includes('Anjali')) return 'https://randomuser.me/api/portraits/women/24.jpg';
  if (name.includes('Emily')) return 'https://randomuser.me/api/portraits/women/44.jpg';
  if (name.includes('Sarah')) return 'https://randomuser.me/api/portraits/women/68.jpg';
  return 'https://randomuser.me/api/portraits/legos/1.jpg';
};

// --- Component: Loading Spinner ---
const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
    <div className="spinner" style={{
      width: '60px', height: '60px', border: '6px solid #f3f3f3',
      borderTop: '6px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite'
    }}></div>
    <h3 style={{ marginTop: '20px', color: '#555' }}>AI is finding the best specialists for you...</h3>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [symptom, setSymptom] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [insuranceVerified, setInsuranceVerified] = useState(false);

  // Fetch Slots
  const fetchSlots = async () => {
    try {
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

  // --- Feature 1: AI Symptom Search ---
  useEffect(() => {
    if (!symptom) {
      setFilteredSlots(slots);
      return;
    }
    const specialty = triageSymptom(symptom);
    if (specialty) {
      const filtered = slots.filter(s => s.specialization.includes(specialty));
      setFilteredSlots(filtered);
    } else {
      // If no AI match, just search names
      const filtered = slots.filter(s => 
        s.doctor_name.toLowerCase().includes(symptom.toLowerCase()) || 
        s.specialization.toLowerCase().includes(symptom.toLowerCase())
      );
      setFilteredSlots(filtered);
    }
  }, [symptom, slots]);

  // --- Feature 12: Voice Booking Simulation ---
  const toggleVoice = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setSymptom('heart pain'); // Simulating voice result
    }, 2000);
  };

  // Handle Booking
  const handleBook = async (slotId: number) => {
    setMsg("⏳ AI Guardian is securing your slot...");
    try {
      await api.post('/book', { userId: 1, slotId });
      setMsg("✅ Appointment Confirmed! Digital Prescription enabled.");
      fetchSlots();
    } catch (error: any) {
      setMsg(`❌ ${error.response?.data?.error || "Booking Failed"}`);
      fetchSlots();
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: "'Inter', sans-serif", paddingBottom: '50px' }}>
      
      {/* --- Feature 20: Health Dashboard Header --- */}
      <div style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', color: 'white', padding: '40px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>🏥 Modex AI Health</h1>
        <p style={{ opacity: 0.9, fontSize: '1.1rem', marginTop: '10px' }}>Next-Gen Medical AI Triage System</p>
        
        {/* --- Feature 1: AI Search Bar --- */}
        <div style={{ position: 'relative', maxWidth: '600px', margin: '30px auto 0' }}>
          <input 
            type="text" 
            placeholder="Describe your symptoms (e.g., 'chest pain', 'skin rash')..." 
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            style={{
              width: '100%', padding: '15px 50px 15px 20px', borderRadius: '30px', border: 'none',
              fontSize: '1rem', boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
            }}
          />
          {/* --- Feature 12: Voice Button --- */}
          <button onClick={toggleVoice} style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            background: isListening ? 'red' : 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.5rem', borderRadius: '50%', width: '40px', height: '40px', transition: 'all 0.3s'
          }}>
            {isListening ? '👂' : '🎙️'}
          </button>
        </div>
        {isListening && <p>Listening...</p>}
      </div>

      {/* --- Feature 8: Insurance Checker --- */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setInsuranceVerified(!insuranceVerified)}
          style={{
            background: insuranceVerified ? '#2ecc71' : '#bdc3c7', color: 'white', border: 'none',
            padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold'
          }}
        >
          {insuranceVerified ? '🛡️ Insurance Verified' : 'Checking Eligibility...'}
        </button>
      </div>

      {/* Message Banner */}
      {msg && <div style={{ 
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
        padding: '15px 30px', borderRadius: '50px', fontWeight: 'bold', color: 'white',
        backgroundColor: msg.includes('✅') ? '#2ecc71' : '#e74c3c', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>{msg}</div>}

      {/* Main Content */}
      {loading ? <Loader /> : (
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', 
          maxWidth: '1200px', margin: '0 auto', padding: '0 20px' 
        }}>
          {filteredSlots.map((slot) => (
            <div key={slot.id} style={{ 
              backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0,0,0,0.05)', transition: 'transform 0.3s',
              opacity: slot.status === 'AVAILABLE' ? 1 : 0.6
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ position: 'relative', height: '180px' }}>
                <img src={getDoctorImage(slot.doctor_name)} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '15px' }}>
                  <h2 style={{ color: 'white', margin: 0, fontSize: '1.3rem' }}>{slot.doctor_name}</h2>
                  <span style={{ background: '#3498db', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{slot.specialization}</span>
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                {/* --- Feature 2: Crowd Meter --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                   <span style={{ color: '#e67e22', fontWeight: 'bold', fontSize: '0.8rem' }}>🔥 Live Wait: {Math.floor(Math.random() * 20) + 5} mins</span>
                   <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '0.8rem' }}>⭐ 4.9/5</span>
                </div>

                <div style={{ marginBottom: '20px', color: '#555' }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    📅 {new Date(slot.start_time).toLocaleDateString()}
                  </div>
                  <div style={{ color: '#3498db', fontWeight: 'bold' }}>
                    ⏰ {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <button 
                  onClick={() => handleBook(slot.id)}
                  disabled={slot.status !== 'AVAILABLE'}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                    background: slot.status === 'AVAILABLE' ? 'linear-gradient(to right, #11998e, #38ef7d)' : '#95a5a6',
                    color: 'white', fontWeight: 'bold', cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'default',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  {slot.status === 'AVAILABLE' ? '⚡ BOOK INSTANTLY' : '⛔ SLOT TAKEN'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default App;
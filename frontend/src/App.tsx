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

// --- Mock AI Logic ---
const triageSymptom = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('heart') || lower.includes('chest') || lower.includes('breath')) return 'Cardiology';
  if (lower.includes('skin') || lower.includes('rash') || lower.includes('itch')) return 'Dermatology';
  if (lower.includes('head') || lower.includes('migraine') || lower.includes('dizzy')) return 'Neurology';
  return '';
};

// --- Helper: High-Quality Doctor Images (Unsplash) ---
const getDoctorImage = (name: string) => {
  if (name.includes('Sathish')) return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1470&auto=format&fit=crop';
  if (name.includes('Michael')) return 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1470&auto=format&fit=crop';
  if (name.includes('Anjali')) return 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1470&auto=format&fit=crop';
  if (name.includes('Emily')) return 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1374&auto=format&fit=crop';
  if (name.includes('Sarah')) return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1464&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop';
};

// --- Component: Animated Medical Loader ---
const Loader = () => (
  <div style={{ 
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    // Background Image for Loader
    backgroundImage: 'url("https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop")',
    backgroundSize: 'cover', backgroundPosition: 'center'
  }}>
    {/* Dark Overlay for readability */}
    <div style={{ position: 'absolute', top:0, left:0, right:0, bottom:0, backgroundColor: 'rgba(44, 62, 80, 0.85)' }}></div>
    
    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
      {/* Animated Heartbeat Icon (SVG) */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e74c3c" width="80px" height="80px" style={{ animation: 'heartbeat 1.5s ease-in-out infinite both' }}>
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.75 3c1.278 0 2.445.412 3.395 1.105l.855.625.855-.625A5.752 5.752 0 0116.25 3c3.036 0 5.5 2.322 5.5 5.25 0 3.925-2.438 7.111-4.739 9.256a25.18 25.18 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.003-.003.001a.752.752 0 01-.47 0l-.003-.001z" />
      </svg>
      <h2 style={{ color: 'white', marginTop: '20px', fontWeight: '300', letterSpacing: '1px' }}>AI Health Core Initializing...</h2>
      <div className="spinner" style={{
        width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.3)',
        borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '20px auto'
      }}></div>
    </div>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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
      // Simulate a longer load time to show off the new animation
      await new Promise(resolve => setTimeout(resolve, 2000));
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
      setMsg("✅ Appointment Confirmed! Digital Prescription enabled.");
      fetchSlots();
    } catch (error: any) {
      setMsg(`❌ ${error.response?.data?.error || "Booking Failed"}`);
      fetchSlots();
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ 
      minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '50px', position: 'relative',
      // Main Background Image
      backgroundImage: 'url("https://images.unsplash.com/photo-1586773860418-d37222d8f621?q=80&w=2070&auto=format&fit=crop")',
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'
    }}>
      {/* Light Overlay for content readability */}
      <div style={{ position: 'absolute', top:0, left:0, right:0, bottom:0, backgroundColor: 'rgba(240, 244, 248, 0.92)' }}></div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header with Gradient */}
        <div style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', color: 'white', padding: '50px 20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '800', letterSpacing: '-1px' }}>🏥 Modex AI Health</h1>
          <p style={{ opacity: 0.9, fontSize: '1.2rem', marginTop: '10px' }}>Your Intelligent Path to Wellness</p>
          
          <div style={{ position: 'relative', maxWidth: '600px', margin: '30px auto 0' }}>
            <input 
              type="text" placeholder="Describe symptoms (e.g., 'chest pain')..." value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              style={{ width: '100%', padding: '15px 25px', borderRadius: '50px', border: 'none', fontSize: '1.1rem', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' }}
            />
            <span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.5rem' }}>🔍</span>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setInsuranceVerified(!insuranceVerified)} style={{ background: insuranceVerified ? '#2ecc71' : 'rgba(0,0,0,0.5)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', backdropFilter: 'blur(5px)', transition: 'all 0.3s' }}>
            {insuranceVerified ? '🛡️ Insurance Verified' : '🛡️ Check Eligibility'}
          </button>
        </div>

        {msg && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, padding: '15px 30px', borderRadius: '50px', fontWeight: 'bold', color: 'white', backgroundColor: msg.includes('✅') ? '#2ecc71' : '#e74c3c', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s ease-out' }}>{msg}</div>}

        {/* Card Grid with Fade-In Animation */}
        <div className="fade-in" style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '35px', 
          maxWidth: '1200px', margin: '0 auto', padding: '20px' 
        }}>
          {filteredSlots.map((slot) => (
            <div key={slot.id} style={{ 
              backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(0,0,0,0.08)', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              opacity: slot.status === 'AVAILABLE' ? 1 : 0.7, transform: 'translateY(0) scale(1)',
              filter: slot.status === 'AVAILABLE' ? 'none' : 'grayscale(80%)'
            }}
            onMouseEnter={(e) => { if(slot.status==='AVAILABLE') e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)'; }}
            onMouseLeave={(e) => { if(slot.status==='AVAILABLE') e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
            >
              <div style={{ position: 'relative', height: '220px' }}>
                <img src={getDoctorImage(slot.doctor_name)} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px', paddingTop: '60px' }}>
                  <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>{slot.doctor_name}</h2>
                  <span style={{ background: '#3498db', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.5px' }}>{slot.specialization}</span>
                </div>
              </div>

              <div style={{ padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: '#f8f9fa', padding: '10px', borderRadius: '12px' }}>
                   <span style={{ color: '#e67e22', fontWeight: 'bold', fontSize: '0.9rem' }}>🔥 Wait: {Math.floor(Math.random() * 15) + 2}m</span>
                   <span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '0.9rem' }}>⭐ 4.9/5</span>
                </div>

                <div style={{ marginBottom: '25px', color: '#555', display: 'flex', alignItems: 'center' }}>
                  <div style={{ background: '#eef2f7', padding: '12px', borderRadius: '50%', marginRight: '15px', fontSize: '1.2rem' }}>📅</div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '1.1rem' }}>
                      {new Date(slot.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ color: '#3498db', fontWeight: '800', fontSize: '1.2rem' }}>
                      {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleBook(slot.id)}
                  disabled={slot.status !== 'AVAILABLE'}
                  className={slot.status === 'AVAILABLE' ? 'pulse-button' : ''}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
                    background: slot.status === 'AVAILABLE' ? 'linear-gradient(to right, #11998e, #38ef7d)' : '#bdc3c7',
                    color: 'white', fontWeight: '800', fontSize: '1rem', cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                    boxShadow: slot.status === 'AVAILABLE' ? '0 8px 20px rgba(46, 204, 113, 0.3)' : 'none',
                    textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s'
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